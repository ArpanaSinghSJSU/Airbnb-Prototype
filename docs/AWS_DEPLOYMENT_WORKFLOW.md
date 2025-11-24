# AWS EKS Deployment Workflow

**Guide for deploying code changes to your AWS EKS cluster**

Last Updated: November 23, 2025

---

## 📋 Prerequisites

Before running any deployment commands, ensure these environment variables are set:

```bash
export AWS_ACCOUNT_ID=832495218053
export AWS_REGION=us-east-1
export CLUSTER_NAME=gotour-cluster
export ECR_BASE=832495218053.dkr.ecr.us-east-1.amazonaws.com
```

💡 **Pro Tip:** Add these to your `~/.zshrc`, `~/.bashrc`, or `~/.config/fish/config.fish` to make them permanent.

---

## 🚀 Quick Deployment Scenarios

### Scenario 1: Changed Frontend Code (React/UI)

**What changed:** Modified files in `frontend/src/`

**Commands to run:**

```bash
# Option A: Full workflow (recommended first time)
make eks-all

# Option B: Manual steps (more control)
make eks-push        # Rebuild and push images
make eks-update      # Update K8s manifests
make eks-deploy      # Deploy to EKS
```

**Time:** ~5-10 minutes  
**What happens:**
1. Frontend Docker image rebuilt for `linux/amd64`
2. Image pushed to ECR with `latest` tag
3. Kubernetes manifest updated with new image URL
4. Frontend deployment restarted to pull new image

---

### Scenario 2: Changed Backend Service (e.g., Traveler, Booking, Property, Owner)

**What changed:** Modified files in `services/*/src/`

**Commands to run:**

```bash
# Full workflow
make eks-all

# Or step by step
make eks-push        # Rebuild and push ALL images
make eks-update      # Update K8s manifests  
make eks-deploy      # Deploy to EKS
```

**Time:** ~8-12 minutes  
**What happens:**
1. All service Docker images rebuilt
2. Images pushed to ECR
3. Kubernetes deployments updated
4. Services restarted with new images

---

### Scenario 3: Changed AI Agent (Python Service)

**What changed:** Modified files in `services/ai-agent/`

**Commands to run:**

```bash
make eks-all
```

**Time:** ~5-8 minutes  
**What happens:**
1. AI Agent Docker image rebuilt
2. Image pushed to ECR
3. Deployment updated and restarted

---

### Scenario 4: Changed Only Kubernetes Configurations (No Code Changes)

**What changed:** Modified files in `k8s/` (e.g., resource limits, env vars, replicas)

**Commands to run:**

```bash
# No need to rebuild images!
make eks-deploy
```

**Time:** ~2-3 minutes  
**What happens:**
1. Kubernetes applies new configurations
2. Pods restarted if needed (depending on changes)

---

### Scenario 5: Force Complete Redeployment

**When to use:** Something is broken, or you want a clean slate

**Commands to run:**

```bash
make eks-redeploy
```

**Time:** ~5-7 minutes  
**What happens:**
1. All existing deployments deleted
2. 15-second wait for pods to terminate
3. Complete redeployment from scratch

⚠️ **Warning:** This will cause ~1-2 minutes of downtime!

---

## 📊 Make Commands Reference

### Core Deployment Commands

| Command | Description | When to Use | Time |
|---------|-------------|-------------|------|
| `make eks-push` | Build and push Docker images to ECR | After code changes | 8-12 min |
| `make eks-update` | Update K8s manifests with ECR URLs | After `eks-push` | 10 sec |
| `make eks-deploy` | Deploy/update to EKS cluster | After `eks-update` or config changes | 2-3 min |
| `make eks-all` | Run all three above in sequence | After any code changes | 10-15 min |
| `make eks-redeploy` | Force complete redeployment | When things are broken | 5-7 min |
| `make eks-status` | Check deployment status | Anytime (read-only) | 5 sec |

### Detailed Command Descriptions

#### `make eks-push`
**What it does:**
1. Builds Docker images for all services using `docker-compose build --platform linux/amd64`
2. Logs into AWS ECR
3. Tags images with ECR repository URLs
4. Pushes images to ECR
5. Verifies freshness of pushed images

**Output:** You'll see each service being built and pushed, with verification timestamps.

**Artifacts:** Docker images in your AWS ECR repositories.

---

#### `make eks-update`
**What it does:**
1. Updates all Kubernetes deployment YAML files in `k8s/` directories
2. Replaces local image references with ECR URLs
3. Makes manifests ready for AWS deployment

**Output:** List of updated files with before/after image URLs.

**Artifacts:** Modified YAML files in `k8s/services/`, `k8s/frontend/`, etc.

---

#### `make eks-deploy`
**What it does:**
1. Connects to your EKS cluster
2. Applies/updates all Kubernetes resources:
   - Namespace
   - Secrets (MongoDB, JWT)
   - ConfigMaps
   - MongoDB StatefulSet
   - Zookeeper StatefulSet
   - Kafka StatefulSet
   - Backend service deployments
   - Frontend deployment
   - Ingress
   - HPA (autoscaling)
3. Waits for pods to become ready

**Output:** Status of each resource being created/updated.

**Artifacts:** Running pods in your EKS cluster.

---

#### `make eks-all`
**What it does:**
- Runs `eks-push`, `eks-update`, and `eks-deploy` in sequence
- Fully automated end-to-end deployment

**Output:** Combined output of all three commands.

**Best for:** Most deployment scenarios after code changes.

---

#### `make eks-redeploy`
**What it does:**
1. **Deletes** all existing deployments in the `gotour` namespace
2. Waits 15 seconds for cleanup
3. Runs `make eks-deploy` to recreate everything

**Output:** Deletion confirmations, then deployment status.

**⚠️ Warning:** Causes downtime! Use only when necessary.

---

#### `make eks-status`
**What it does:**
- Shows pods, services, deployments, and LoadBalancer URL
- Read-only, safe to run anytime

**Output:**
```
📦 Pods:
NAME                                READY   STATUS
ai-agent-service-xxx                1/1     Running
booking-service-xxx                 1/1     Running
...

🌐 Services:
NAME               TYPE           EXTERNAL-IP
frontend-service   LoadBalancer   a5ccdc9e4f8d14f2e9c6206ce988e1b1...

📈 Deployments:
NAME                 READY   UP-TO-DATE   AVAILABLE
ai-agent-service     1/1     1            1
...
```

---

## 🔄 Complete Deployment Workflow (Step by Step)

### After Making Code Changes

**Step 1: Make your code changes**
```bash
# Edit files in frontend/src/ or services/*/src/
vim frontend/src/pages/Login.jsx
```

**Step 2: (Optional) Test locally first**
```bash
make clean-all
make server
# Test at http://localhost:3000
```

**Step 3: Deploy to AWS**
```bash
# One command to rule them all
make eks-all
```

**Step 4: Monitor deployment**
```bash
# In another terminal, watch the pods
kubectl get pods -n gotour -w

# Or use our command
make eks-status
```

**Step 5: Wait for new pods to be ready**
- Look for `Running` status and `1/1` or `2/2` ready count
- Usually takes 1-3 minutes

**Step 6: Test your changes**
- Refresh your LoadBalancer URL
- Frontend changes may require a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

---

## 🐛 Troubleshooting

### Problem: "Required environment variables not set!"

**Solution:**
```bash
export AWS_ACCOUNT_ID=832495218053
export AWS_REGION=us-east-1
export CLUSTER_NAME=gotour-cluster
export ECR_BASE=832495218053.dkr.ecr.us-east-1.amazonaws.com
```

---

### Problem: Pods stuck in "ImagePullBackOff"

**Possible causes:**
1. Image not pushed to ECR
2. Wrong image tag in deployment YAML

**Solution:**
```bash
# Verify images exist in ECR
aws ecr list-images --repository-name frontend --region us-east-1

# Check deployment YAML
cat k8s/frontend/frontend-deployment.yaml | grep image:

# Redeploy
make eks-redeploy
```

---

### Problem: Pods crash-looping (CrashLoopBackOff)

**Check logs:**
```bash
# Get pod name
kubectl get pods -n gotour

# View logs
kubectl logs <pod-name> -n gotour

# For previous crash
kubectl logs <pod-name> -n gotour --previous
```

**Common fixes:**
- Check environment variables in deployment YAML
- Verify MongoDB/Kafka are running
- Check resource limits (memory/CPU)

---

### Problem: Changes not appearing after deployment

**Solution:**
```bash
# 1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)

# 2. Check if new pods were created
kubectl get pods -n gotour -o wide
# Look at the AGE column - should be recent

# 3. Force new deployment
kubectl rollout restart deployment/frontend -n gotour

# 4. Last resort - delete pods to force recreation
kubectl delete pod -l app=frontend -n gotour
```

---

### Problem: "Error from server (AlreadyExists)"

**This is normal!** It means the resource already exists. Kubernetes will update it instead of creating it.

---

### Problem: Deployment taking too long

**Check what's happening:**
```bash
# See pod events
kubectl describe pod <pod-name> -n gotour

# Check deployment status
kubectl rollout status deployment/frontend -n gotour

# See recent events
kubectl get events -n gotour --sort-by='.lastTimestamp'
```

---

## 📈 Advanced Scenarios

### Update Only Frontend (Faster)

If you **only** changed frontend code and want to skip rebuilding backend images:

```bash
# 1. Build and push only frontend
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
docker build -t frontend:latest --platform linux/amd64 ./frontend
docker tag frontend:latest 832495218053.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 832495218053.dkr.ecr.us-east-1.amazonaws.com
docker push 832495218053.dkr.ecr.us-east-1.amazonaws.com/frontend:latest

# 2. Restart frontend deployment
kubectl rollout restart deployment/frontend -n gotour

# 3. Watch the rollout
kubectl rollout status deployment/frontend -n gotour
```

**Time savings:** ~5 minutes vs. full `make eks-all`

---

### Update Only a Specific Backend Service

Example: Only changed the booking service

```bash
# 1. Build and push only booking service
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
docker build -t booking-service:latest --platform linux/amd64 ./services/booking-service
docker tag booking-service:latest 832495218053.dkr.ecr.us-east-1.amazonaws.com/booking-service:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 832495218053.dkr.ecr.us-east-1.amazonaws.com
docker push 832495218053.dkr.ecr.us-east-1.amazonaws.com/booking-service:latest

# 2. Restart booking service deployment
kubectl rollout restart deployment/booking-service -n gotour

# 3. Watch the rollout
kubectl rollout status deployment/booking-service -n gotour
```

---

### Scale Services

**Increase frontend replicas for more traffic:**
```bash
kubectl scale deployment/frontend -n gotour --replicas=3

# Verify
kubectl get pods -n gotour | grep frontend
```

**Scale back down:**
```bash
kubectl scale deployment/frontend -n gotour --replicas=2
```

---

### Rollback a Deployment

**If your new deployment breaks something:**

```bash
# View rollout history
kubectl rollout history deployment/frontend -n gotour

# Rollback to previous version
kubectl rollout undo deployment/frontend -n gotour

# Rollback to specific revision
kubectl rollout undo deployment/frontend -n gotour --to-revision=2
```

---

## 🎯 Best Practices

### 1. Always Test Locally First
```bash
make clean-all
make server
# Test at http://localhost:3000
```

### 2. Use Version Tags (Optional but Recommended)

Instead of always using `latest`, you can tag with versions:

```bash
# Tag with version
docker tag frontend:latest $ECR_BASE/frontend:v1.2.3
docker push $ECR_BASE/frontend:v1.2.3

# Update deployment
kubectl set image deployment/frontend frontend=$ECR_BASE/frontend:v1.2.3 -n gotour
```

### 3. Monitor Deployment Progress

```bash
# Watch pods update in real-time
kubectl get pods -n gotour -w

# Or in a separate terminal
watch kubectl get pods -n gotour
```

### 4. Check Logs After Deployment

```bash
# View logs from new pods
kubectl logs -f deployment/frontend -n gotour --tail=50

# Check for errors
kubectl logs deployment/frontend -n gotour | grep -i error
```

### 5. Verify Health After Deployment

```bash
# Port-forward and test
kubectl port-forward svc/frontend-service 3000:3000 -n gotour

# Or test via LoadBalancer
curl -I http://a5ccdc9e4f8d14f2e9c6206ce988e1b1-1032854876.us-east-1.elb.amazonaws.com
```

---

## ⏱️ Deployment Time Estimates

| Scenario | Command | Typical Time |
|----------|---------|--------------|
| Full deployment (all services) | `make eks-all` | 10-15 minutes |
| Frontend only | Manual build + restart | 3-5 minutes |
| Single backend service | Manual build + restart | 3-5 minutes |
| Config changes only | `make eks-deploy` | 2-3 minutes |
| Force redeploy | `make eks-redeploy` | 5-7 minutes |
| Check status | `make eks-status` | 5 seconds |

---

## 📝 Deployment Checklist

Use this checklist for each deployment:

- [ ] Code changes tested locally (`make server`)
- [ ] Environment variables exported (`AWS_ACCOUNT_ID`, etc.)
- [ ] Changes committed to git (optional but recommended)
- [ ] Run deployment command (`make eks-all`)
- [ ] Monitor pod status (`kubectl get pods -n gotour -w`)
- [ ] Wait for all pods to show `Running` and `1/1` ready
- [ ] Test LoadBalancer URL in browser
- [ ] Check backend APIs if changed (`kubectl port-forward ...`)
- [ ] Review logs for errors (`kubectl logs ...`)
- [ ] Document changes for Lab 2 report

---

## 🆘 Emergency Procedures

### Complete Cluster Failure - Full Reset

**⚠️ LAST RESORT ONLY - Causes significant downtime!**

```bash
# 1. Delete everything in namespace
kubectl delete namespace gotour

# 2. Recreate from scratch
make eks-deploy

# 3. Monitor recovery
kubectl get pods -n gotour -w
```

**Recovery time:** 5-10 minutes

---

### Stuck Resources That Won't Delete

```bash
# Force delete a pod
kubectl delete pod <pod-name> -n gotour --force --grace-period=0

# Force delete a deployment
kubectl delete deployment <deployment-name> -n gotour --force --grace-period=0
```

---

## 📊 Cost Impact of Deployments

**Good news:** Deployments don't add extra cost!

- Building images: **Free** (done locally)
- Pushing to ECR: **Free** (within free tier: 500 MB storage, 1 GB transfer/month)
- Updating pods: **Free** (same number of pods running)
- LoadBalancer: **Same cost** ($0.59/day whether you deploy or not)

**Total cost remains:** $5.25/day regardless of how many deployments you do.

---

## 🔗 Related Documentation

- **Testing Guide:** `EKS_TESTING_GUIDE.md`
- **Access URLs:** `ACCESS_URLS.md`
- **Deployment Complete:** `DEPLOYMENT_COMPLETE.md`
- **Cost Breakdown:** `AWS_COST_BREAKDOWN.md`
- **EKS Setup:** `AWS_EKS_DEPLOYMENT_GUIDE.md`

---

## 🎓 Summary for Lab 2

**For your Lab 2 submission, you'll likely need:**

1. **Initial deployment** (already done):
   ```bash
   make eks-all
   ```

2. **If you make any changes during testing:**
   ```bash
   make eks-all
   ```

3. **To check status for screenshots:**
   ```bash
   make eks-status
   ```

**That's it!** The workflow is simple and automated.

---

**Last Updated:** November 23, 2025  
**Cluster:** gotour-cluster  
**Region:** us-east-1  
**Status:** ✅ All systems operational

