#!/bin/bash
# deploy-to-eks.sh
# Complete deployment of GoTour application to AWS EKS

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 Deploy GoTour to AWS EKS                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Configuration with defaults
NAMESPACE="gotour"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-832495218053}"
CLUSTER_NAME="${CLUSTER_NAME:-gotour-cluster}"

echo "Configuration:"
echo "  Cluster: $CLUSTER_NAME"
echo "  Region: $AWS_REGION"
echo "  Namespace: $NAMESPACE"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 1: Verify kubectl is connected to the cluster
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 1: Verifying kubectl connection..."
echo "═══════════════════════════════════════════════════════════"
echo ""

CURRENT_CONTEXT=$(kubectl config current-context 2>/dev/null || echo "")
if [[ "$CURRENT_CONTEXT" != *"$CLUSTER_NAME"* ]]; then
  echo "⚠️  kubectl not connected to $CLUSTER_NAME"
  echo "Current context: $CURRENT_CONTEXT"
  echo ""
  echo "Updating kubeconfig..."
  aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$AWS_REGION"
  echo ""
fi

echo "✅ kubectl connected to: $(kubectl config current-context)"
echo ""

# Verify cluster is accessible
if ! kubectl get nodes > /dev/null 2>&1; then
  echo "❌ Cannot connect to cluster. Please check your kubeconfig."
  exit 1
fi

echo "✅ Cluster is accessible"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 2: Create Namespace
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 2: Creating namespace..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
  echo "ℹ️  Namespace '$NAMESPACE' already exists"
else
  kubectl create namespace "$NAMESPACE"
  echo "✅ Created namespace: $NAMESPACE"
fi

# Set as default namespace
kubectl config set-context --current --namespace="$NAMESPACE"
echo "✅ Set default namespace to: $NAMESPACE"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 3: Deploy Secrets and ConfigMaps
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 3: Deploying secrets and configmaps..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/config/namespace.yaml" ]; then
  kubectl apply -f k8s/config/namespace.yaml
  echo "✅ Applied namespace.yaml"
fi

if [ -f "k8s/config/secrets.yaml" ]; then
  kubectl apply -f k8s/config/secrets.yaml
  echo "✅ Applied secrets.yaml"
fi

if [ -f "k8s/config/configmap.yaml" ]; then
  kubectl apply -f k8s/config/configmap.yaml
  echo "✅ Applied configmap.yaml"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Step 4: Deploy MongoDB
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 4: Deploying MongoDB..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/database/mongodb-statefulset.yaml" ]; then
  kubectl apply -f k8s/database/mongodb-statefulset.yaml
  echo "✅ Applied mongodb-statefulset.yaml"
  echo ""
  
  echo "⏳ Waiting for MongoDB to be ready (max 5 minutes)..."
  kubectl wait --for=condition=ready pod -l app=mongodb -n "$NAMESPACE" --timeout=300s 2>/dev/null || {
    echo "⚠️  MongoDB not ready yet, continuing anyway..."
  }
  echo ""
else
  echo "⚠️  MongoDB deployment file not found"
fi

# ═══════════════════════════════════════════════════════════
# Step 5: Deploy Kafka and Zookeeper
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 5: Deploying Kafka and Zookeeper..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/kafka/zookeeper-deployment.yaml" ]; then
  kubectl apply -f k8s/kafka/zookeeper-deployment.yaml
  echo "✅ Applied zookeeper-deployment.yaml"
  echo ""
  
  echo "⏳ Waiting for Zookeeper to be ready (max 3 minutes)..."
  kubectl wait --for=condition=ready pod -l app=zookeeper -n "$NAMESPACE" --timeout=180s 2>/dev/null || {
    echo "⚠️  Zookeeper not ready yet, continuing anyway..."
  }
  echo ""
fi

if [ -f "k8s/kafka/kafka-deployment.yaml" ]; then
  kubectl apply -f k8s/kafka/kafka-deployment.yaml
  echo "✅ Applied kafka-deployment.yaml"
  echo ""
  
  echo "⏳ Waiting for Kafka to be ready (max 3 minutes)..."
  kubectl wait --for=condition=ready pod -l app=kafka -n "$NAMESPACE" --timeout=180s 2>/dev/null || {
    echo "⚠️  Kafka not ready yet, continuing anyway..."
  }
  echo ""
fi

# ═══════════════════════════════════════════════════════════
# Step 6: Deploy Microservices
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 6: Deploying microservices..."
echo "═══════════════════════════════════════════════════════════"
echo ""

SERVICES=("traveler" "owner" "property" "booking" "ai-agent")

for service in "${SERVICES[@]}"; do
  FILE="k8s/services/${service}-deployment.yaml"
  
  if [ -f "$FILE" ]; then
    echo "Deploying ${service}-service..."
    kubectl apply -f "$FILE"
    echo "✅ Applied $FILE"
  else
    echo "⚠️  File not found: $FILE"
  fi
done

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30
echo ""

# ═══════════════════════════════════════════════════════════
# Step 7: Deploy Frontend (if exists)
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 7: Deploying frontend..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/frontend/frontend-deployment.yaml" ]; then
  kubectl apply -f k8s/frontend/frontend-deployment.yaml
  echo "✅ Applied frontend-deployment.yaml"
else
  echo "ℹ️  Frontend deployment file not found (optional)"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Step 8: Deploy Ingress/LoadBalancer
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 8: Deploying ingress..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/ingress/ingress.yaml" ]; then
  kubectl apply -f k8s/ingress/ingress.yaml
  echo "✅ Applied ingress.yaml"
else
  echo "ℹ️  Ingress file not found (optional)"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Step 9: Deploy HPA (Horizontal Pod Autoscaler)
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 9: Deploying HPA..."
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -f "k8s/services/hpa.yaml" ]; then
  kubectl apply -f k8s/services/hpa.yaml
  echo "✅ Applied hpa.yaml"
else
  echo "ℹ️  HPA file not found (optional)"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Step 10: Verification
# ═══════════════════════════════════════════════════════════
echo "═══════════════════════════════════════════════════════════"
echo "📋 Step 10: Verifying deployment..."
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "📦 Pods:"
kubectl get pods -n "$NAMESPACE"
echo ""

echo "🌐 Services:"
kubectl get services -n "$NAMESPACE"
echo ""

echo "📊 Deployments:"
kubectl get deployments -n "$NAMESPACE"
echo ""

# Check for LoadBalancer external IP
echo "🔍 Checking for LoadBalancer URL..."
EXTERNAL_IP=$(kubectl get svc -n "$NAMESPACE" -o jsonpath='{.items[?(@.spec.type=="LoadBalancer")].status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$EXTERNAL_IP" ]; then
  echo "✅ LoadBalancer URL: http://$EXTERNAL_IP"
  echo ""
  echo "⚠️  Note: It may take 5-10 minutes for the LoadBalancer to become fully accessible."
else
  echo "ℹ️  No LoadBalancer found yet. Check with:"
  echo "   kubectl get svc -n $NAMESPACE"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ✅ Deployment Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Deployment Summary:"
echo "  • Namespace: $NAMESPACE"
echo "  • Cluster: $CLUSTER_NAME"
echo "  • Region: $AWS_REGION"
echo ""

echo "📋 Next Steps:"
echo "  1. Monitor pods: kubectl get pods -n $NAMESPACE -w"
echo "  2. Check logs: kubectl logs -f deployment/<service-name> -n $NAMESPACE"
echo "  3. Get LoadBalancer URL: kubectl get svc -n $NAMESPACE"
echo "  4. Access application via LoadBalancer URL"
echo ""

echo "💡 Useful Commands:"
echo "  • View all resources: kubectl get all -n $NAMESPACE"
echo "  • Check pod status: kubectl describe pod <pod-name> -n $NAMESPACE"
echo "  • View logs: kubectl logs <pod-name> -n $NAMESPACE"
echo "  • Delete deployment: kubectl delete -f k8s/"
echo ""

echo "⚠️  Remember to monitor your AWS costs!"
echo "   Current rate: ~\$4.70/day"
echo ""

