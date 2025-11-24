#!/bin/bash
# update-k8s-images.sh
# Updates Kubernetes manifests with ECR image URLs

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      🔧 Update Kubernetes Manifests with ECR URLs          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-832495218053}"
ECR_BASE="${ECR_BASE:-$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com}"

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

# Service names (for ECR) and their deployment file names
# Format: "ecr-name:file-basename:directory"
SERVICE_MAPPINGS=(
  "traveler-service:traveler:services"
  "owner-service:owner:services"
  "property-service:property:services"
  "booking-service:booking:services"
  "ai-agent:ai-agent:services"
  "frontend:frontend:frontend"
)

echo "═══════════════════════════════════════════════════════════"
echo "📋 Updating deployment manifests..."
echo "═══════════════════════════════════════════════════════════"
echo ""

UPDATED_COUNT=0
FAILED_COUNT=0
TOTAL_SERVICES=${#SERVICE_MAPPINGS[@]}

for mapping in "${SERVICE_MAPPINGS[@]}"; do
  # Split mapping into service name, file name, and directory
  service=$(echo "$mapping" | cut -d':' -f1)
  filename=$(echo "$mapping" | cut -d':' -f2)
  directory=$(echo "$mapping" | cut -d':' -f3)
  FILE="k8s/${directory}/${filename}-deployment.yaml"
  
  echo -n "Updating $service... "
  
  if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    FAILED_COUNT=$((FAILED_COUNT + 1))
    continue
  fi
  
  # Check if file already has ECR URL
  if grep -q "$ECR_BASE/$service:latest" "$FILE"; then
    echo "ℹ️  Already using ECR image"
    UPDATED_COUNT=$((UPDATED_COUNT + 1))
    continue
  fi
  
  # Create backup
  cp "$FILE" "$FILE.bak"
  
  # Update image reference (handles various formats)
  # Pattern 1: image: service-name:latest
  sed -i.tmp "s|image: $service:latest|image: $ECR_BASE/$service:latest|g" "$FILE"
  # Pattern 2: image: airbnb-prototype-service-name:latest
  sed -i.tmp "s|image: airbnb-prototype-$service:latest|image: $ECR_BASE/$service:latest|g" "$FILE"
  
  # Remove temporary file
  rm -f "$FILE.tmp"
  
  # Verify update
  if grep -q "$ECR_BASE/$service:latest" "$FILE"; then
    echo "✅ Updated"
    UPDATED_COUNT=$((UPDATED_COUNT + 1))
  else
    echo "⚠️  Update may have failed - please verify manually"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 Verification..."
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Checking for ECR image references:"
echo ""

for mapping in "${SERVICE_MAPPINGS[@]}"; do
  # Split mapping into service name, file name, and directory
  service=$(echo "$mapping" | cut -d':' -f1)
  filename=$(echo "$mapping" | cut -d':' -f2)
  directory=$(echo "$mapping" | cut -d':' -f3)
  FILE="k8s/${directory}/${filename}-deployment.yaml"
  
  if [ -f "$FILE" ]; then
    IMAGE_LINE=$(grep "image:" "$FILE" | grep "$service" | head -n1)
    if [ -n "$IMAGE_LINE" ]; then
      echo "  $service:"
      echo "    $IMAGE_LINE"
    fi
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ $FAILED_COUNT -eq 0 ]; then
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║        ✅ All Kubernetes Manifests Updated!                ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "📊 Summary:"
  echo "  • Total services: $TOTAL_SERVICES"
  echo "  • Successfully updated: $UPDATED_COUNT"
  echo "  • Failed: $FAILED_COUNT"
  echo ""
  echo "💾 Backups created with .bak extension"
  echo ""
  echo "📋 Verify changes:"
  echo "   grep -r '$ECR_BASE' k8s/services/*.yaml"
  echo ""
  echo "⏭️  Next Steps:"
  echo "   1. Review the updated manifests"
  echo "   2. Deploy to EKS: kubectl apply -f k8s/"
  echo ""
else
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║        ⚠️  Some Updates Failed!                            ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo ""
  echo "📊 Summary:"
  echo "  • Total services: $TOTAL_SERVICES"
  echo "  • Successfully updated: $UPDATED_COUNT"
  echo "  • Failed: $FAILED_COUNT"
  echo ""
  echo "Please check the files manually and verify the image URLs."
  exit 1
fi

