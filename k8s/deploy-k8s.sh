#!/bin/bash

# Kubernetes Deployment Script for Prompt Library v2
# This script builds Docker images and deploys to local Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="prompty"
APP_NAME="prompty"

echo -e "${BLUE}🚀 Starting Kubernetes deployment for Prompt Library v2${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Kubernetes is running
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo -e "${RED}❌ Kubernetes cluster is not accessible. Please start your local cluster (minikube, kind, or Docker Desktop).${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"

# Build backend image
echo -e "${BLUE}Building backend image...${NC}"
docker build -t prompty-backend:latest -f backend/Dockerfile backend/

# Build frontend image
echo -e "${BLUE}Building frontend image...${NC}"
docker build -t prompty-frontend:latest -f frontend/Dockerfile frontend/

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Load images into cluster (for minikube/kind)
if command_exists minikube && minikube status >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Loading images into minikube...${NC}"
    minikube image load prompty-backend:latest
    minikube image load prompty-frontend:latest
elif command_exists kind; then
    # Check if kind cluster exists
    if kind get clusters 2>/dev/null | grep -q "kind"; then
        echo -e "${YELLOW}📦 Loading images into kind cluster...${NC}"
        kind load docker-image prompty-backend:latest
        kind load docker-image prompty-frontend:latest
    fi
fi

# Deploy to Kubernetes
echo -e "${YELLOW}🚀 Deploying to Kubernetes...${NC}"

# Apply all resources
kubectl apply -k k8s/

# Wait for deployments to be ready
echo -e "${YELLOW}⏳ Waiting for deployments to be ready...${NC}"

kubectl wait --for=condition=available --timeout=300s deployment/prompty-backend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/prompty-frontend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/prompty-nginx -n $NAMESPACE

echo -e "${GREEN}✅ All deployments are ready${NC}"

# Get service information
echo -e "${YELLOW}📊 Service Information:${NC}"
kubectl get services -n $NAMESPACE

# Get pod status
echo -e "${YELLOW}📊 Pod Status:${NC}"
kubectl get pods -n $NAMESPACE

# Get access information
echo -e "${YELLOW}🌐 Access Information:${NC}"

# Check if ingress controller is available
if kubectl get ingressclass nginx >/dev/null 2>&1; then
    echo -e "${GREEN}📡 Ingress available at: http://prompty.local${NC}"
    echo -e "${BLUE}💡 Add '127.0.0.1 prompty.local' to your /etc/hosts file${NC}"
else
    echo -e "${YELLOW}⚠️  No ingress controller found. Using NodePort access:${NC}"
    
    if command_exists minikube && minikube status >/dev/null 2>&1; then
        MINIKUBE_IP=$(minikube ip)
        echo -e "${GREEN}📡 Application available at: http://$MINIKUBE_IP:30080${NC}"
    else
        echo -e "${GREEN}📡 Application available at: http://localhost:30080${NC}"
    fi
fi

# Show logs command
echo -e "${BLUE}📝 To view logs, run:${NC}"
echo -e "   kubectl logs -f deployment/prompty-backend -n $NAMESPACE"
echo -e "   kubectl logs -f deployment/prompty-frontend -n $NAMESPACE"
echo -e "   kubectl logs -f deployment/prompty-nginx -n $NAMESPACE"

# Show cleanup command
echo -e "${BLUE}🧹 To cleanup, run:${NC}"
echo -e "   kubectl delete namespace $NAMESPACE"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}" 