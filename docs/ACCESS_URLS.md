# GoTour Airbnb Prototype - Access URLs

Last Updated: 2025-11-23

## ✅ AWS EKS with ALB Ingress - FULLY WORKING!

### Public URL (No Port Forwarding Needed!)

**🌐 Main Application:**
```
http://k8s-gotour-gotourin-b69db2909a-1119124010.us-east-1.elb.amazonaws.com
```

**🔐 Login Page:**
```
http://k8s-gotour-gotourin-b69db2909a-1119124010.us-east-1.elb.amazonaws.com/login
```

### ✅ What's Working:
- Frontend (React app)
- Login/Signup (Auth API)  
- Properties Search & Details
- Bookings Management
- Owner Dashboard
- Traveler Dashboard
- All Backend APIs

### 🏗️ Architecture:
- AWS Application Load Balancer (ALB)
- AWS Load Balancer Controller
- Path-based routing via Kubernetes Ingress
- All services accessible through single domain
- No nginx proxy needed (Ingress handles routing!)

### 📊 Target Groups (All Healthy):
- Frontend: 2/2 healthy
- Traveler Service: 2/2 healthy
- Owner Service: 2/2 healthy
- Property Service: 2/2 healthy
- Booking Service: 2/2 healthy
- AI Agent: 1/1 healthy

---

## Test Credentials

### Travelers
| Name | Email | Password |
|------|-------|----------|
| John Smith | john.traveler@example.com | password123 |
| Emma Johnson | emma.traveler@example.com | password123 |
| Michael Chen | michael.traveler@example.com | password123 |
| Sarah Williams | sarah.traveler@example.com | password123 |

### Property Owners
| Name | Email | Password |
|------|-------|----------|
| Robert Martinez | robert.owner@example.com | password123 |
| Lisa Anderson | lisa.owner@example.com | password123 |
| David Thompson | david.owner@example.com | password123 |
| Jennifer Lee | jennifer.owner@example.com | password123 |

---

## API Endpoints (All Working!)

Base URL: `http://k8s-gotour-gotourin-b69db2909a-1119124010.us-east-1.elb.amazonaws.com`

### Authentication (Traveler Service)
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/check` - Check auth status

### Properties (Property Service)
- `GET /properties/search` - Search properties
- `GET /properties/:id` - Get property details
- `POST /properties` - Create property (owner)
- `PUT /properties/:id` - Update property (owner)
- `DELETE /properties/:id` - Delete property (owner)

### Bookings (Booking Service)
- `GET /bookings` - Get all bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking status
- `DELETE /bookings/:id` - Cancel booking

### Owner (Owner Service)
- `GET /owner/dashboard` - Owner analytics
- `GET /owner/profile` - Owner profile
- `PUT /owner/profile` - Update profile

### Traveler (Traveler Service)
- `GET /traveler/profile` - Traveler profile
- `PUT /traveler/profile` - Update profile

---

## Cost

**Daily Cost:** ~$5.25/day
- EKS Control Plane: $2.40/day ($0.10/hour)
- 3x t3.small EC2: ~$1.85/day
- Application Load Balancer: ~$0.60/day
- EBS Volumes: ~$0.40/day

**5-Day Total:** ~$26.25 (within budget!)

---

## Kubernetes Commands

### Check Status
```bash
# All pods
kubectl get pods -n gotour

# All services
kubectl get svc -n gotour

# Ingress status
kubectl get ingress -n gotour
```

### View Logs
```bash
# Frontend logs
kubectl logs -n gotour -l app=frontend

# Backend service logs
kubectl logs -n gotour -l app=traveler-service
kubectl logs -n gotour -l app=property-service
kubectl logs -n gotour -l app=booking-service
```

---

## Make Commands

### Deploy Changes
```bash
# Full deployment
make eks-all

# Just push new images
make eks-push

# Just update K8s manifests
make eks-update

# Just deploy to cluster
make eks-deploy
```

### Check Status
```bash
make eks-status
```

### Seed Database
```bash
make eks-seed
```

---

## Browser Testing

1. Open: http://k8s-gotour-gotourin-b69db2909a-1119124010.us-east-1.elb.amazonaws.com
2. Click "Login"
3. Use test credentials (e.g., john.traveler@example.com / password123)
4. Explore the application!

**Note:** Make sure you're not connected to a VPN that might block AWS ELB domains.

---

## Technical Details

### Ingress Configuration
- Single ALB for all services
- Path-based routing:
  - `/` → Frontend
  - `/auth/*` → Traveler Service
  - `/traveler/*` → Traveler Service
  - `/owner/*` → Owner Service
  - `/properties/*` → Property Service
  - `/bookings/*` → Booking Service
  - `/api/concierge/*` → AI Agent

### Load Balancer
- Type: Application Load Balancer (ALB)
- Scheme: Internet-facing
- Target Type: IP (pod IPs)
- Health Checks: HTTP /health on each service
- Port: 80 (HTTP)

### Security
- Security groups configured for ALB
- Pod network policies via CNI
- JWT authentication for APIs
- MongoDB authentication enabled

---

## Previous Access Methods (No Longer Needed)

### ~~Port Forwarding~~ (Not Required!)
We initially used port-forwarding but now have full ALB Ingress working!

### ~~LoadBalancer per Service~~ (Replaced by Ingress)
We initially created individual LoadBalancers but consolidated to a single ALB with Ingress for better architecture and cost savings.

---

## Next Steps

For Lab 2 submission:
1. ✅ Take screenshots of the working application
2. ✅ Show kubectl commands (pods, services, ingress)
3. ✅ Demonstrate login and key features
4. ✅ Show AWS Console (EKS cluster, Load Balancers)
5. ✅ Document the architecture

---

## Support

If the URL is not accessible:
1. Ensure you're not connected to a VPN
2. Check pod status: `kubectl get pods -n gotour`
3. Check target health: See AWS_DEPLOYMENT_WORKFLOW.md
4. Restart pods if needed: `kubectl rollout restart deployment <name> -n gotour`

---

**Status:** ✅ Fully Operational  
**Last Tested:** 2025-11-23  
**Deployment Type:** AWS EKS with ALB Ingress
