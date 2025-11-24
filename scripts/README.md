# GoTour Scripts Directory

This directory contains all the utility scripts for the GoTour Airbnb Prototype project, organized by purpose.

## Directory Structure

```
scripts/
├── aws/                    AWS/EKS deployment scripts
├── k8s/                    Kubernetes local deployment scripts
├── testing/                Testing and validation scripts
└── setup/                  Initial setup scripts
```

## AWS Scripts (`aws/`)

Scripts for deploying to AWS EKS (Elastic Kubernetes Service).

| Script | Makefile Command | Purpose |
|--------|-----------------|---------|
| `push-to-ecr.sh` | `make eks-push` | Build Docker images and push to AWS ECR |
| `update-k8s-images.sh` | `make eks-update` | Update Kubernetes manifests with ECR image URLs |
| `deploy-to-eks.sh` | `make eks-deploy` | Deploy application to EKS cluster |
| `seed-eks-mongo.sh` | `make eks-seed` | Seed MongoDB database on EKS |
| `setup-billing-alerts.sh` | (manual) | Set up AWS CloudWatch billing alerts |

**Complete EKS Deployment:**
```bash
make eks-all  # Runs push → update → deploy
```

## Kubernetes Scripts (`k8s/`)

Scripts for local Kubernetes deployment with Minikube.

| Script | Makefile Command | Purpose |
|--------|-----------------|---------|
| `deploy.sh` | `make k8s-deploy` | Deploy to Minikube |
| `cleanup.sh` | `make k8s-cleanup` | Clean up Kubernetes resources |
| `encode-secrets.sh` | (utility) | Encode secrets for Kubernetes |

## Testing Scripts (`testing/`)

Scripts for testing and validation.

| Script | Purpose |
|--------|---------|
| `test-airbnb-frontend.sh` | Test frontend and backend integration |
| `test-microservices-integration.sh` | Test microservices health and connectivity |

**Usage:**
```bash
# Test frontend
./scripts/testing/test-airbnb-frontend.sh

# Test microservices integration
./scripts/testing/test-microservices-integration.sh
```

## Setup Scripts (`setup/`)

Initial setup scripts for various components.

| Script | Purpose |
|--------|---------|
| `ai-agent-setup.sh` | Set up Python virtual environment for AI agent |

**Usage:**
```bash
cd services/ai-agent
../../scripts/setup/ai-agent-setup.sh
```

## Common Workflows

### Local Development
```bash
make server    # Start all backend services
make frontend  # Start React frontend
make seed      # Seed database with test data
```

### AWS EKS Deployment
```bash
# Full deployment (build, push, deploy)
make eks-all

# Individual steps
make eks-push      # Build and push images
make eks-update    # Update manifests
make eks-deploy    # Deploy to EKS

# Check status
make eks-status

# Seed database
make eks-seed
```

### Kubernetes (Minikube)
```bash
make k8s-deploy    # Deploy to Minikube
make k8s-status    # Check deployment status
make k8s-cleanup   # Clean up resources
```

## Notes

- All scripts are referenced in the root `Makefile`
- Scripts are executable (`chmod +x`) automatically by Make
- Environment variables for AWS scripts:
  - `AWS_ACCOUNT_ID=832495218053`
  - `AWS_REGION=us-east-1`
  - `CLUSTER_NAME=gotour-cluster`

## Deleted Scripts

The following scripts were removed as they are obsolete or redundant:

- `start-microservices.sh` - Replaced by `make server` (docker-compose)
- `setup.sh` - Old MySQL setup, obsolete
- `start-testing.sh` - Old Redux testing setup
- `create-microservices.sh` - Initial scaffolding, no longer needed
- `CREATE_PAGES.sh` - Page generation, already executed

## See Also

- [Makefile](../Makefile) - All make commands
- [AWS_EKS_DEPLOYMENT_GUIDE.md](../docs/AWS_EKS_DEPLOYMENT_GUIDE.md) - EKS deployment guide
- [QUICK_DEPLOY_REFERENCE.md](../docs/QUICK_DEPLOY_REFERENCE.md) - Quick reference
- [AWS_DEPLOYMENT_WORKFLOW.md](../docs/AWS_DEPLOYMENT_WORKFLOW.md) - Deployment workflow
- [Documentation Index](../docs/README.md) - All project documentation

