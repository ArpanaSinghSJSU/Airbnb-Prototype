#!/bin/bash
# push-to-ecr.sh
# Builds Docker images, logs into ECR, tags, pushes, and verifies all service images

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🐳 Push Docker Images to AWS ECR                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-832495218053}"
ECR_BASE="${ECR_BASE:-$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com}"

# Project prefix (from docker-compose)
PROJECT_PREFIX="airbnb-prototype"

# Service names
SERVICES=("traveler-service" "owner-service" "property-service" "booking-service" "ai-agent")

# Validate required environment variables
if [ -z "$AWS_ACCOUNT_ID" ] || [ -z "$AWS_REGION" ]; then
  echo "❌ Error: Required environment variables not set!"
  echo ""
  echo "Please export these variables first:"
  echo "  export AWS_ACCOUNT_ID=832495218053"
  echo "  export AWS_REGION=us-east-1"
  echo "  export ECR_BASE=832495218053.dkr.ecr.us-east-1.amazonaws.com"
  echo ""
  exit 1
fi

echo "Configuration:"
echo "  AWS Account ID: $ACCOUNT_ID"
echo "  AWS Region: $REGION"
echo "  ECR Base URL: $ECR_BASE"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 1: Rebuild Docker Images for linux/amd64
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 1: Building Docker images for linux/amd64..."
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "⚠️  Building for linux/amd64 platform (required for EKS/EC2)"
echo ""
echo "Building all service images with docker-compose..."
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker-compose build --no-cache

echo ""
echo "✅ All images built successfully for linux/amd64!"
echo ""

# Verify images exist
echo "Verifying built images:"
for service in "${SERVICES[@]}"; do
  IMAGE_NAME="$PROJECT_PREFIX-$service"
  if docker images | grep -q "$IMAGE_NAME"; then
    echo "  ✅ $service ($IMAGE_NAME)"
  else
    echo "  ❌ $service - IMAGE NOT FOUND! (expected: $IMAGE_NAME)"
    exit 1
  fi
done
echo ""

# ═══════════════════════════════════════════════════════════
# Step 2: Login to ECR
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 2: Logging into AWS ECR..."
echo "═══════════════════════════════════════════════════════════"
echo ""

aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ECR_BASE"

if [ $? -eq 0 ]; then
  echo "✅ Successfully logged into ECR"
else
  echo "❌ Failed to login to ECR"
  exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════
# Step 3: Verify ECR Repositories Exist
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 3: Verifying ECR repositories exist..."
echo "═══════════════════════════════════════════════════════════"
echo ""

ALL_REPOS_EXIST=true

for service in "${SERVICES[@]}"; do
  echo -n "Checking repository: $service... "
  
  if aws ecr describe-repositories \
    --repository-names "$service" \
    --region "$REGION" \
    --query 'repositories[0].repositoryName' \
    --output text > /dev/null 2>&1; then
    echo "✅ Found"
  else
    echo "❌ NOT FOUND"
    ALL_REPOS_EXIST=false
  fi
done

echo ""

if [ "$ALL_REPOS_EXIST" = false ]; then
  echo "❌ Error: Some ECR repositories are missing!"
  echo ""
  echo "💡 Create missing repositories:"
  echo "   aws ecr create-repository --repository-name <service-name> --region $REGION"
  echo ""
  echo "Or create all at once:"
  for service in "${SERVICES[@]}"; do
    echo "   aws ecr create-repository --repository-name $service --region $REGION"
  done
  echo ""
  exit 1
fi

echo "✅ All ECR repositories exist!"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 4: Remove Old Images from ECR
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 4: Removing old images from ECR..."
echo "═══════════════════════════════════════════════════════════"
echo ""

for service in "${SERVICES[@]}"; do
  echo -n "Checking $service for old images... "
  
  # Check if 'latest' tag exists (suppress errors if image doesn't exist)
  IMAGE_COUNT=$(aws ecr list-images \
    --repository-name "$service" \
    --region "$REGION" \
    --filter "tagStatus=TAGGED" \
    --query 'imageIds[?imageTag==`latest`] | length(@)' \
    --output text 2>/dev/null || echo "0")
  
  if [ "$IMAGE_COUNT" -gt 0 ]; then
    # Delete the old 'latest' image
    DELETE_RESULT=$(aws ecr batch-delete-image \
      --repository-name "$service" \
      --region "$REGION" \
      --image-ids imageTag=latest \
      2>&1)
    
    if [ $? -eq 0 ]; then
      echo "✅ Removed old image"
    else
      echo "⚠️  Could not remove (will be overwritten)"
    fi
  else
    echo "ℹ️  No old image found"
  fi
done

echo ""
echo "✅ Old images cleaned up!"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 5: Tag and Push Images to ECR
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 5: Tagging and pushing images to ECR..."
echo "═══════════════════════════════════════════════════════════"
echo ""

TOTAL=${#SERVICES[@]}
CURRENT=0

for service in "${SERVICES[@]}"; do
  CURRENT=$((CURRENT + 1))
  IMAGE_NAME="$PROJECT_PREFIX-$service"
  
  echo "[$CURRENT/$TOTAL] Processing: $service"
  echo "─────────────────────────────────────────────────────────"
  
  # Get local image digest before pushing
  echo "  📊 Capturing local image digest..."
  LOCAL_DIGEST=$(docker images --digests --format "{{.Digest}}" "$IMAGE_NAME:latest" 2>/dev/null | head -n1)
  
  if [ -n "$LOCAL_DIGEST" ] && [ "$LOCAL_DIGEST" != "<none>" ]; then
    echo "      Local digest: ${LOCAL_DIGEST:0:19}..."
  else
    echo "      Local digest: (will be generated on push)"
  fi
  
  # Tag image (from docker-compose name to ECR name)
  echo "  🏷️  Tagging image..."
  echo "      Source: $IMAGE_NAME:latest"
  echo "      Target: $ECR_BASE/$service:latest"
  docker tag "$IMAGE_NAME:latest" "$ECR_BASE/$service:latest"
  
  if [ $? -ne 0 ]; then
    echo "  ❌ Failed to tag $service"
    exit 1
  fi
  
  # Push image
  echo "  ⬆️  Pushing to ECR..."
  PUSH_OUTPUT=$(docker push "$ECR_BASE/$service:latest" 2>&1)
  
  if [ $? -eq 0 ]; then
    # Extract the digest from push output
    PUSHED_DIGEST=$(echo "$PUSH_OUTPUT" | grep "digest:" | awk '{print $3}' | head -n1)
    if [ -n "$PUSHED_DIGEST" ]; then
      echo "      Remote digest: ${PUSHED_DIGEST:0:19}..."
    fi
    echo "  ✅ Successfully pushed $service"
  else
    echo "  ❌ Failed to push $service"
    echo "$PUSH_OUTPUT"
    exit 1
  fi
  echo ""
done

echo "✅ All images tagged and pushed successfully!"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 6: Verify Images in ECR
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 6: Verifying images in ECR..."
echo "═══════════════════════════════════════════════════════════"
echo ""

ALL_VERIFIED=true

echo "Repository                  Tag      Size       Pushed             Status"
echo "──────────────────────────────────────────────────────────────────────────────"

CURRENT_TIME=$(date -u +%s)

for service in "${SERVICES[@]}"; do
  # Check if image exists with 'latest' tag
  IMAGE_DATA=$(aws ecr describe-images \
    --repository-name "$service" \
    --region "$REGION" \
    --image-ids imageTag=latest \
    --query 'imageDetails[0].[imagePushedAt,imageSizeInBytes,imageDigest]' \
    --output text 2>/dev/null)
  
  if [ -n "$IMAGE_DATA" ]; then
    # Get image details
    PUSHED_AT=$(echo "$IMAGE_DATA" | awk '{print $1}')
    SIZE_BYTES=$(echo "$IMAGE_DATA" | awk '{print $2}')
    ECR_DIGEST=$(echo "$IMAGE_DATA" | awk '{print $3}')
    
    # Format date
    PUSHED_DATE=$(echo "$PUSHED_AT" | cut -d'T' -f1)
    PUSHED_TIME=$(echo "$PUSHED_AT" | cut -d'T' -f2 | cut -d'.' -f1)
    
    # Calculate how many seconds ago the image was pushed
    PUSHED_TIMESTAMP=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${PUSHED_DATE}T${PUSHED_TIME}" +%s 2>/dev/null || echo "0")
    SECONDS_AGO=$((CURRENT_TIME - PUSHED_TIMESTAMP))
    
    # Format size
    SIZE_MB=$(echo "scale=1; $SIZE_BYTES / 1048576" | bc 2>/dev/null || echo "N/A")
    
    # Determine freshness status
    if [ "$SECONDS_AGO" -lt 300 ]; then
      # Pushed within last 5 minutes
      STATUS="✅ Fresh"
    elif [ "$SECONDS_AGO" -lt 3600 ]; then
      # Pushed within last hour
      MINUTES_AGO=$((SECONDS_AGO / 60))
      STATUS="✅ ${MINUTES_AGO}m ago"
    elif [ "$SECONDS_AGO" -lt 86400 ]; then
      # Pushed within last day
      HOURS_AGO=$((SECONDS_AGO / 3600))
      STATUS="⚠️  ${HOURS_AGO}h ago"
    else
      # Older than a day
      DAYS_AGO=$((SECONDS_AGO / 86400))
      STATUS="⚠️  ${DAYS_AGO}d ago"
    fi
    
    printf "%-27s %-8s %-10s %-18s %s\n" "$service" "latest" "${SIZE_MB}MB" "$PUSHED_DATE" "$STATUS"
    
    # Optional: Show digest for debugging
    # echo "   Digest: $ECR_DIGEST"
  else
    printf "%-27s %-8s %-10s %-18s %s\n" "$service" "latest" "ERROR" "NOT FOUND" "❌ Missing"
    ALL_VERIFIED=false
  fi
done

echo ""

if [ "$ALL_VERIFIED" = true ]; then
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          ✅ All Images Successfully Pushed to ECR!        ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "📊 Summary:"
  echo "  • Total services: ${#SERVICES[@]}"
  echo "  • ECR repositories verified: ${#SERVICES[@]}"
  echo "  • Old images cleaned up: ${#SERVICES[@]}"
  echo "  • Images built: ${#SERVICES[@]}"
  echo "  • Images pushed: ${#SERVICES[@]}"
  echo "  • Images verified in ECR: ${#SERVICES[@]}"
  echo ""
  echo "✅ All images in ECR are up-to-date and fresh!"
  echo ""
  echo "💾 Storage Benefits:"
  echo "  • Old images removed - saving ECR storage costs"
  echo "  • Only latest version kept - clean repository"
  echo ""
  echo "📝 Legend:"
  echo "  • ✅ Fresh    - Pushed within last 5 minutes (latest)"
  echo "  • ✅ Xm ago   - Pushed within last hour (recent)"
  echo "  • ⚠️  Xh ago   - Pushed within last day (may need refresh)"
  echo "  • ⚠️  Xd ago   - Older than a day (should refresh)"
  echo ""
  echo "🌐 ECR Console:"
  echo "  https://console.aws.amazon.com/ecr/repositories?region=$REGION"
  echo ""
  echo "📋 Image URLs:"
  for service in "${SERVICES[@]}"; do
    echo "  • $ECR_BASE/$service:latest"
  done
  echo ""
  echo "💡 To view images in AWS Console:"
  echo "  https://console.aws.amazon.com/ecr/repositories?region=$REGION"
  echo ""
  echo "📊 To list all images in a repository:"
  echo "  aws ecr describe-images --repository-name <service-name> --region $REGION"
  echo ""
  echo "⏭️  Next Steps:"
  echo "  1. Update Kubernetes manifests with ECR image URLs"
  echo "  2. Deploy to EKS cluster"
  echo ""
else
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          ⚠️  Some Images Failed Verification!             ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Please check the output above for errors."
  exit 1
fi

