# 🚀 Quick Deployment Reference Card

**Keep this handy for fast deployments to AWS EKS**

---

## 🔑 Prerequisites (Run Once Per Terminal Session)

```bash
export AWS_ACCOUNT_ID=832495218053
export AWS_REGION=us-east-1
export CLUSTER_NAME=gotour-cluster
export ECR_BASE=832495218053.dkr.ecr.us-east-1.amazonaws.com
```

---

## ⚡ Most Common Scenarios

### Changed Frontend or Backend Code → Deploy Everything

```bash
make eks-all
```

**Time:** 10-15 minutes | **Downtime:** None (rolling update)

---

### Changed ONLY Kubernetes Config (YAML files in `k8s/`)

```bash
make eks-deploy
```

**Time:** 2-3 minutes | **Downtime:** Minimal

---

### Something is Broken → Force Complete Redeploy

```bash
make eks-redeploy
```

**Time:** 5-7 minutes | **Downtime:** Yes (~1-2 min)

---

### Check Deployment Status (Safe, Read-Only)

```bash
make eks-status
```

**Time:** 5 seconds | **Downtime:** None

---

### Seed MongoDB with Test Data (One-Time Setup)

```bash
make eks-seed
```

**Time:** 30 seconds | **Downtime:** None

Populates MongoDB with:
- ✅ 8 test users (4 travelers, 4 owners)
- ✅ 8 properties in various locations
- ✅ 11 bookings (various statuses)
- ✅ 12 favorites

All accounts use password: `password123`

---

## 🎯 Step-by-Step Commands

### Option A: All-in-One (Recommended)

```bash
make eks-all
```

### Option B: Manual Control

```bash
make eks-push       # Build & push Docker images to ECR
make eks-update     # Update K8s manifests with ECR URLs
make eks-deploy     # Deploy to EKS cluster
```

---

## 🐛 Quick Troubleshooting

### Pods Not Starting?

```bash
kubectl get pods -n gotour
kubectl describe pod <pod-name> -n gotour
kubectl logs <pod-name> -n gotour
```

### Changes Not Showing?

```bash
# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+F5)
# Or force restart:
kubectl rollout restart deployment/frontend -n gotour
```

### Check What's Running

```bash
kubectl get pods -n gotour -o wide
kubectl get svc -n gotour
```

---

## 📋 Deployment Checklist

- [ ] Export environment variables
- [ ] Test locally first (`make server`)
- [ ] Run `make eks-all`
- [ ] Wait for pods to show `Running 1/1`
- [ ] Test LoadBalancer URL
- [ ] Check logs if issues

---

## 🔗 Your URLs

**Public LoadBalancer:**
```
http://a5ccdc9e4f8d14f2e9c6206ce988e1b1-1032854876.us-east-1.elb.amazonaws.com
```

**Local Testing (port-forward):**
```bash
kubectl port-forward svc/frontend-service 3000:3000 -n gotour
# Then: http://localhost:3000
```

---

## ⏱️ Time Estimates

| Command | Time |
|---------|------|
| `make eks-all` | 10-15 min |
| `make eks-deploy` | 2-3 min |
| `make eks-redeploy` | 5-7 min |
| `make eks-status` | 5 sec |

---

## 💰 Cost Impact

**All deployments:** $0 extra (same $5.25/day)

---

## 📚 Detailed Docs

For detailed workflows, see: `AWS_DEPLOYMENT_WORKFLOW.md`

---

**Last Updated:** November 23, 2025
