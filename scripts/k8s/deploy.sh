#!/bin/bash

# Kubernetes Deployment Script for GoTour on Minikube
# This script deploys all services to a local Minikube cluster

set -e  # Exit on error

echo "🚀 GoTour Kubernetes Deployment Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if minikube is installed
if ! command -v minikube &> /dev/null; then
    print_error "Minikube is not installed. Please install it first:"
    echo "  brew install minikube"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install it first:"
    echo "  brew install kubectl"
    exit 1
fi

# Check if minikube is running
if ! minikube status &> /dev/null; then
    print_info "Starting Minikube with 4 CPUs and 8GB memory..."
    minikube start --cpus=4 --memory=8192
    print_success "Minikube started"
else
    print_success "Minikube is already running"
fi

# Enable metrics server for HPA
print_info "Enabling metrics-server for HPA..."
minikube addons enable metrics-server
print_success "Metrics server enabled"

# Set Docker environment to use Minikube's Docker daemon
print_info "Setting Docker environment to Minikube..."
eval $(minikube -p minikube docker-env --shell bash)
print_success "Docker environment configured"

# Build Docker images inside Minikube
print_info "Building Docker images inside Minikube..."
echo ""

print_info "Building traveler-service..."
docker build -t airbnb-prototype-traveler-service:latest ./services/traveler-service

print_info "Building owner-service..."
docker build -t airbnb-prototype-owner-service:latest ./services/owner-service

print_info "Building property-service..."
docker build -t airbnb-prototype-property-service:latest ./services/property-service

print_info "Building booking-service..."
docker build -t airbnb-prototype-booking-service:latest ./services/booking-service

print_info "Building ai-agent..."
docker build -t airbnb-prototype-ai-agent:latest ./services/ai-agent

print_info "Building frontend..."
docker build -t airbnb-prototype-frontend:latest ./frontend

print_success "All images built successfully"
echo ""

# Create namespace
print_info "Creating gotour namespace..."
kubectl apply -f k8s/config/namespace.yaml
print_success "Namespace created"

# Apply ConfigMap and Secrets
print_info "Applying ConfigMap and Secrets..."
kubectl apply -f k8s/config/configmap.yaml

# Check if secrets file has been configured
if grep -q '""' k8s/config/secrets.yaml; then
    print_warning "Secrets file contains empty values!"
    print_warning "Please update k8s/config/secrets.yaml with your API keys"
    print_warning "Run: cd k8s/config && ./encode-secrets.sh"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

kubectl apply -f k8s/config/secrets.yaml
print_success "ConfigMap and Secrets applied"
echo ""

# Deploy MongoDB
print_info "Deploying MongoDB..."
kubectl apply -f k8s/database/mongodb-statefulset.yaml
print_info "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongodb -n gotour --timeout=300s
print_success "MongoDB deployed and ready"
echo ""

# Deploy Zookeeper
print_info "Deploying Zookeeper..."
kubectl apply -f k8s/kafka/zookeeper-deployment.yaml
print_info "Waiting for Zookeeper to be ready..."
kubectl wait --for=condition=ready pod -l app=zookeeper -n gotour --timeout=300s
print_success "Zookeeper deployed and ready"
echo ""

# Deploy Kafka
print_info "Deploying Kafka..."
kubectl apply -f k8s/kafka/kafka-deployment.yaml
print_info "Waiting for Kafka to be ready..."
kubectl wait --for=condition=ready pod -l app=kafka -n gotour --timeout=300s
print_success "Kafka deployed and ready"
echo ""

# Deploy microservices
print_info "Deploying microservices..."
kubectl apply -f k8s/services/traveler-deployment.yaml
kubectl apply -f k8s/services/owner-deployment.yaml
kubectl apply -f k8s/services/property-deployment.yaml
kubectl apply -f k8s/services/booking-deployment.yaml
kubectl apply -f k8s/services/ai-agent-deployment.yaml
print_info "Waiting for services to be ready..."
kubectl wait --for=condition=ready pod -l app=traveler-service -n gotour --timeout=300s
kubectl wait --for=condition=ready pod -l app=owner-service -n gotour --timeout=300s
kubectl wait --for=condition=ready pod -l app=property-service -n gotour --timeout=300s
kubectl wait --for=condition=ready pod -l app=booking-service -n gotour --timeout=300s
kubectl wait --for=condition=ready pod -l app=ai-agent-service -n gotour --timeout=300s
print_success "All microservices deployed and ready"
echo ""

# Deploy frontend
print_info "Deploying frontend..."
kubectl apply -f k8s/frontend/frontend-deployment.yaml
print_info "Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n gotour --timeout=300s
print_success "Frontend deployed and ready"
echo ""

# Deploy HPA
print_info "Deploying Horizontal Pod Autoscalers..."
kubectl apply -f k8s/services/hpa.yaml
print_success "HPAs deployed"
echo ""

# Deploy Ingress (optional)
# print_info "Deploying Ingress..."
# minikube addons enable ingress
# kubectl apply -f k8s/ingress/ingress.yaml
# print_success "Ingress deployed"

echo ""
echo "========================================="
print_success "Deployment Complete!"
echo "========================================="
echo ""

print_info "Getting service URLs..."
echo ""
echo "📊 Service Status:"
kubectl get pods -n gotour
echo ""

echo "🌐 Access your application:"
echo "  Frontend: minikube service frontend-service -n gotour --url"
echo ""

print_info "To access the frontend, run:"
echo "  minikube service frontend-service -n gotour"
echo ""

print_info "To view logs:"
echo "  kubectl logs -f deployment/traveler-service -n gotour"
echo "  kubectl logs -f deployment/booking-service -n gotour"
echo ""

print_info "To scale a service:"
echo "  kubectl scale deployment/traveler-service --replicas=3 -n gotour"
echo ""

print_info "To delete all resources:"
echo "  kubectl delete namespace gotour"
echo ""

print_success "Enjoy your GoTour application on Kubernetes!"

