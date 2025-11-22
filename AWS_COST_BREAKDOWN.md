# AWS Deployment Cost Breakdown - GoTour Application

## Overview
This document provides a detailed cost analysis for deploying the GoTour microservices application on AWS using the **cheapest possible configuration** while maintaining functionality for the Lab 2 requirements.

**Deployment Duration**: ~3-5 days (for testing and submission)  
**Estimated Total Cost**: **$15-25** for the entire project period  
**Daily Cost**: **~$5-8/day**

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

**Last Updated**: November 22, 2024  
**Project**: GoTour (Airbnb Prototype) - Lab 2  
**Estimated Total Cost**: **$23-26** (or $0 with student credits)

