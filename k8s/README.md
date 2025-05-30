# Kubernetes Deployment for Prompt Library v2

This directory contains Kubernetes manifests and deployment scripts for running Prompt Library v2 locally on Kubernetes.

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker**: For building container images
- **kubectl**: Kubernetes command-line tool
- **Local Kubernetes cluster**: One of the following:
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Kubernetes enabled
  - [minikube](https://minikube.sigs.k8s.io/docs/start/)
  - [kind](https://kind.sigs.k8s.io/docs/user/quick-start/)

## Quick Start

1. **Start your Kubernetes cluster**:
   ```bash
   # For Docker Desktop: Enable Kubernetes in settings
   
   # For minikube:
   minikube start
   
   # For kind:
   kind create cluster
   ```

2. **Deploy the application**:
   ```bash
   ./k8s/deploy-k8s.sh
   ```

3. **Access the application**:
   - **With Ingress**: http://prompty.local (add `127.0.0.1 prompty.local` to `/etc/hosts`)
   - **Without Ingress**: http://localhost:30080 (or minikube IP:30080)

## Architecture

The Kubernetes deployment consists of:

- **Frontend**: React application (port 3000)
- **Backend**: Node.js API server (port 5000)
- **Nginx**: Reverse proxy and load balancer (port 80)
- **Database**: SQLite with persistent storage
- **Ingress**: External access routing

## Kubernetes Resources

### Core Resources
- `namespace.yaml` - Dedicated namespace for the application
- `configmap.yaml` - Application configuration and nginx config
- `persistent-volume.yaml` - Storage for SQLite database

### Application Components
- `backend-deployment.yaml` - Backend API server deployment and service
- `frontend-deployment.yaml` - Frontend React app deployment and service
- `nginx-deployment.yaml` - Nginx reverse proxy deployment and service
- `ingress.yaml` - External access configuration

### Management
- `kustomization.yaml` - Kustomize configuration for resource management
- `deploy-k8s.sh` - Automated deployment script

## Manual Deployment

If you prefer to deploy manually:

1. **Build Docker images**:
   ```bash
   docker build -t prompty-backend:latest -f backend/Dockerfile backend/
   docker build -t prompty-frontend:latest -f frontend/Dockerfile frontend/
   ```

2. **Load images into cluster** (for minikube/kind):
   ```bash
   # For minikube:
   minikube image load prompty-backend:latest
   minikube image load prompty-frontend:latest
   
   # For kind:
   kind load docker-image prompty-backend:latest
   kind load docker-image prompty-frontend:latest
   ```

3. **Deploy resources**:
   ```bash
   kubectl apply -k k8s/
   ```

4. **Wait for deployment**:
   ```bash
   kubectl wait --for=condition=available --timeout=300s deployment/prompty-backend -n prompty
   kubectl wait --for=condition=available --timeout=300s deployment/prompty-frontend -n prompty
   kubectl wait --for=condition=available --timeout=300s deployment/prompty-nginx -n prompty
   ```

## Accessing the Application

### Option 1: Ingress (Recommended)

If you have an ingress controller installed:

1. Add to your `/etc/hosts` file:
   ```
   127.0.0.1 prompty.local
   ```

2. Access at: http://prompty.local

### Option 2: NodePort

Direct access via NodePort service:

- **Docker Desktop/kind**: http://localhost:30080
- **minikube**: http://$(minikube ip):30080

### Option 3: Port Forward

For development/testing:

```bash
kubectl port-forward service/prompty-nginx 8080:80 -n prompty
```

Then access at: http://localhost:8080

## Monitoring and Debugging

### Check Pod Status
```bash
kubectl get pods -n prompty
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/prompty-backend -n prompty

# Frontend logs
kubectl logs -f deployment/prompty-frontend -n prompty

# Nginx logs
kubectl logs -f deployment/prompty-nginx -n prompty
```

### Check Services
```bash
kubectl get services -n prompty
```

### Describe Resources
```bash
kubectl describe deployment prompty-backend -n prompty
kubectl describe pod <pod-name> -n prompty
```

### Access Pod Shell
```bash
kubectl exec -it deployment/prompty-backend -n prompty -- /bin/sh
```

## Scaling

Scale deployments as needed:

```bash
# Scale backend
kubectl scale deployment prompty-backend --replicas=2 -n prompty

# Scale frontend
kubectl scale deployment prompty-frontend --replicas=2 -n prompty
```

## Configuration

### Environment Variables

Modify the `configmap.yaml` file to change application configuration:

```yaml
data:
  NODE_ENV: "production"
  VITE_API_BASE: "/api"
  BACKEND_PORT: "5000"
  FRONTEND_PORT: "3000"
```

### Resource Limits

Adjust resource requests and limits in deployment files:

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Persistent Storage

The application uses a PersistentVolume for SQLite database storage:

- **Path**: `/tmp/prompty-data` (on host)
- **Size**: 1Gi
- **Access Mode**: ReadWriteOnce

To change storage location, modify `persistent-volume.yaml`:

```yaml
spec:
  hostPath:
    path: /your/custom/path
    type: DirectoryOrCreate
```

## Troubleshooting

### Common Issues

1. **Images not found**:
   - Ensure images are built: `docker images | grep prompty`
   - For minikube/kind: Ensure images are loaded into cluster

2. **Pods stuck in Pending**:
   - Check resource availability: `kubectl describe nodes`
   - Check PVC status: `kubectl get pvc -n prompty`

3. **Application not accessible**:
   - Check service status: `kubectl get svc -n prompty`
   - Verify ingress: `kubectl get ingress -n prompty`
   - Check firewall/port forwarding

4. **Database issues**:
   - Check PV/PVC status: `kubectl get pv,pvc -n prompty`
   - Verify mount path in backend pod

### Health Checks

All deployments include health checks:

- **Liveness Probe**: Restarts unhealthy containers
- **Readiness Probe**: Routes traffic only to ready containers

### Logs and Events

```bash
# View events
kubectl get events -n prompty --sort-by='.lastTimestamp'

# View all logs
kubectl logs -l app=prompty -n prompty --all-containers=true
```

## Cleanup

To remove the entire deployment:

```bash
kubectl delete namespace prompty
```

Or remove specific resources:

```bash
kubectl delete -k k8s/
```

## Development Workflow

For active development:

1. **Make code changes**
2. **Rebuild images**:
   ```bash
   docker build -t prompty-backend:latest -f backend/Dockerfile backend/
   docker build -t prompty-frontend:latest -f frontend/Dockerfile frontend/
   ```
3. **Reload images** (minikube/kind):
   ```bash
   minikube image load prompty-backend:latest
   minikube image load prompty-frontend:latest
   ```
4. **Restart deployments**:
   ```bash
   kubectl rollout restart deployment/prompty-backend -n prompty
   kubectl rollout restart deployment/prompty-frontend -n prompty
   ```

## Security Considerations

- Images use `imagePullPolicy: Never` for local development
- Nginx includes security headers and rate limiting
- No sensitive data in ConfigMaps (use Secrets for production)
- Resource limits prevent resource exhaustion

## Next Steps

For production deployment:

1. Use proper image registry and versioning
2. Implement proper secrets management
3. Add TLS/SSL certificates
4. Configure proper ingress controller
5. Set up monitoring and alerting
6. Implement backup strategies
7. Use proper storage classes 