# GoTour Documentation

Welcome to the GoTour Airbnb Prototype documentation! This directory contains all project documentation organized by topic.

## 📚 Table of Contents

- [Quick Start](#-quick-start)
- [Requirements & Architecture](#-requirements--architecture)
- [AWS Deployment](#-aws-deployment)
- [Kafka Integration](#-kafka-integration)
- [Kubernetes](#-kubernetes)
- [Testing](#-testing)
- [Phase Completion](#-phase-completion)

---

## 🚀 Quick Start

Essential guides to get you started quickly.

| Document | Description |
|----------|-------------|
| [QUICK_DEPLOY_REFERENCE.md](QUICK_DEPLOY_REFERENCE.md) | Quick reference card for common deployment commands |
| [ACCESS_URLS.md](ACCESS_URLS.md) | All access methods for the application on AWS EKS |
| [../TEST_CREDENTIALS.md](../TEST_CREDENTIALS.md) | Test user accounts and credentials (kept in root) |

---

## 📋 Requirements & Architecture

Project requirements, architecture, and planning documents.

| Document | Description |
|----------|-------------|
| [LAB2_REQUIREMENTS.md](LAB2_REQUIREMENTS.md) | Complete Lab 2 requirements and phases |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Original project requirements |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design |
| [SERVICES_STATUS.md](SERVICES_STATUS.md) | Current status of all microservices |

---

## ☁️ AWS Deployment

Complete guides for deploying to AWS EKS.

### Main Guides

| Document | Description |
|----------|-------------|
| [AWS_EKS_DEPLOYMENT_GUIDE.md](AWS_EKS_DEPLOYMENT_GUIDE.md) | **START HERE** - Complete step-by-step EKS deployment guide |
| [AWS_DEPLOYMENT_WORKFLOW.md](AWS_DEPLOYMENT_WORKFLOW.md) | Deployment workflow and troubleshooting |
| [AWS_COST_BREAKDOWN.md](AWS_COST_BREAKDOWN.md) | AWS cost analysis and optimization |

### Supporting Docs

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md) | Deployment summary and status |
| [EKS_TESTING_GUIDE.md](EKS_TESTING_GUIDE.md) | Testing the application on AWS EKS |

**Quick Commands:**
```bash
make eks-all      # Complete deployment (build, push, deploy)
make eks-status   # Check deployment status
make eks-seed     # Seed MongoDB on EKS
```

---

## 📨 Kafka Integration

Kafka event-driven architecture documentation.

| Document | Description |
|----------|-------------|
| [KAFKA_QUICKSTART.md](KAFKA_QUICKSTART.md) | **START HERE** - Quick start guide for Kafka |
| [KAFKA_BOOKING_FLOW.md](KAFKA_BOOKING_FLOW.md) | Complete booking flow with Kafka events |
| [KAFKA_INTEGRATION.md](KAFKA_INTEGRATION.md) | Kafka integration architecture and setup |
| [KAFKA_TESTING_GUIDE.md](KAFKA_TESTING_GUIDE.md) | Comprehensive Kafka testing guide |
| [KAFKA_TESTING_STEPS.md](KAFKA_TESTING_STEPS.md) | Step-by-step Kafka testing instructions |

**Quick Commands:**
```bash
make kafka-status   # Check Kafka & Zookeeper status
make kafka-topics   # List all Kafka topics
make kafka-logs     # View Kafka logs
make kafka-test     # Complete Kafka flow test guide
```

---

## ☸️ Kubernetes

Kubernetes deployment documentation (local and cloud).

| Document | Description |
|----------|-------------|
| [KUBERNETES_EXPLAINED.md](KUBERNETES_EXPLAINED.md) | Kubernetes concepts explained |
| [PHASE5_KUBERNETES.md](PHASE5_KUBERNETES.md) | Phase 5: Kubernetes deployment plan |
| [PHASE5_QUICKSTART.md](PHASE5_QUICKSTART.md) | Quick start for Kubernetes deployment |
| [PHASE5_COMPLETE.md](PHASE5_COMPLETE.md) | Phase 5 completion summary |

**Quick Commands:**
```bash
# Local Kubernetes (Minikube)
make k8s-deploy    # Deploy to Minikube
make k8s-status    # Check deployment status
make k8s-cleanup   # Clean up resources
```

---

## 🧪 Testing

Testing guides and validation procedures.

| Document | Description |
|----------|-------------|
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Complete testing guide for all features |
| [EKS_TESTING_GUIDE.md](EKS_TESTING_GUIDE.md) | Testing on AWS EKS |
| [KAFKA_TESTING_GUIDE.md](KAFKA_TESTING_GUIDE.md) | Kafka integration testing |

---

## 💾 Database

Database setup and management.

| Document | Description |
|----------|-------------|
| [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md) | MongoDB setup and configuration |

**Quick Commands:**
```bash
make seed           # Seed local database
make eks-seed       # Seed MongoDB on EKS
make db-shell       # Open MongoDB shell
make db-admin       # Open Mongo Express (GUI)
```

---

## ✅ Phase Completion

Detailed summaries of completed project phases.

| Phase | Document | Description |
|-------|----------|-------------|
| Phase 1 | [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) | Initial backend setup |
| Phase 2 | [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md) | Frontend development |
| Phase 3 | [PHASE3_COMPLETE.md](PHASE3_COMPLETE.md) | Microservices architecture |
| Phase 4 | [PHASE4_KAFKA_COMPLETE.md](PHASE4_KAFKA_COMPLETE.md) | Kafka integration |
| Phase 5 | [PHASE5_COMPLETE.md](PHASE5_COMPLETE.md) | Kubernetes & AWS deployment |

---

## 🎯 Common Workflows

### Local Development
```bash
make server      # Start all backend services
make frontend    # Start React app
make seed        # Seed database with test data
make health      # Check service health
```

### AWS Deployment
```bash
make eks-all     # Build, push, and deploy to AWS
make eks-status  # Check deployment status
make eks-seed    # Seed MongoDB on EKS
```

### Testing
```bash
make kafka-test                                    # Kafka flow testing
./scripts/testing/test-airbnb-frontend.sh         # Frontend testing
./scripts/testing/test-microservices-integration.sh # Integration testing
```

---

## 📖 Additional Resources

- **Scripts Documentation**: See [`../scripts/README.md`](../scripts/README.md)
- **Project README**: See [`../README.md`](../README.md)
- **Test Credentials**: See [`../TEST_CREDENTIALS.md`](../TEST_CREDENTIALS.md)

---

## 💡 Tips

1. **Start with the Quick Start guides** for your area of interest
2. **Use the Table of Contents** to navigate to specific topics
3. **All `make` commands** are documented in the root [Makefile](../Makefile)
4. **Test credentials** are available in the root directory
5. **Scripts** are organized in the [`scripts/`](../scripts/) directory

---

## 🆘 Need Help?

- Check the relevant guide in this directory
- Run `make help` to see all available commands
- Review [LAB2_REQUIREMENTS.md](LAB2_REQUIREMENTS.md) for project overview
- See [AWS_DEPLOYMENT_WORKFLOW.md](AWS_DEPLOYMENT_WORKFLOW.md) for troubleshooting

---

**Last Updated**: November 2025  
**Project**: GoTour Airbnb Prototype (Lab 2)

