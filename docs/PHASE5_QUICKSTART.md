# ⚡ Phase 5: Kubernetes Quick Start

**Get GoTour running on Kubernetes in 5 minutes!**

---

## 🚀 Quick Deploy (3 Steps)

### Step 1: Configure API Keys

Update your API keys in the secrets file:

```bash
cd k8s/config
./encode-secrets.sh
```

Copy the output and paste into `k8s/config/secrets.yaml`.

### Step 2: Deploy Everything

```bash
cd /Users/pankakumar/Desktop/MyWorkspace/personal/arpana/Airbnb-Prototype
./k8s/deploy.sh
```

**⏱️ Wait time:** ~5-10 minutes (downloads images, starts services)

### Step 3: Access the App

```bash
minikube service frontend-service -n gotour
```

This will open the frontend in your browser! 🎉

---

## 📋 Using Makefile Commands

Even easier with the Makefile:

```bash
# Deploy to Kubernetes
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs

# Test deployment
make k8s-test

# Cleanup
make k8s-cleanup
```

---

## ✅ Verify Deployment

```bash
# All pods should be "Running"
kubectl get pods -n gotour

# Expected output:
# NAME                               READY   STATUS    RESTARTS   AGE
# mongodb-0                          1/1     Running   0          5m
# zookeeper-0                        1/1     Running   0          4m
# kafka-0                            1/1     Running   0          3m
# traveler-service-xxxxx-xxxxx       1/1     Running   0          2m
# owner-service-xxxxx-xxxxx          1/1     Running   0          2m
# property-service-xxxxx-xxxxx       1/1     Running   0          2m
# booking-service-xxxxx-xxxxx        1/1     Running   0          2m
# ai-agent-service-xxxxx-xxxxx       1/1     Running   0          2m
# frontend-xxxxx-xxxxx               1/1     Running   0          1m
```

---

## 🧪 Test the Application

1. **Login as Traveler:**
   - Email: `john.traveler@example.com`
   - Password: `password123`

2. **Create a Booking**

3. **Login as Owner:**
   - Email: `jennifer.owner@example.com`
   - Password: `password123`

4. **Accept the Booking**

5. **Check Kafka Messages:**
```bash
kubectl logs -f deployment/booking-service -n gotour | grep Kafka
```

---

## 🐛 Quick Troubleshooting

### Pods not starting?
```bash
kubectl describe pod <pod-name> -n gotour
kubectl logs <pod-name> -n gotour
```

### Can't access frontend?
```bash
minikube service frontend-service -n gotour --url
# Copy the URL and open in browser
```

### MongoDB not ready?
```bash
kubectl logs mongodb-0 -n gotour
# Wait a bit longer, MongoDB takes ~2-3 minutes
```

### Need to rebuild?
```bash
# Stop Minikube
minikube stop

# Start fresh
minikube delete
minikube start --cpus=4 --memory=8192

# Deploy again
./k8s/deploy.sh
```

---

## 🧹 Cleanup

```bash
# Remove all resources
make k8s-cleanup

# Or manually:
kubectl delete namespace gotour

# Stop Minikube
minikube stop
```

---

## 📚 Full Documentation

For detailed information, see [PHASE5_KUBERNETES.md](./PHASE5_KUBERNETES.md)

---

**That's it! You now have a production-like Kubernetes deployment!** ☸️🎉

