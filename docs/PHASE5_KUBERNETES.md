# 🚀 Phase 5: Kubernetes Local Deployment - GUIDE

**Status:** ✅ Manifests Created, Ready for Deployment  
**Date:** November 21, 2025

---

## 📋 Overview

This phase deploys the entire GoTour application to a local Kubernetes cluster using Minikube. All Docker containers are orchestrated by Kubernetes, providing scalability, high availability, and production-like infrastructure.

---

## 🎯 Phase 5 Objectives

1. ✅ Install Kubernetes tools (minikube, kubectl, helm)
2. ✅ Create Kubernetes manifests for all services
3. ⏳ Deploy MongoDB and Kafka to Minikube
4. ⏳ Deploy all microservices to Kubernetes
5. ⏳ Configure Horizontal Pod Autoscaling
6. ⏳ Test the complete application

---

## 📦 What's Been Created

### Directory Structure
```
k8s/
├── config/
│   ├── namespace.yaml          # GoTour namespace
│   ├── configmap.yaml          # Environment variables
│   ├── secrets.yaml            # API keys and credentials
│   └── encode-secrets.sh       # Helper to encode secrets
├── database/
│   └── mongodb-statefulset.yaml   # MongoDB with persistent storage
├── kafka/
│   ├── zookeeper-deployment.yaml  # Zookeeper for Kafka
│   └── kafka-deployment.yaml      # Kafka message broker
├── services/
│   ├── traveler-deployment.yaml   # Traveler microservice
│   ├── owner-deployment.yaml      # Owner microservice
│   ├── property-deployment.yaml   # Property microservice
│   ├── booking-deployment.yaml    # Booking microservice
│   ├── ai-agent-deployment.yaml   # AI Agent service
│   └── hpa.yaml                   # Horizontal Pod Autoscalers
├── frontend/
│   └── frontend-deployment.yaml   # React frontend
├── ingress/
│   └── ingress.yaml              # Ingress routing (optional)
├── deploy.sh                     # Automated deployment script
└── cleanup.sh                    # Cleanup script
```

### Kubernetes Resources Created

| Resource Type | Name | Purpose |
|--------------|------|---------|
| **Namespace** | gotour | Isolated environment for all resources |
| **ConfigMap** | gotour-config | Non-sensitive configuration |
| **Secret** | gotour-secrets | API keys, passwords, JWT secret |
| **StatefulSet** | mongodb | MongoDB with persistent volume |
| **StatefulSet** | zookeeper | Zookeeper for Kafka coordination |
| **StatefulSet** | kafka | Kafka message broker |
| **Deployment** | traveler-service | Traveler API (2 replicas) |
| **Deployment** | owner-service | Owner API (2 replicas) |
| **Deployment** | property-service | Property API (2 replicas) |
| **Deployment** | booking-service | Booking API (2 replicas) |
| **Deployment** | ai-agent-service | AI Agent (1 replica) |
| **Deployment** | frontend | React app (2 replicas) |
| **Service** | mongodb-service | ClusterIP for MongoDB |
| **Service** | zookeeper-service | ClusterIP for Zookeeper |
| **Service** | kafka-service | ClusterIP for Kafka |
| **Service** | traveler-service | ClusterIP for Traveler API |
| **Service** | owner-service | ClusterIP for Owner API |
| **Service** | property-service | ClusterIP for Property API |
| **Service** | booking-service | ClusterIP for Booking API |
| **Service** | ai-agent-service | ClusterIP for AI Agent |
| **Service** | frontend-service | NodePort for external access |
| **HPA** | *-hpa | Auto-scaling for services |
| **PVC** | mongodb-data | 5GB persistent storage |
| **PVC** | kafka-data | 5GB persistent storage |
| **PVC** | zookeeper-data | 2GB persistent storage |

---

## 🔧 Prerequisites

### Tools Required (Already Installed ✅)
- **minikube** v1.37.0 ✅
- **kubectl** v1.32.2 ✅
- **helm** v3.18.5 ✅
- **docker** v28.3.2 ✅

### System Requirements
- **CPU:** 4 cores minimum
- **Memory:** 8GB RAM minimum
- **Disk:** 20GB free space
- **OS:** macOS (Darwin 23.6.0)

---

## 🚀 Deployment Steps

### Step 1: Configure Secrets

Before deploying, you need to encode your API keys:

```bash
cd k8s/config
./encode-secrets.sh
```

This will read your `.env` file and generate base64-encoded values. Copy these to `secrets.yaml`.

**Alternatively, manually encode:**
```bash
echo -n "your-openai-key" | base64
echo -n "your-tavily-key" | base64
```

Then update `k8s/config/secrets.yaml`:
```yaml
data:
  OPENAI_API_KEY: <your-base64-encoded-key>
  TAVILY_API_KEY: <your-base64-encoded-key>
```

### Step 2: Run the Deployment Script

The automated script handles everything:

```bash
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
./k8s/deploy.sh
```

**What it does:**
1. ✅ Checks if Minikube is running (starts if needed)
2. ✅ Enables metrics-server for HPA
3. ✅ Builds all Docker images inside Minikube
4. ✅ Creates namespace and applies ConfigMap/Secrets
5. ✅ Deploys MongoDB (waits for ready)
6. ✅ Deploys Zookeeper (waits for ready)
7. ✅ Deploys Kafka (waits for ready)
8. ✅ Deploys all microservices (waits for ready)
9. ✅ Deploys frontend (waits for ready)
10. ✅ Applies Horizontal Pod Autoscalers
11. ✅ Displays service URLs

### Step 3: Access the Application

Once deployment is complete:

**Get the frontend URL:**
```bash
minikube service frontend-service -n gotour --url
```

**Or open directly in browser:**
```bash
minikube service frontend-service -n gotour
```

---

## 🔍 Monitoring & Debugging

### Check Pod Status
```bash
kubectl get pods -n gotour
```

**Expected output:**
```
NAME                               READY   STATUS    RESTARTS   AGE
mongodb-0                          1/1     Running   0          5m
zookeeper-0                        1/1     Running   0          4m
kafka-0                            1/1     Running   0          3m
traveler-service-xxxxx-xxxxx       1/1     Running   0          2m
owner-service-xxxxx-xxxxx          1/1     Running   0          2m
property-service-xxxxx-xxxxx       1/1     Running   0          2m
booking-service-xxxxx-xxxxx        1/1     Running   0          2m
ai-agent-service-xxxxx-xxxxx       1/1     Running   0          2m
frontend-xxxxx-xxxxx               1/1     Running   0          1m
```

### View Logs
```bash
# Specific service
kubectl logs -f deployment/booking-service -n gotour

# All pods with a label
kubectl logs -f -l app=traveler-service -n gotour

# Previous container (if crashed)
kubectl logs deployment/booking-service -n gotour --previous
```

### Check Services
```bash
kubectl get services -n gotour
```

### Check HPA Status
```bash
kubectl get hpa -n gotour
```

### Describe a Pod (for troubleshooting)
```bash
kubectl describe pod <pod-name> -n gotour
```

### Execute commands inside a pod
```bash
kubectl exec -it deployment/mongodb -n gotour -- mongosh
```

---

## 📊 Testing the Deployment

### 1. Health Check All Services
```bash
# Traveler Service
kubectl exec -it deployment/traveler-service -n gotour -- curl http://localhost:3001/health

# Owner Service
kubectl exec -it deployment/owner-service -n gotour -- curl http://localhost:3002/health

# Property Service
kubectl exec -it deployment/property-service -n gotour -- curl http://localhost:3003/health

# Booking Service
kubectl exec -it deployment/booking-service -n gotour -- curl http://localhost:3004/health

# AI Agent
kubectl exec -it deployment/ai-agent-service -n gotour -- curl http://localhost:8000/health
```

### 2. Test MongoDB Connection
```bash
kubectl exec -it mongodb-0 -n gotour -- mongosh \
  "mongodb://admin:admin123@localhost:27017/gotour_db?authSource=admin"
```

### 3. Test Kafka
```bash
# List topics
kubectl exec -it kafka-0 -n gotour -- \
  kafka-topics --bootstrap-server localhost:9092 --list

# Expected: booking-requests, owner-notifications, booking-status-updates
```

### 4. Test Frontend
Open the frontend URL in your browser and:
- ✅ Login as traveler (john.traveler@example.com / password123)
- ✅ Create a booking
- ✅ Check Kafka logs for messages
- ✅ Login as owner (jennifer.owner@example.com / password123)
- ✅ Accept the booking
- ✅ Verify status updates

### 5. Test Autoscaling
```bash
# Generate load (in a separate terminal)
kubectl run -it --rm load-generator --image=busybox -n gotour -- \
  sh -c "while true; do wget -q -O- http://traveler-service:3001/health; done"

# Watch HPA scale up
kubectl get hpa -n gotour -w
```

---

## 🧹 Cleanup

### Option 1: Delete Everything
```bash
./k8s/cleanup.sh
```

### Option 2: Manual Cleanup
```bash
# Delete namespace (deletes all resources)
kubectl delete namespace gotour

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

---

## 🔧 Troubleshooting

### Issue: Pods in "ImagePullBackOff"
**Cause:** Docker images not built in Minikube's Docker daemon

**Solution:**
```bash
eval $(minikube docker-env)
docker build -t airbnb-prototype-traveler-service:latest ./services/traveler-service
# Repeat for other services
```

### Issue: Pods in "CrashLoopBackOff"
**Cause:** Application error or missing dependencies

**Solution:**
```bash
kubectl logs deployment/<service-name> -n gotour
kubectl describe pod <pod-name> -n gotour
```

### Issue: MongoDB not ready
**Cause:** Slow startup or resource constraints

**Solution:**
```bash
# Increase Minikube resources
minikube stop
minikube start --cpus=6 --memory=10240

# Check logs
kubectl logs mongodb-0 -n gotour
```

### Issue: Services can't reach MongoDB
**Cause:** MongoDB not fully initialized

**Solution:**
```bash
# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n gotour --timeout=300s

# Restart services
kubectl rollout restart deployment/traveler-service -n gotour
```

### Issue: Frontend can't reach backend services
**Cause:** Wrong service URLs in ConfigMap

**Solution:**
Check ConfigMap has internal K8s DNS names:
```bash
kubectl get configmap gotour-config -n gotour -o yaml
```

Should show: `http://traveler-service:3001`, not `localhost`

---

## 📈 Scaling

### Manual Scaling
```bash
# Scale up
kubectl scale deployment/traveler-service --replicas=5 -n gotour

# Scale down
kubectl scale deployment/traveler-service --replicas=1 -n gotour
```

### Auto-scaling (HPA)
HPA is pre-configured to scale based on:
- **CPU usage > 70%**: Scale up
- **Memory usage > 80%**: Scale up
- **Min replicas:** 2
- **Max replicas:** 5

View HPA status:
```bash
kubectl get hpa -n gotour
kubectl describe hpa traveler-service-hpa -n gotour
```

---

## 🎓 Key Kubernetes Concepts Used

### 1. **Namespaces**
Isolate GoTour resources from other applications

### 2. **ConfigMaps & Secrets**
- ConfigMaps: Non-sensitive config (service URLs, ports)
- Secrets: Sensitive data (API keys, passwords)

### 3. **StatefulSets**
For stateful services (MongoDB, Kafka) that need:
- Stable network identity
- Persistent storage
- Ordered deployment/scaling

### 4. **Deployments**
For stateless services (microservices, frontend):
- Easy rolling updates
- Automatic rollback
- Replica management

### 5. **Services**
Network abstraction to expose pods:
- **ClusterIP**: Internal communication
- **NodePort**: External access (frontend)
- **Headless** (ClusterIP: None): StatefulSet discovery

### 6. **PersistentVolumeClaims (PVC)**
Storage that persists beyond pod lifecycle

### 7. **Horizontal Pod Autoscaler (HPA)**
Automatically scales pods based on metrics

### 8. **Readiness & Liveness Probes**
- **Readiness**: Is pod ready to receive traffic?
- **Liveness**: Is pod healthy? Restart if not.

---

## ✅ Phase 5 Checklist

- ✅ Minikube installed and configured
- ✅ All Kubernetes manifests created
- ✅ ConfigMap with environment variables
- ✅ Secrets for API keys
- ✅ MongoDB StatefulSet with persistent storage
- ✅ Kafka and Zookeeper StatefulSets
- ✅ All microservice Deployments
- ✅ Frontend Deployment with NodePort
- ✅ Horizontal Pod Autoscalers configured
- ✅ Deployment scripts created
- ✅ Cleanup scripts created
- ⏳ Deploy to Minikube
- ⏳ Test complete application
- ⏳ Verify autoscaling

---

## 🚀 Next Steps

1. **Run deployment:**
   ```bash
   ./k8s/deploy.sh
   ```

2. **Verify all pods are running:**
   ```bash
   kubectl get pods -n gotour
   ```

3. **Access frontend:**
   ```bash
   minikube service frontend-service -n gotour
   ```

4. **Test the application** (see Testing section)

5. **Take screenshots for submission:**
   - `kubectl get pods -n gotour`
   - `kubectl get services -n gotour`
   - `kubectl get hpa -n gotour`
   - Frontend running in browser
   - HPA scaling in action

---

## 📚 Additional Resources

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

---

**Phase 5 Status:** ✅ Manifests Complete, Ready for Deployment  
**Next Phase:** Phase 6 - AWS EKS Deployment

