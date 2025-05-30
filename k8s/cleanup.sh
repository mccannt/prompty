#!/bin/bash

# Cleanup Script for Prompt Library v2 Kubernetes Deployment
# This script removes all Kubernetes resources for the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="prompty"

echo -e "${BLUE}🧹 Starting cleanup for Prompt Library v2${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if kubectl exists
if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Namespace '$NAMESPACE' does not exist. Nothing to clean up.${NC}"
    exit 0
fi

# Show current resources
echo -e "${YELLOW}📊 Current resources in namespace '$NAMESPACE':${NC}"
kubectl get all -n $NAMESPACE

echo ""
read -p "Are you sure you want to delete all resources in namespace '$NAMESPACE'? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}❌ Cleanup cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}🗑️  Deleting all resources...${NC}"

# Delete the namespace (this will delete all resources within it)
kubectl delete namespace $NAMESPACE

# Wait for namespace to be fully deleted
echo -e "${YELLOW}⏳ Waiting for namespace to be fully deleted...${NC}"
while kubectl get namespace $NAMESPACE >/dev/null 2>&1; do
    echo -e "${BLUE}   Still deleting...${NC}"
    sleep 2
done

# Clean up persistent volume (it might not be automatically deleted)
echo -e "${YELLOW}🗑️  Cleaning up persistent volume...${NC}"
if kubectl get pv prompty-db-pv >/dev/null 2>&1; then
    kubectl delete pv prompty-db-pv
    echo -e "${GREEN}✅ Persistent volume deleted${NC}"
else
    echo -e "${BLUE}ℹ️  Persistent volume already deleted${NC}"
fi

# Clean up local data directory (optional)
echo ""
read -p "Do you want to delete the local data directory (/tmp/prompty-data)? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -d "/tmp/prompty-data" ]; then
        sudo rm -rf /tmp/prompty-data
        echo -e "${GREEN}✅ Local data directory deleted${NC}"
    else
        echo -e "${BLUE}ℹ️  Local data directory does not exist${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Local data directory preserved${NC}"
fi

# Clean up Docker images (optional)
echo ""
read -p "Do you want to remove the Docker images? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing Docker images...${NC}"
    
    # Remove backend image
    if docker images prompty-backend:latest -q | grep -q .; then
        docker rmi prompty-backend:latest
        echo -e "${GREEN}✅ Backend image removed${NC}"
    else
        echo -e "${BLUE}ℹ️  Backend image not found${NC}"
    fi
    
    # Remove frontend image
    if docker images prompty-frontend:latest -q | grep -q .; then
        docker rmi prompty-frontend:latest
        echo -e "${GREEN}✅ Frontend image removed${NC}"
    else
        echo -e "${BLUE}ℹ️  Frontend image not found${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Docker images preserved${NC}"
fi

echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
echo -e "${BLUE}💡 To redeploy, run: ./k8s/deploy-k8s.sh${NC}" 