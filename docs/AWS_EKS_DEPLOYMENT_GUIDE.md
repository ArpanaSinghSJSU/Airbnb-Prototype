# AWS EKS Deployment Guide - GoTour Application

## Overview
This guide walks you through deploying the GoTour microservices application to AWS EKS (Elastic Kubernetes Service).

**Timeline**: 4-6 hours  
**Cost**: ~$23-24 for 5 days (covered by $100 credits)  
**Instance Type**: 3 × t3.small (more reliable, cheaper than t3.medium)  
**Prerequisites**: AWS account, CLI configured, billing alerts set up

---

## 📋 Pre-Deployment Checklist

Before starting, verify:

```bash
# 1. AWS CLI is configured
aws sts get-caller-identity
# Should show Account: 832495218053

# 2. Tools are installed
eksctl version        # Should show 0.x.x
kubectl version --client  # Should show v1.x.x
docker --version      # Should show Docker version

# 3. You're in the project directory
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
pwd  # Should show project path

# 4. Billing alerts are active
aws sns list-subscriptions --region us-east-1 --query 'Subscriptions[?contains(TopicArn, `GoTour-Billing-Alerts`)].[Endpoint,SubscriptionArn]' --output table
# Should show your email with confirmed subscription
```

---

## 🚀 Step 1: Create EKS Cluster

**Time**: 15-20 minutes (automated)

### 1.1 Create the Cluster

```bash
# Navigate to project directory
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype

# Create EKS cluster with t3.small instances (more reliable, cheaper)
eksctl create cluster \
  --name gotour-cluster \
  --region us-east-1 \
  --zones us-east-1a,us-east-1c \
  --nodegroup-name standard-workers \
  --node-type t3.small \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 4 \
  --managed
```

**What this creates:**
- EKS control plane (managed by AWS)
- VPC with public and private subnets across 2 AZs
- 3 EC2 t3.small worker nodes (2 vCPU, 2 GB RAM each)
- Security groups and IAM roles
- kubectl configuration (automatic)

**Why t3.small with 3 nodes:**
- ✅ More instance availability (higher success rate)
- ✅ ~$2-3 cheaper than 2×t3.medium over 5 days
- ✅ Better distribution across availability zones
- ✅ Total: 6 vCPUs, 6 GB RAM (sufficient for microservices)

**Expected output:**
```
[ℹ]  eksctl version 0.x.x
[ℹ]  using region us-east-1
[ℹ]  creating EKS cluster "gotour-cluster"
...
[✔]  EKS cluster "gotour-cluster" in "us-east-1" region is ready
```

### 1.2 Verify Cluster Creation

```bash
# Check cluster exists
aws eks list-clusters --region us-east-1

# Check kubectl context
kubectl config current-context
# Should show: admin-user@gotour-cluster.us-east-1.eksctl.io

# Verify nodes are ready
kubectl get nodes
# Should show 3 nodes in "Ready" status

# Get detailed node information
kubectl get nodes -o wide
```

**Expected output:**
```
NAME                             STATUS   ROLES    AGE   VERSION
ip-192-168-x-x.ec2.internal      Ready    <none>   2m    v1.28.x
ip-192-168-x-x.ec2.internal      Ready    <none>   2m    v1.28.x
ip-192-168-x-x.ec2.internal      Ready    <none>   2m    v1.28.x
```

### 1.3 Set Environment Variables

```bash
# Set variables for this session
export AWS_ACCOUNT_ID=832495218053
export AWS_REGION=us-east-1
export CLUSTER_NAME=gotour-cluster

# Verify
echo "Account ID: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Cluster: $CLUSTER_NAME"

# Optional: Add to shell profile for persistence
echo "export AWS_ACCOUNT_ID=832495218053" >> ~/.zshrc
echo "export AWS_REGION=us-east-1" >> ~/.zshrc
echo "export CLUSTER_NAME=gotour-cluster" >> ~/.zshrc
```

**📸 Screenshot: Save output of `kubectl get nodes` for documentation**

---

## 🐳 Step 2: Create ECR Repositories

**Time**: 5 minutes

### 2.1 Create Repositories for Each Service

```bash
# Create repository for traveler service
aws ecr create-repository \
  --repository-name traveler-service \
  --region us-east-1

# Create repository for owner service
aws ecr create-repository \
  --repository-name owner-service \
  --region us-east-1

# Create repository for property service
aws ecr create-repository \
  --repository-name property-service \
  --region us-east-1

# Create repository for booking service
aws ecr create-repository \
  --repository-name booking-service \
  --region us-east-1

# Create repository for AI agent
aws ecr create-repository \
  --repository-name ai-agent \
  --region us-east-1
```

### 2.2 Verify Repositories

```bash
# List all repositories
aws ecr describe-repositories \
  --region us-east-1 \
  --query 'repositories[*].repositoryName' \
  --output table

# Get repository URIs
aws ecr describe-repositories \
  --region us-east-1 \
  --query 'repositories[*].[repositoryName,repositoryUri]' \
  --output table
```

**Expected output:**
```
---------------------------------------------------------
|                  DescribeRepositories                  |
+------------------+--------------------------------------+
|  ai-agent        |  832495218053.dkr.ecr.us-east-1...  |
|  booking-service |  832495218053.dkr.ecr.us-east-1...  |
|  owner-service   |  832495218053.dkr.ecr.us-east-1...  |
|  property-service|  832495218053.dkr.ecr.us-east-1...  |
|  traveler-service|  832495218053.dkr.ecr.us-east-1...  |
+------------------+--------------------------------------+
```

---

## 📦 Step 3: Build and Push Docker Images

**Time**: 10-15 minutes

### 3.1 Verify Docker Images Exist Locally

```bash
# Check existing images
docker images | grep -E 'traveler|owner|property|booking|ai-agent'

# If images don't exist, build them
docker-compose build

# Count images (should be 5)
docker images | grep -E 'traveler|owner|property|booking|ai-agent' | wc -l
```

### 3.2 Login to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  832495218053.dkr.ecr.us-east-1.amazonaws.com

# Should see: "Login Succeeded"
```

### 3.3 Tag and Push Images

```bash
# Set ECR base URL
export ECR_BASE=832495218053.dkr.ecr.us-east-1.amazonaws.com

# Traveler Service
docker tag traveler-service:latest $ECR_BASE/traveler-service:latest
docker push $ECR_BASE/traveler-service:latest

# Owner Service
docker tag owner-service:latest $ECR_BASE/owner-service:latest
docker push $ECR_BASE/owner-service:latest

# Property Service
docker tag property-service:latest $ECR_BASE/property-service:latest
docker push $ECR_BASE/property-service:latest

# Booking Service
docker tag booking-service:latest $ECR_BASE/booking-service:latest
docker push $ECR_BASE/booking-service:latest

# AI Agent
docker tag ai-agent:latest $ECR_BASE/ai-agent:latest
docker push $ECR_BASE/ai-agent:latest
```

**Each push takes 2-3 minutes. Expected output:**
```
The push refers to repository [832495218053.dkr.ecr.us-east-1.amazonaws.com/traveler-service]
abc123: Pushed
def456: Pushed
latest: digest: sha256:xxx... size: 1234
```

### 3.4 Verify Images in ECR

```bash
# List images in traveler-service repository
aws ecr list-images \
  --repository-name traveler-service \
  --region us-east-1

# Check all repositories have images
for repo in traveler-service owner-service property-service booking-service ai-agent; do
  echo "Repository: $repo"
  aws ecr list-images --repository-name $repo --region us-east-1 --query 'imageIds[*].imageTag' --output text
  echo ""
done
```

---

## 🔧 Step 4: Update Kubernetes Manifests with ECR URLs

**Time**: 5-10 minutes

### 4.1 Update Service Deployment Files

You need to update the image references in your Kubernetes deployment files to point to your ECR repositories.

**Files to update:**
```
k8s/services/traveler-deployment.yaml
k8s/services/owner-deployment.yaml
k8s/services/property-deployment.yaml
k8s/services/booking-deployment.yaml
k8s/services/ai-agent-deployment.yaml
```

**Change from:**
```yaml
spec:
  containers:
  - name: traveler-service
    image: traveler-service:latest
```

**Change to:**
```yaml
spec:
  containers:
  - name: traveler-service
    image: 832495218053.dkr.ecr.us-east-1.amazonaws.com/traveler-service:latest
```

### 4.2 Automated Update Script

**Create a script to update all deployment files:**

```bash
#!/bin/bash
# update-image-urls.sh

ECR_BASE="832495218053.dkr.ecr.us-east-1.amazonaws.com"

# Update traveler-service
sed -i.bak "s|image: traveler-service:latest|image: $ECR_BASE/traveler-service:latest|g" k8s/services/traveler-deployment.yaml

# Update owner-service
sed -i.bak "s|image: owner-service:latest|image: $ECR_BASE/owner-service:latest|g" k8s/services/owner-deployment.yaml

# Update property-service
sed -i.bak "s|image: property-service:latest|image: $ECR_BASE/property-service:latest|g" k8s/services/property-deployment.yaml

# Update booking-service
sed -i.bak "s|image: booking-service:latest|image: $ECR_BASE/booking-service:latest|g" k8s/services/booking-deployment.yaml

# Update ai-agent
sed -i.bak "s|image: ai-agent:latest|image: $ECR_BASE/ai-agent:latest|g" k8s/services/ai-agent-deployment.yaml

echo "✅ All deployment files updated with ECR URLs"
```

**Run the script:**
```bash
chmod +x update-image-urls.sh
./update-image-urls.sh
```

### 4.3 Verify Updates

```bash
# Check that ECR URLs are present
grep -r "832495218053.dkr.ecr" k8s/services/*.yaml

# Should see ECR URLs in all deployment files
```

---

## ☸️ Step 5: Deploy to Kubernetes

**Time**: 15-20 minutes

### 5.1 Create Namespace

```bash
# Create dedicated namespace for application
kubectl create namespace gotour

# Set as default namespace for convenience
kubectl config set-context --current --namespace=gotour

# Verify namespace
kubectl get namespaces
```

### 5.2 Deploy Configuration (Secrets and ConfigMaps)

```bash
# Apply secrets (database credentials, API keys)
kubectl apply -f k8s/config/secrets.yaml -n gotour

# Apply configmaps (application configuration)
kubectl apply -f k8s/config/configmap.yaml -n gotour

# Verify
kubectl get secrets -n gotour
kubectl get configmaps -n gotour
```

### 5.3 Deploy MongoDB

```bash
# Deploy MongoDB StatefulSet
kubectl apply -f k8s/database/mongodb-statefulset.yaml -n gotour

# Wait for MongoDB to be ready (takes 2-3 minutes)
kubectl wait --for=condition=ready pod -l app=mongodb -n gotour --timeout=300s

# Check MongoDB status
kubectl get pods -n gotour -l app=mongodb
kubectl get statefulset -n gotour

# Check logs if needed
kubectl logs -f mongodb-0 -n gotour
```

**Expected output:**
```
NAME        READY   STATUS    RESTARTS   AGE
mongodb-0   1/1     Running   0          2m
```

### 5.4 Deploy Kafka and Zookeeper

```bash
# Deploy Zookeeper first
kubectl apply -f k8s/kafka/zookeeper-deployment.yaml -n gotour

# Wait for Zookeeper
kubectl wait --for=condition=ready pod -l app=zookeeper -n gotour --timeout=300s

# Deploy Kafka
kubectl apply -f k8s/kafka/kafka-deployment.yaml -n gotour

# Wait for Kafka
kubectl wait --for=condition=ready pod -l app=kafka -n gotour --timeout=300s

# Verify
kubectl get pods -n gotour -l app=zookeeper
kubectl get pods -n gotour -l app=kafka
```

### 5.5 Deploy Microservices

```bash
# Deploy all microservices at once
kubectl apply -f k8s/services/ -n gotour

# Watch pods starting up
kubectl get pods -n gotour -w
# Press Ctrl+C to stop watching

# Check all services
kubectl get deployments -n gotour
kubectl get pods -n gotour

# Check specific service
kubectl describe deployment traveler-service -n gotour
```

**Expected output:**
```
NAME                                READY   STATUS    RESTARTS   AGE
traveler-service-xxx                1/1     Running   0          2m
owner-service-xxx                   1/1     Running   0          2m
property-service-xxx                1/1     Running   0          2m
booking-service-xxx                 1/1     Running   0          2m
ai-agent-service-xxx                1/1     Running   0          2m
```

### 5.6 Check Service Logs

```bash
# Check each service is starting correctly
kubectl logs -f deployment/traveler-service -n gotour
kubectl logs -f deployment/owner-service -n gotour
kubectl logs -f deployment/property-service -n gotour
kubectl logs -f deployment/booking-service -n gotour
kubectl logs -f deployment/ai-agent-service -n gotour

# Look for "Server running on port..." messages
```

---

## 🌐 Step 6: Deploy Frontend and Ingress

**Time**: 10 minutes

### 6.1 Deploy Frontend

```bash
# Deploy React frontend
kubectl apply -f k8s/frontend/frontend-deployment.yaml -n gotour

# Wait for frontend
kubectl wait --for=condition=ready pod -l app=frontend -n gotour --timeout=300s

# Check frontend
kubectl get pods -n gotour -l app=frontend
kubectl logs -f deployment/frontend -n gotour
```

### 6.2 Deploy Ingress/Load Balancer

```bash
# Apply ingress configuration
kubectl apply -f k8s/ingress/ingress.yaml -n gotour

# Check ingress status
kubectl get ingress -n gotour

# Get load balancer URL (may take 3-5 minutes to provision)
kubectl get ingress -n gotour -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}'

# Or check services
kubectl get svc -n gotour
```

**Wait for EXTERNAL-IP to appear (not <pending>)**

### 6.3 Get Application URL

```bash
# Get the LoadBalancer URL
export LB_URL=$(kubectl get ingress -n gotour -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')

echo "Application URL: http://$LB_URL"

# Save this URL for testing
echo $LB_URL > lb-url.txt
```

---

## ✅ Step 7: Verify Deployment

**Time**: 10-15 minutes

### 7.1 Check All Pods are Running

```bash
# Get all resources in namespace
kubectl get all -n gotour

# Check pod status
kubectl get pods -n gotour

# All pods should show "Running" and "1/1" ready
```

**Expected output:**
```
NAME                                    READY   STATUS    RESTARTS   AGE
mongodb-0                               1/1     Running   0          10m
kafka-0                                 1/1     Running   0          8m
zookeeper-0                             1/1     Running   0          9m
traveler-service-xxx                    1/1     Running   0          5m
owner-service-xxx                       1/1     Running   0          5m
property-service-xxx                    1/1     Running   0          5m
booking-service-xxx                     1/1     Running   0          5m
ai-agent-service-xxx                    1/1     Running   0          5m
frontend-xxx                            1/1     Running   0          3m
```

### 7.2 Test Health Endpoints

```bash
# Wait for LoadBalancer to be fully ready (may take 5 minutes)
sleep 300

# Test each service health endpoint
export LB_URL=$(kubectl get ingress -n gotour -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')

curl http://$LB_URL/api/traveler/health
curl http://$LB_URL/api/owner/health
curl http://$LB_URL/api/property/health
curl http://$LB_URL/api/booking/health
curl http://$LB_URL/api/ai-agent/health

# All should return: {"status":"healthy"} or similar
```

### 7.3 Test Frontend

```bash
# Open application in browser
echo "Open this URL: http://$LB_URL"

# Or use command to open
open http://$LB_URL  # macOS
# xdg-open http://$LB_URL  # Linux
```

**In browser, verify:**
- ✅ Homepage loads
- ✅ Login page accessible
- ✅ Can login with test credentials
- ✅ Property search works
- ✅ Booking flow works

### 7.4 Test Database Connection

```bash
# Connect to MongoDB pod
kubectl exec -it mongodb-0 -n gotour -- mongosh

# In mongosh:
use gotour_db
db.users.find().pretty()
db.properties.find().pretty()
exit

# Should show database exists and has collections
```

### 7.5 Test Kafka Events

```bash
# Check Kafka logs for events
kubectl logs -f deployment/booking-service -n gotour | grep "Kafka"
kubectl logs -f deployment/traveler-service -n gotour | grep "Kafka"
kubectl logs -f deployment/owner-service -n gotour | grep "Kafka"

# Look for messages like:
# "Kafka Producer connected"
# "Published to topic: booking-requests"
# "Received message from topic: owner-notifications"
```

---

## 📊 Step 8: Monitor and Troubleshoot

### 8.1 View Logs

```bash
# View logs from all pods
kubectl logs -f -l app=traveler-service -n gotour
kubectl logs -f -l app=owner-service -n gotour
kubectl logs -f -l app=booking-service -n gotour

# View logs from specific pod
kubectl logs <pod-name> -n gotour

# View previous logs (if pod restarted)
kubectl logs <pod-name> -n gotour --previous
```

### 8.2 Describe Resources

```bash
# Get detailed info about a pod
kubectl describe pod <pod-name> -n gotour

# Check deployment details
kubectl describe deployment traveler-service -n gotour

# Check service endpoints
kubectl describe service traveler-service -n gotour
```

### 8.3 Common Issues and Solutions

**Issue: Pods stuck in "Pending" state**
```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod <pod-name> -n gotour

# Solution: May need to scale up nodes or use smaller pods
```

**Issue: Pods in "CrashLoopBackOff"**
```bash
# Check logs
kubectl logs <pod-name> -n gotour

# Common causes:
# - Database connection failed
# - Environment variables missing
# - Port already in use

# Check secrets and configmaps
kubectl get secrets -n gotour
kubectl describe secret <secret-name> -n gotour
```

**Issue: Can't access LoadBalancer URL**
```bash
# Check ingress status
kubectl get ingress -n gotour

# Check if LoadBalancer is provisioned
kubectl get svc -n gotour

# May take 5-10 minutes for AWS to provision LoadBalancer
# Check AWS Console: EC2 → Load Balancers
```

**Issue: Services can't connect to each other**
```bash
# Check service DNS
kubectl exec -it <pod-name> -n gotour -- nslookup mongodb
kubectl exec -it <pod-name> -n gotour -- nslookup kafka

# Check network policies (if any)
kubectl get networkpolicies -n gotour
```

---

## 💰 Step 9: Monitor Costs

### 9.1 Check Current Spending

```bash
# Get today's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +"%Y-%m-%d"),End=$(date -u -v+1d +"%Y-%m-%d") \
  --granularity DAILY \
  --metrics UnblendedCost \
  --region us-east-1

# Check total month-to-date
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +"%Y-%m-01"),End=$(date -u +"%Y-%m-%d") \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --region us-east-1
```

### 9.2 View Costs in Console

```bash
# Open billing dashboard
open https://console.aws.amazon.com/billing/home#/bills

# Check Cost Explorer
open https://console.aws.amazon.com/cost-management/home

# View credits
open https://console.aws.amazon.com/billing/home#/credits
```

**Expected daily cost: ~$4.70/day (3×t3.small)**
**Total for 5 days: ~$23.50**
**Your credits: $100 (automatically applied)**

---

## 📸 Step 10: Take Screenshots for Documentation

**Capture these for your lab submission:**

1. **EKS Cluster:**
   ```bash
   # Screenshot of:
   kubectl get nodes -o wide
   aws eks describe-cluster --name gotour-cluster --region us-east-1
   ```

2. **Running Pods:**
   ```bash
   kubectl get pods -n gotour
   kubectl get all -n gotour
   ```

3. **Application Working:**
   - Homepage in browser
   - Login page
   - Property search
   - Booking creation
   - Admin dashboard

4. **Kafka Events:**
   ```bash
   kubectl logs deployment/booking-service -n gotour | grep "Kafka"
   ```

5. **Billing:**
   - Cost Explorer showing charges
   - Credits being applied
   - Expected daily spend

6. **Architecture:**
   - EKS Console showing cluster
   - EC2 instances
   - Load Balancers

---

## 🎯 Deployment Complete Checklist

**After completing all steps, verify:**

- [ ] EKS cluster created and active
- [ ] 3 worker nodes running (t3.small instances)
- [ ] kubectl configured correctly
- [ ] 5 ECR repositories created
- [ ] 5 Docker images pushed to ECR
- [ ] Kubernetes manifests updated with ECR URLs
- [ ] MongoDB deployed and running
- [ ] Kafka and Zookeeper deployed
- [ ] All 5 microservices deployed and running
- [ ] Frontend deployed and accessible
- [ ] LoadBalancer provisioned with external URL
- [ ] Application accessible via browser
- [ ] Health endpoints responding
- [ ] Database connected
- [ ] Kafka events flowing
- [ ] Billing alerts active
- [ ] Costs within expected range (~$5/day)
- [ ] Screenshots taken for documentation

---

## 🚀 Next Steps

**After successful deployment:**

1. **Phase 6: Testing** (Days 16-17)
   - Functional testing of all features
   - JMeter performance testing
   - Load testing with 100-500 concurrent users

2. **Phase 7: Documentation** (Days 18-19)
   - Write performance analysis
   - Create architecture diagrams
   - Document deployment process
   - Prepare final submission

3. **Cleanup** (After submission)
   - Delete EKS cluster
   - Delete ECR repositories
   - Verify all resources deleted
   - Check final billing

---

## 🆘 Getting Help

**If you encounter issues:**

1. Check logs: `kubectl logs <pod-name> -n gotour`
2. Describe resource: `kubectl describe pod <pod-name> -n gotour`
3. Check AWS Console for resource status
4. Review billing alerts (check email)
5. Consult AWS documentation or this guide

**Common resources:**
- EKS Troubleshooting: https://docs.aws.amazon.com/eks/latest/userguide/troubleshooting.html
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- ECR User Guide: https://docs.aws.amazon.com/ecr/

---

**Deployment Guide Version**: 1.0  
**Last Updated**: November 23, 2024  
**Project**: GoTour (Airbnb Prototype) - Lab 2

