#!/bin/bash

# Kubernetes Cleanup Script for GoTour
# This script removes all GoTour resources from Minikube

set -e

echo "🧹 GoTour Kubernetes Cleanup Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_warning "This will delete ALL GoTour resources from Kubernetes!"
read -p "Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

print_info "Deleting GoTour namespace and all resources..."
kubectl delete namespace gotour --ignore-not-found=true

print_info "Waiting for namespace deletion to complete..."
kubectl wait --for=delete namespace/gotour --timeout=120s 2>/dev/null || true

print_success "All GoTour resources deleted!"
echo ""

print_info "To stop Minikube:"
echo "  minikube stop"
echo ""

print_info "To delete Minikube cluster:"
echo "  minikube delete"
echo ""

print_success "Cleanup complete!"

