# AWS Deployment Cost Breakdown - GoTour Application

## Overview
This document provides a detailed cost analysis for deploying the GoTour microservices application on AWS using the **cheapest possible configuration** while maintaining functionality for the Lab 2 requirements.

**Deployment Duration**: ~3-5 days (for testing and submission)  
**Estimated Total Cost**: **$15-25** for the entire project period  
**Daily Cost**: **~$5-8/day**

---

## 📑 Quick Navigation

- [Cost Optimization Strategy](#-cost-optimization-strategy)
- [Detailed Cost Breakdown](#-detailed-cost-breakdown)
- [Total Cost Summary](#-total-cost-summary)
- [Recommended Configuration](#-recommended-configuration)
- [**AWS Account Setup Guide**](#-aws-account-setup-guide) ⭐ **Start Here**
- [**Complete Cleanup Guide**](#-complete-cleanup-guide-post-deployment) ⭐ **Critical**
- [Deployment Commands](#️-deployment-commands)
- [Cost Comparison](#-cost-comparison-self-hosted-vs-managed)
- [Student Discount Options](#-student-discount-options)

---

## 🎯 Cost Optimization Strategy

### Key Principles
1. ✅ Use **t3.small/t3.medium** instances (cheapest for K8s workloads)
2. ✅ Minimize number of worker nodes (start with 2)
3. ✅ Use **On-Demand** instances (no long-term commitment needed)
4. ✅ Deploy in **us-east-1** (cheapest AWS region)
5. ✅ Self-host MongoDB and Kafka (no managed services)
6. ✅ Use **Application Load Balancer** (cheapest LB option)
7. ✅ **Delete everything after testing** (critical for cost savings)
8. ✅ Use AWS Free Tier wherever applicable

---

## 💰 Detailed Cost Breakdown

### 1. Amazon EKS Control Plane
**Service**: Elastic Kubernetes Service (EKS) Cluster

| Component | Specification | Cost |
|-----------|--------------|------|
| EKS Cluster (Control Plane) | 1 cluster | **$0.10/hour** |
| **Per Day** | 24 hours | **$2.40/day** |
| **5 Days** | Testing period | **$12.00** |

**Description**: 
- AWS manages Kubernetes control plane (master nodes, etcd, API server)
- This is a fixed cost regardless of workload
- **Free Tier**: Not available for EKS control plane

---

### 2. EC2 Worker Nodes (Compute)
**Service**: EC2 instances for running pods

#### Recommended Configuration (Option A - Most Cost-Effective)
| Component | Specification | Hourly Cost | Daily Cost |
|-----------|--------------|-------------|------------|
| Instance Type | **t3.medium** | $0.0416/hr | $0.998/day |
| vCPUs | 2 vCPUs | - | - |
| Memory | 4 GB RAM | - | - |
| **Number of Nodes** | **2 nodes** | - | - |
| **Total Worker Nodes** | 2 × t3.medium | **$0.083/hr** | **$1.99/day** |
| **5 Days Total** | - | - | **$9.95** |

#### Alternative Configuration (Option B - Even Cheaper)
| Component | Specification | Hourly Cost | Daily Cost |
|-----------|--------------|-------------|------------|
| Instance Type | **t3.small** | $0.0208/hr | $0.499/day |
| vCPUs | 2 vCPUs | - | - |
| Memory | 2 GB RAM | - | - |
| **Number of Nodes** | **3 nodes** | - | - |
| **Total Worker Nodes** | 3 × t3.small | **$0.062/hr** | **$1.50/day** |
| **5 Days Total** | - | - | **$7.50** |

**Note**: Option B is cheaper but requires 3 nodes for stability (2 GB RAM each is tight for microservices)

**Recommendation**: ✅ **Use Option A (2 × t3.medium)** for better stability

---

### 3. Elastic Block Storage (EBS)
**Service**: Persistent storage for MongoDB and Kafka

| Component | Size | Cost per GB/month | Prorated (5 days) |
|-----------|------|-------------------|-------------------|
| MongoDB Volume (gp3) | 20 GB | $0.08/GB/month | **$0.27** |
| Kafka Volume (gp3) | 20 GB | $0.08/GB/month | **$0.27** |
| Logs/Uploads Volume | 10 GB | $0.08/GB/month | **$0.13** |
| **Total EBS** | 50 GB | - | **$0.67** |

**5 Days Prorated Calculation**: (50 GB × $0.08 / 30 days) × 5 = $0.67

---

### 4. Elastic Load Balancer
**Service**: Application Load Balancer (ALB)

| Component | Specification | Cost |
|-----------|--------------|------|
| ALB Hours | $0.0225/hour | $0.54/day |
| LCU (Load Balancer Capacity Units) | Minimal (~0.1 LCU) | ~$0.05/day |
| **Total ALB per Day** | - | **$0.59/day** |
| **5 Days Total** | - | **$2.95** |

**Note**: 
- Application Load Balancer is cheapest option for HTTP/HTTPS routing
- Network Load Balancer is more expensive ($0.0225/hr + $0.006/LCU)
- Classic Load Balancer is deprecated

---

### 5. Data Transfer (Networking)
**Service**: Internet egress and inter-AZ traffic

| Type | Estimation | Cost |
|------|-----------|------|
| Data Transfer OUT (Internet) | ~5 GB testing | **$0.45** |
| Data Transfer IN | Free | $0.00 |
| Inter-AZ Transfer | ~2 GB | **$0.02** |
| **Total Networking** | - | **$0.47** |

**Assumptions**:
- Testing with JMeter generates ~5 GB outbound traffic
- Minimal production usage (no real users)

---

### 6. Elastic Container Registry (ECR)
**Service**: Docker image storage

| Component | Storage | Cost |
|-----------|---------|------|
| Image Storage | 5 GB (5 services × ~1 GB each) | **$0.50/month** |
| Prorated (5 days) | - | **$0.08** |

**Free Tier**: 
- ✅ 500 MB storage free per month (we'll exceed this)
- ✅ 500 GB transfer free per month

---

### 7. Self-Hosted Services (No Additional Cost)
These services run on the EC2 worker nodes at **no extra charge**:

| Service | Deployment Method | Cost |
|---------|------------------|------|
| **MongoDB** | StatefulSet in K8s | **$0** |
| **Apache Kafka** | Helm chart (Bitnami) | **$0** |
| **Zookeeper** | Included with Kafka | **$0** |

**Why No Cost?**
- These run as containers on the existing EC2 instances
- Storage is included in EBS volumes (already counted above)
- No AWS MSK ($150+/month) or DocumentDB ($100+/month) needed

---

## 📊 Total Cost Summary

### Option A: 2 × t3.medium (Recommended)

| Component | 5-Day Cost | Percentage |
|-----------|-----------|------------|
| EKS Control Plane | $12.00 | 48% |
| EC2 Worker Nodes (2 × t3.medium) | $9.95 | 40% |
| EBS Storage (50 GB) | $0.67 | 3% |
| Application Load Balancer | $2.95 | 12% |
| Data Transfer | $0.47 | 2% |
| ECR Storage | $0.08 | <1% |
| **TOTAL** | **$26.12** | 100% |

**Per Day**: **$5.22/day**

---

### Option B: 3 × t3.small (Cheapest)

| Component | 5-Day Cost | Percentage |
|-----------|-----------|------------|
| EKS Control Plane | $12.00 | 54% |
| EC2 Worker Nodes (3 × t3.small) | $7.50 | 34% |
| EBS Storage (50 GB) | $0.67 | 3% |
| Application Load Balancer | $2.95 | 13% |
| Data Transfer | $0.47 | 2% |
| ECR Storage | $0.08 | <1% |
| **TOTAL** | **$23.67** | 100% |

**Per Day**: **$4.73/day**

---

## 🎯 Recommended Configuration

### Deployment Specs

```yaml
EKS Cluster:
  Region: us-east-1
  Kubernetes Version: 1.28
  
Node Group:
  Instance Type: t3.medium
  Desired Capacity: 2
  Min Size: 2
  Max Size: 3  # For autoscaling during load tests
  Disk Size: 20 GB per node (gp3)
  
Persistent Volumes:
  - MongoDB: 20 GB gp3 SSD
  - Kafka: 20 GB gp3 SSD
  - Uploads: 10 GB gp3 SSD
  
Load Balancer:
  Type: Application Load Balancer (ALB)
  Scheme: internet-facing
  
Container Registry:
  Service: Amazon ECR
  Total Images: 5 (one per microservice)
```

---

## 💡 Cost Optimization Tips

### Before Deployment
1. ✅ **Choose us-east-1** (N. Virginia) - cheapest AWS region
2. ✅ **Use eksctl** for automated cluster creation (avoids mistakes)
3. ✅ **Enable AWS Cost Explorer** to monitor spending
4. ✅ **Set up billing alerts** (email when cost > $20)

### During Testing
1. ✅ **Scale down when not testing**:
   ```bash
   kubectl scale deployment <name> --replicas=0
   ```
2. ✅ **Stop worker nodes overnight** (if testing spans multiple days):
   ```bash
   eksctl scale nodegroup --cluster=gotour --name=standard-workers --nodes=0
   ```
3. ✅ **Don't use NAT Gateway** (~$32/month) - use public subnets

### After Testing
1. ✅ **DELETE EVERYTHING** within 24 hours:
   ```bash
   eksctl delete cluster --name=gotour-cluster --region=us-east-1
   aws ecr delete-repository --repository-name <name> --force
   ```
2. ✅ **Verify all resources deleted** in AWS Console:
   - EC2 instances
   - Load Balancers
   - EBS volumes (should auto-delete with cluster)
   - Elastic IPs (if any)

---

## 🚨 Common Cost Traps to Avoid

| Trap | Cost Impact | How to Avoid |
|------|------------|--------------|
| **Leaving cluster running** | $5-8/day | Delete after testing ✅ |
| **NAT Gateway** | $32/month | Use public subnets instead ✅ |
| **EBS snapshots** | $0.05/GB/month | Don't create snapshots ✅ |
| **Elastic IPs (unused)** | $0.005/hour | Release after delete ✅ |
| **AWS MSK (Managed Kafka)** | $150+/month | Self-host Kafka in K8s ✅ |
| **DocumentDB (Managed Mongo)** | $100+/month | Self-host MongoDB in K8s ✅ |
| **t3.large or bigger** | 2× the cost | Use t3.medium ✅ |
| **Multiple EKS clusters** | $2.40/day each | Use 1 cluster ✅ |

---

## 📅 Testing Schedule to Minimize Costs

### Day 1: Setup (4-6 hours)
- Create EKS cluster
- Deploy MongoDB and Kafka
- Deploy microservices
- Configure LoadBalancer
- **Cost**: ~$5-8

### Day 2: Functional Testing (4-6 hours)
- Test all API endpoints
- Verify Kafka event flow
- Check logs and monitoring
- Take screenshots
- **Cost**: ~$5-8

### Day 3: Performance Testing (4-6 hours)
- Run JMeter tests (100-500 users)
- Collect metrics and graphs
- **Cost**: ~$5-8

### Day 4: Documentation (2-3 hours)
- Write performance analysis
- Create architecture diagrams
- Final screenshots
- **Cost**: ~$5-8 (can scale down nodes)

### Day 5: Buffer/Cleanup (1 hour)
- Final verification
- **DELETE ALL RESOURCES**
- Verify no charges pending
- **Cost**: ~$1-2 (partial day)

---

## 🔧 AWS Account Setup Guide

### Prerequisites Checklist

Before deploying to AWS, complete these steps:

#### Step 1: Create AWS Account

1. Go to: https://aws.amazon.com/
2. Click **"Create an AWS Account"**
3. Provide required information:
   - Email address
   - Password
   - Account name
   - Credit/Debit card (for verification only)
   - Phone number (for SMS verification)
   - Billing address
4. Choose **Personal** account type (simpler for student projects)
5. Complete verification process

**Note**: You won't be charged unless you exceed Free Tier limits or use paid services.

---

#### Step 2: Apply for AWS Educate Credits (HIGHLY RECOMMENDED)

**Option A: AWS Educate**

```bash
# 1. Go to: https://aws.amazon.com/education/awseducate/
# 2. Click "Join AWS Educate"
# 3. Sign up with your university email (.edu)
# 4. Wait for approval (1-3 days)
# 5. Receive $50-100 in free credits
```

**Option B: GitHub Student Developer Pack**

```bash
# 1. Go to: https://education.github.com/pack
# 2. Verify student status (upload student ID or use .edu email)
# 3. Access AWS credits ($100)
# 4. Apply credits to your AWS account
```

**How to Apply Credits to Your Account:**

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Go to **Billing & Cost Management** → **Credits**
3. Enter your promotional code
4. Click **Redeem**
5. Credits will automatically apply to your bills

**With $50-100 credits, your entire project will cost $0!**

---

#### Step 3: Get AWS Access Keys

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → **Security credentials**
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Choose **Command Line Interface (CLI)**
6. Check the confirmation box
7. Click **Create access key**
8. **IMPORTANT**: Download the CSV file and save it securely!
   - You'll need: Access Key ID and Secret Access Key
   - You cannot retrieve the secret key again after this step

---

#### Step 4: Install AWS Tools

```bash
# Install AWS CLI
brew install awscli

# Verify installation
aws --version
# Expected output: aws-cli/2.x.x or higher

# Install eksctl (EKS cluster management)
brew install eksctl

# Verify installation
eksctl version
# Expected output: 0.x.x

# Install kubectl (Kubernetes CLI)
brew install kubectl

# Verify installation
kubectl version --client
# Expected output: v1.x.x
```

---

#### Step 5: Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# You'll be prompted for:
# AWS Access Key ID: [paste from CSV file]
# AWS Secret Access Key: [paste from CSV file]
# Default region: us-east-1
# Default output format: json
```

**Verify Configuration:**

```bash
# Test AWS CLI
aws sts get-caller-identity

# Expected output:
# {
#     "UserId": "AIDXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/yourname"
# }
```

---

#### Step 6: Set Up Billing Alerts (CRITICAL!)

**Why this is important**: Prevents surprise charges by alerting you when costs exceed thresholds.

**Method 1: Using AWS Console (Recommended for Beginners)**

1. Go to: https://console.aws.amazon.com/billing/home#/preferences
2. Click **Billing Preferences** (left sidebar)
3. Enable these checkboxes:
   - ✅ **Receive PDF Invoice By Email**
   - ✅ **Receive Free Tier Usage Alerts**
   - ✅ **Receive Billing Alerts**
4. Enter your email address
5. Click **Save preferences**

6. Go to CloudWatch Alarms:
   - https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:
7. Click **Create alarm**
8. Click **Select metric** → **Billing** → **Total Estimated Charge**
9. Select **USD** checkbox
10. Click **Select metric**
11. Set conditions:
    - **Threshold type**: Static
    - **Whenever EstimatedCharges is**: Greater than
    - **than**: 15 (for first alert)
12. Click **Next**
13. Create new SNS topic or select existing
14. Enter your email address
15. Click **Create topic**
16. Click **Next** → **Next** → **Create alarm**
17. **Check your email and confirm SNS subscription!**
18. Repeat for $20 and $25 thresholds

**Method 2: Using AWS CLI (Faster for Advanced Users)**

```bash
# First, enable billing alerts in us-east-1
aws cloudwatch put-metric-alarm \
  --alarm-name "Billing-Alert-15USD" \
  --alarm-description "Alert when charges exceed $15" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 15 \
  --comparison-operator GreaterThanThreshold \
  --region us-east-1

# Create additional alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "Billing-Alert-20USD" \
  --alarm-description "Alert when charges exceed $20" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 20 \
  --comparison-operator GreaterThanThreshold \
  --region us-east-1

aws cloudwatch put-metric-alarm \
  --alarm-name "Billing-Alert-25USD" \
  --alarm-description "Alert when charges exceed $25" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 25 \
  --comparison-operator GreaterThanThreshold \
  --region us-east-1
```

---

#### Step 7: Enable Cost Explorer

1. Go to: https://console.aws.amazon.com/cost-management/home
2. Click **Cost Explorer** (left sidebar)
3. Click **Enable Cost Explorer**
4. Wait 24 hours for data to populate

**Benefits:**
- Real-time cost visualization
- Daily spending breakdown
- Service-level cost analysis
- Forecast future costs

---

#### Step 8: Verify Account Limits

Check your account has sufficient limits:

```bash
# Check EC2 instance limits
aws service-quotas get-service-quota \
  --service-code ec2 \
  --quota-code L-1216C47A \
  --region us-east-1

# Expected: At least 20 running On-Demand instances
# You need: 2 t3.medium instances
```

**If limits are too low:**
1. Go to: https://console.aws.amazon.com/servicequotas/
2. Search for "Running On-Demand" instances
3. Request quota increase (usually approved automatically)

---

#### Step 9: Setup Complete Checklist

- [ ] AWS account created and verified
- [ ] Applied for AWS Educate or GitHub Student Pack credits
- [ ] AWS CLI installed and configured
- [ ] eksctl installed
- [ ] kubectl installed
- [ ] Access keys created and stored securely
- [ ] Billing alerts configured ($15, $20, $25)
- [ ] Cost Explorer enabled
- [ ] Account limits verified

**You're now ready to deploy to AWS!**

---

## 🧹 Complete Cleanup Guide (Post-Deployment)

### Why Cleanup is Critical

**Leaving resources running will result in ongoing charges:**
- EKS Control Plane: $2.40/day
- EC2 Instances: $2.00-$10/day depending on size
- Load Balancer: $0.59/day
- EBS Volumes: ~$0.13/day
- **Total**: $5-8/day if not cleaned up!

**Follow this guide IMMEDIATELY after completing your testing to avoid charges.**

---

### Quick Cleanup (Automated Script)

**Option 1: Use this automated cleanup script**

Create a file called `cleanup-aws.sh`:

```bash
#!/bin/bash
# cleanup-aws.sh - Complete AWS resource cleanup for GoTour project

set -e  # Exit on error

REGION="us-east-1"
CLUSTER_NAME="gotour-cluster"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🧹 AWS GoTour Cleanup Script                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "⚠️  This will delete ALL GoTour resources from AWS!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo ""
echo "Starting cleanup process..."
echo ""

# 1. Delete EKS Cluster
echo "1️⃣  Deleting EKS cluster: $CLUSTER_NAME"
echo "   This may take 10-15 minutes..."
eksctl delete cluster --name $CLUSTER_NAME --region $REGION --wait || {
  echo "   ⚠️  Cluster may not exist or already deleted"
}
echo "   ✅ EKS cluster deleted"
echo ""

# 2. Delete Load Balancers
echo "2️⃣  Checking for orphaned load balancers..."
LBS=$(aws elbv2 describe-load-balancers --region $REGION --query 'LoadBalancers[*].LoadBalancerArn' --output text 2>/dev/null || echo "")
if [ -n "$LBS" ]; then
  echo "   Found load balancers, deleting..."
  for lb in $LBS; do
    aws elbv2 delete-load-balancer --load-balancer-arn $lb --region $REGION
    echo "   Deleted: $lb"
  done
else
  echo "   ✅ No load balancers found"
fi
echo ""

# 3. Delete ECR Repositories
echo "3️⃣  Deleting ECR repositories..."
for repo in traveler-service owner-service property-service booking-service ai-agent frontend; do
  aws ecr delete-repository --repository-name $repo --force --region $REGION 2>/dev/null && \
    echo "   ✅ Deleted: $repo" || \
    echo "   ℹ️  Repository $repo not found (may already be deleted)"
done
echo ""

# 4. Check for orphaned EBS Volumes
echo "4️⃣  Checking for unattached EBS volumes..."
VOLUMES=$(aws ec2 describe-volumes \
  --region $REGION \
  --filters Name=status,Values=available \
  --query 'Volumes[*].VolumeId' \
  --output text 2>/dev/null || echo "")
if [ -n "$VOLUMES" ]; then
  echo "   Found unattached volumes:"
  for vol in $VOLUMES; do
    echo "   Deleting volume: $vol"
    aws ec2 delete-volume --volume-id $vol --region $REGION 2>/dev/null || echo "   Failed to delete $vol"
  done
else
  echo "   ✅ No unattached volumes found"
fi
echo ""

# 5. Check for unassociated Elastic IPs
echo "5️⃣  Checking for unassociated Elastic IPs..."
EIPS=$(aws ec2 describe-addresses \
  --region $REGION \
  --query 'Addresses[?InstanceId==`null`].AllocationId' \
  --output text 2>/dev/null || echo "")
if [ -n "$EIPS" ]; then
  echo "   Found unassociated Elastic IPs:"
  for eip in $EIPS; do
    echo "   Releasing: $eip"
    aws ec2 release-address --allocation-id $eip --region $REGION 2>/dev/null || echo "   Failed to release $eip"
  done
else
  echo "   ✅ No unassociated Elastic IPs found"
fi
echo ""

# 6. Delete CloudWatch Log Groups
echo "6️⃣  Deleting CloudWatch log groups..."
aws logs delete-log-group --log-group-name /aws/eks/$CLUSTER_NAME/cluster --region $REGION 2>/dev/null && \
  echo "   ✅ Deleted EKS log group" || \
  echo "   ℹ️  EKS log group not found"
echo ""

# 7. Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ✅ Cleanup Complete!                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 What was deleted:"
echo "   ✅ EKS cluster and worker nodes"
echo "   ✅ Load balancers"
echo "   ✅ ECR repositories"
echo "   ✅ Unattached EBS volumes"
echo "   ✅ Unassociated Elastic IPs"
echo "   ✅ CloudWatch log groups"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Verify deletion in AWS Console (see instructions below)"
echo "   2. Check billing dashboard in 24 hours"
echo "   3. Verify no new charges after 48 hours"
echo ""
echo "🌐 AWS Console Verification URLs:"
echo "   - EC2: https://console.aws.amazon.com/ec2/"
echo "   - EKS: https://console.aws.amazon.com/eks/"
echo "   - ECR: https://console.aws.amazon.com/ecr/"
echo "   - Billing: https://console.aws.amazon.com/billing/"
echo ""
```

**How to use:**

```bash
# Make the script executable
chmod +x cleanup-aws.sh

# Run the script
./cleanup-aws.sh
```

---

### Manual Cleanup (Step-by-Step)

If you prefer manual control, follow these steps:

#### Step 1: Delete EKS Cluster

```bash
# Delete the entire cluster (takes 10-15 minutes)
eksctl delete cluster --name gotour-cluster --region us-east-1 --wait

# Verify deletion
aws eks list-clusters --region us-east-1
# Expected output: []
```

**What this deletes:**
- ✅ EKS control plane
- ✅ Worker nodes (EC2 instances)
- ✅ Node groups
- ✅ Associated IAM roles
- ✅ Security groups
- ✅ Most EBS volumes (if configured with deletionPolicy)

---

#### Step 2: Verify and Delete Load Balancers

```bash
# List all Application Load Balancers
aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[*].[LoadBalancerName,LoadBalancerArn]' \
  --output table

# Delete each load balancer (replace with actual ARN)
aws elbv2 delete-load-balancer \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/xxxx \
  --region us-east-1

# Also check Classic Load Balancers
aws elb describe-load-balancers --region us-east-1

# Delete if any exist
aws elb delete-load-balancer --load-balancer-name <name> --region us-east-1
```

**Why critical**: Load balancers cost $0.54/day even when idle!

---

#### Step 3: Delete ECR Repositories

```bash
# List all ECR repositories
aws ecr describe-repositories --region us-east-1 --output table

# Delete each repository (--force removes all images first)
aws ecr delete-repository --repository-name traveler-service --force --region us-east-1
aws ecr delete-repository --repository-name owner-service --force --region us-east-1
aws ecr delete-repository --repository-name property-service --force --region us-east-1
aws ecr delete-repository --repository-name booking-service --force --region us-east-1
aws ecr delete-repository --repository-name ai-agent --force --region us-east-1
aws ecr delete-repository --repository-name frontend --force --region us-east-1

# Verify deletion
aws ecr describe-repositories --region us-east-1
# Expected: No repositories found
```

---

#### Step 4: Delete Orphaned EBS Volumes

```bash
# List all EBS volumes (available = unattached)
aws ec2 describe-volumes \
  --region us-east-1 \
  --filters Name=status,Values=available \
  --query 'Volumes[*].[VolumeId,Size,State,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Delete each unattached volume
aws ec2 delete-volume --volume-id vol-xxxxx --region us-east-1

# If it fails, use force delete
aws ec2 delete-volume --volume-id vol-xxxxx --region us-east-1 --force
```

**Why critical**: EBS volumes cost $0.08/GB/month even when unattached!

---

#### Step 5: Release Elastic IPs

```bash
# List all Elastic IPs
aws ec2 describe-addresses \
  --region us-east-1 \
  --query 'Addresses[*].[PublicIp,AllocationId,InstanceId]' \
  --output table

# Release unassociated Elastic IPs (InstanceId is null)
aws ec2 release-address --allocation-id eipalloc-xxxxx --region us-east-1
```

**Why critical**: Unassociated Elastic IPs cost $0.005/hour ($3.60/month)!

---

#### Step 6: Check and Delete NAT Gateways

```bash
# List NAT Gateways
aws ec2 describe-nat-gateways \
  --region us-east-1 \
  --query 'NatGateways[*].[NatGatewayId,State,VpcId]' \
  --output table

# Delete any NAT Gateways (if eksctl didn't clean them up)
aws ec2 delete-nat-gateway --nat-gateway-id nat-xxxxx --region us-east-1
```

**Why critical**: NAT Gateways cost $32/month!

---

#### Step 7: Delete CloudWatch Log Groups

```bash
# List log groups
aws logs describe-log-groups --region us-east-1 --output table

# Delete EKS-related log groups
aws logs delete-log-group \
  --log-group-name /aws/eks/gotour-cluster/cluster \
  --region us-east-1
```

---

#### Step 8: Verify All EC2 Instances Terminated

```bash
# Check for any running instances
aws ec2 describe-instances \
  --region us-east-1 \
  --filters Name=instance-state-name,Values=running,pending,stopping,stopped \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Terminate any remaining instances
aws ec2 terminate-instances --instance-ids i-xxxxx --region us-east-1
```

---

### Visual Verification in AWS Console

**After running cleanup commands, verify in AWS Console:**

#### 1. EC2 Dashboard
**URL**: https://console.aws.amazon.com/ec2/

Check these sections (should all show 0 or empty):
- [ ] **Instances** (Running: 0)
- [ ] **Volumes** (In-use: 0, Available: 0)
- [ ] **Elastic IPs** (Allocated: 0)
- [ ] **Load Balancers** (0 load balancers)
- [ ] **NAT Gateways** (0 NAT gateways)
- [ ] **Snapshots** (0 snapshots)

#### 2. EKS Dashboard
**URL**: https://console.aws.amazon.com/eks/

- [ ] **Clusters**: Should show "No clusters"

#### 3. ECR Dashboard
**URL**: https://console.aws.amazon.com/ecr/

- [ ] **Repositories**: Should show "No repositories"

#### 4. VPC Dashboard
**URL**: https://console.aws.amazon.com/vpc/

- [ ] Check if eksctl-created VPCs are deleted
- [ ] Default VPC is okay to keep (free)

#### 5. CloudWatch Dashboard
**URL**: https://console.aws.amazon.com/cloudwatch/

- [ ] **Log Groups**: No /aws/eks/ log groups

#### 6. Billing Dashboard (MOST IMPORTANT)
**URL**: https://console.aws.amazon.com/billing/home

- [ ] Go to **Cost Explorer**
- [ ] Check current month charges
- [ ] Should see charges for the 5-day period only
- [ ] No ongoing daily increases after cleanup

---

### Post-Cleanup Monitoring

**Day 1 After Cleanup:**
- Check AWS Console for all resources (should be empty)
- Check billing dashboard (should show final charges)

**24 Hours After Cleanup:**
- Check billing again
- Verify no new charges appeared

**48 Hours After Cleanup:**
- Final billing check
- Take screenshot of final bill for documentation
- You should see $0.00 for the new day

**If you see charges after cleanup:**
1. Go to Billing → Bills → Charges by service
2. Identify which service is charging
3. Go to that service's console and delete resources
4. Common culprits: Load Balancers, NAT Gateways, Elastic IPs

---

### Daily Cost Monitoring During Deployment

**Run this command daily during your 5-day testing:**

```bash
# Get current month-to-date costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +"%Y-%m-01"),End=$(date -u +"%Y-%m-%d") \
  --granularity DAILY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --region us-east-1
```

**Expected Cost Progression:**
- Day 1: ~$5.22
- Day 2: ~$10.44 (cumulative)
- Day 3: ~$15.66 (cumulative)
- Day 4: ~$20.88 (cumulative)
- Day 5: ~$26.10 (cumulative)

**If costs exceed $30, investigate immediately!**

---

### Emergency Stop Procedure

**If you see unexpected charges or need to stop immediately:**

```bash
# STEP 1: Delete cluster NOW
eksctl delete cluster --name gotour-cluster --region us-east-1

# STEP 2: Check what's still running
aws ec2 describe-instances --region us-east-1 --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' --output table

# STEP 3: Terminate all running instances
aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --region us-east-1 --query 'Reservations[*].Instances[*].InstanceId' --output text) --region us-east-1

# STEP 4: Delete all load balancers
aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[*].LoadBalancerArn' --output text | xargs -I {} aws elbv2 delete-load-balancer --load-balancer-arn {} --region us-east-1

# STEP 5: Delete all NAT Gateways
aws ec2 describe-nat-gateways --region us-east-1 --query 'NatGateways[*].NatGatewayId' --output text | xargs -I {} aws ec2 delete-nat-gateway --nat-gateway-id {} --region us-east-1

# STEP 6: Verify everything is stopped
aws ec2 describe-instances --region us-east-1
aws elbv2 describe-load-balancers --region us-east-1
```

---

### Cleanup Verification Checklist

**Complete this checklist within 24 hours of cleanup:**

#### AWS Console Checks
- [ ] EC2: 0 running instances
- [ ] EC2: 0 volumes (or only volumes you created before this project)
- [ ] EC2: 0 elastic IPs
- [ ] EC2: 0 load balancers
- [ ] EC2: 0 NAT gateways
- [ ] EKS: No clusters
- [ ] ECR: No repositories
- [ ] Billing: No ongoing daily charges

#### CLI Verification
```bash
# Run all these - they should return empty results
aws ec2 describe-instances --region us-east-1 --filters Name=instance-state-name,Values=running
aws eks list-clusters --region us-east-1
aws elbv2 describe-load-balancers --region us-east-1
aws ecr describe-repositories --region us-east-1
aws ec2 describe-nat-gateways --region us-east-1 --filter Name=state,Values=available
```

#### Billing Verification
- [ ] Check Cost Explorer shows flat line (no increase) after cleanup
- [ ] Verify total project cost is within expected range ($23-26)
- [ ] Screenshot final bill for documentation
- [ ] Verify credits were applied (if using AWS Educate)

---

### Final Cost Report Template

**After cleanup, create a final cost report for your documentation:**

```markdown
## AWS Final Cost Report - GoTour Project

**Deployment Period**: [Date] to [Date] (5 days)

### Total Costs
- **EKS Control Plane**: $12.00
- **EC2 Instances**: $9.95
- **Load Balancer**: $2.95
- **EBS Storage**: $0.67
- **Data Transfer**: $0.47
- **ECR Storage**: $0.08
- **Total**: $26.12

### Credits Applied
- **AWS Educate Credits**: -$26.12
- **Net Cost**: $0.00

### Cleanup Verification
- [x] All resources deleted
- [x] Verified in AWS Console
- [x] No ongoing charges
- [x] Screenshot saved

**Cleanup Date**: [Date]
**Final Verification Date**: [Date + 48 hours]
```

---

## 📊 Cost Tracking Spreadsheet

**Track your daily costs with this template:**

| Day | Date | Service | Daily Cost | Cumulative | Notes |
|-----|------|---------|-----------|-----------|-------|
| 1 | 2024-11-23 | EKS + EC2 | $5.22 | $5.22 | Cluster created |
| 2 | 2024-11-24 | EKS + EC2 | $5.22 | $10.44 | Testing APIs |
| 3 | 2024-11-25 | EKS + EC2 | $5.22 | $15.66 | JMeter tests |
| 4 | 2024-11-26 | EKS + EC2 | $5.22 | $20.88 | Documentation |
| 5 | 2024-11-27 | EKS + EC2 | $5.22 | $26.10 | Cleanup |
| **Total** | | | | **$26.10** | |
| **Credits** | | AWS Educate | | -$26.10 | |
| **Net Cost** | | | | **$0.00** | ✅ |

---

## 🛠️ Deployment Commands

### 1. Create EKS Cluster (~15 minutes)
```bash
eksctl create cluster \
  --name gotour-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 3 \
  --managed
```

### 2. Push Images to ECR (~10 minutes)
```bash
# Create repositories
aws ecr create-repository --repository-name traveler-service --region us-east-1
aws ecr create-repository --repository-name owner-service --region us-east-1
aws ecr create-repository --repository-name property-service --region us-east-1
aws ecr create-repository --repository-name booking-service --region us-east-1
aws ecr create-repository --repository-name ai-agent --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push (example for traveler-service)
docker tag traveler-service:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/traveler-service:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/traveler-service:latest
```

### 3. Deploy Application (~5 minutes)
```bash
# Deploy MongoDB
kubectl apply -f k8s/database/mongodb-statefulset.yaml

# Deploy Kafka
kubectl apply -f k8s/kafka/

# Deploy microservices
kubectl apply -f k8s/services/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Deploy ingress
kubectl apply -f k8s/ingress/ingress.yaml
```

### 4. Get LoadBalancer URL
```bash
kubectl get svc -n kube-system
# Look for LoadBalancer EXTERNAL-IP
```

### 5. Delete Everything (~10 minutes)
```bash
# Delete cluster (this deletes everything)
eksctl delete cluster --name gotour-cluster --region us-east-1

# Verify deletion
aws eks list-clusters --region us-east-1
aws ec2 describe-instances --region us-east-1
aws elbv2 describe-load-balancers --region us-east-1

# Delete ECR repositories
aws ecr delete-repository --repository-name traveler-service --force
aws ecr delete-repository --repository-name owner-service --force
aws ecr delete-repository --repository-name property-service --force
aws ecr delete-repository --repository-name booking-service --force
aws ecr delete-repository --repository-name ai-agent --force
```

---

## 📈 Cost Comparison: Self-Hosted vs Managed

### Current Architecture (Self-Hosted)
| Component | Service | 5-Day Cost |
|-----------|---------|-----------|
| Kubernetes | EKS | $12.00 |
| Compute | 2 × t3.medium | $9.95 |
| Database | Self-hosted MongoDB | $0 |
| Message Queue | Self-hosted Kafka | $0 |
| **TOTAL** | | **$21.95** |

### If Using Managed Services (DON'T DO THIS)
| Component | Service | 5-Day Cost |
|-----------|---------|-----------|
| Kubernetes | EKS | $12.00 |
| Compute | 2 × t3.medium | $9.95 |
| Database | DocumentDB (3 instances) | $16.67 |
| Message Queue | Amazon MSK (2 brokers) | $25.00 |
| **TOTAL** | | **$63.62** |

**Savings**: **$41.67** (189% more expensive with managed services!)

---

## 🎓 Student Discount Options

### AWS Educate
- **Free Credits**: $50-100 for students
- **Application**: https://aws.amazon.com/education/awseducate/
- **Approval Time**: 1-3 days
- **Benefit**: Can cover entire project cost!

### GitHub Student Developer Pack
- **Includes**: $100 AWS credits
- **Link**: https://education.github.com/pack
- **Benefit**: Free cloud resources for learning

### How to Apply Credits
1. Get AWS Educate account
2. Receive promotional credit code
3. Apply in AWS Console → Billing → Credits
4. Credits automatically applied to bills

---

## 💰 Final Cost Estimate

### Without Free Credits
- **Best Case** (3 × t3.small): **$23.67** for 5 days
- **Recommended** (2 × t3.medium): **$26.12** for 5 days
- **Per Day**: **$4.73 - $5.22**

### With AWS Educate Credits ($50-100)
- **Effective Cost**: **$0** (fully covered by credits)

### If Extended to 7 Days
- **Best Case**: $33.11
- **Recommended**: $36.54

---

## ✅ Final Recommendations

1. ✅ **Apply for AWS Educate** before starting (get free credits)
2. ✅ **Use 2 × t3.medium instances** (Option A) for stability
3. ✅ **Deploy in us-east-1** (cheapest region)
4. ✅ **Self-host MongoDB and Kafka** (save $40+)
5. ✅ **Complete testing in 3-5 days** (minimize costs)
6. ✅ **Set up billing alerts** at $15, $20, $25
7. ✅ **DELETE EVERYTHING** immediately after submission
8. ✅ **Monitor AWS Cost Explorer daily**
9. ✅ **Take screenshots of costs** for documentation
10. ✅ **Verify zero charges** after deletion

---

## 📞 Support Resources

- **AWS Cost Calculator**: https://calculator.aws/
- **AWS Free Tier**: https://aws.amazon.com/free/
- **EKS Pricing**: https://aws.amazon.com/eks/pricing/
- **EC2 Pricing**: https://aws.amazon.com/ec2/pricing/on-demand/
- **AWS Educate**: https://aws.amazon.com/education/awseducate/

---

**Last Updated**: November 23, 2024  
**Project**: GoTour (Airbnb Prototype) - Lab 2  
**Estimated Total Cost**: **$23-26** (or $0 with student credits)

---

## 📝 Document Changelog

- **Nov 23, 2024**: Added comprehensive AWS Account Setup Guide and Complete Cleanup Guide
- **Nov 22, 2024**: Initial cost breakdown and deployment commands

