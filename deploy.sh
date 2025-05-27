#!/bin/bash

# Prompt Library v2 - Production Deployment Script
# This script automates the deployment process for production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if required files exist
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Production compose file ($COMPOSE_FILE) not found."
    fi
    
    success "Prerequisites check passed"
}

# Create environment file if it doesn't exist
setup_environment() {
    log "Setting up environment..."
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "env.example" ]; then
            cp env.example "$ENV_FILE"
            warning "Created $ENV_FILE from env.example. Please review and update the configuration."
        else
            error "No environment file found. Please create $ENV_FILE with your configuration."
        fi
    fi
    
    success "Environment setup complete"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./nginx/ssl"
    mkdir -p "./backend/data"
    mkdir -p "./logs"
    
    success "Directories created"
}

# Backup existing data
backup_data() {
    log "Creating backup of existing data..."
    
    if [ -f "./backend/data/db.sqlite" ]; then
        BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sqlite"
        cp "./backend/data/db.sqlite" "$BACKUP_FILE"
        success "Database backed up to $BACKUP_FILE"
    else
        log "No existing database found, skipping backup"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment..."
    
    # Pull latest images
    log "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build application images
    log "Building application images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start new containers
    log "Starting new containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    success "Deployment complete"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        error "Some containers are not running. Check logs with: docker-compose -f $COMPOSE_FILE logs"
    fi
    
    # Check application health
    MAX_RETRIES=10
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost/health &> /dev/null; then
            success "Application is healthy"
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log "Health check attempt $RETRY_COUNT/$MAX_RETRIES failed, retrying in 10 seconds..."
        sleep 10
    done
    
    error "Health check failed after $MAX_RETRIES attempts"
}

# Show status
show_status() {
    log "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    log "Application URLs:"
    echo "  - Main Application: http://localhost"
    echo "  - Health Check: http://localhost/health"
    echo "  - API: http://localhost/api/prompts"
    echo ""
    log "Useful Commands:"
    echo "  - View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  - Stop application: docker-compose -f $COMPOSE_FILE down"
    echo "  - Restart application: docker-compose -f $COMPOSE_FILE restart"
    echo "  - Update application: ./deploy.sh"
}

# Main deployment process
main() {
    log "Starting Prompt Library v2 deployment..."
    
    check_prerequisites
    setup_environment
    create_directories
    backup_data
    deploy
    health_check
    show_status
    
    success "Deployment completed successfully!"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        log "Stopping application..."
        docker-compose -f "$COMPOSE_FILE" down
        success "Application stopped"
        ;;
    "restart")
        log "Restarting application..."
        docker-compose -f "$COMPOSE_FILE" restart
        success "Application restarted"
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    "status")
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "backup")
        backup_data
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        echo "  logs     - View application logs"
        echo "  status   - Show container status"
        echo "  backup   - Backup database"
        echo "  help     - Show this help message"
        ;;
    *)
        error "Unknown command: $1. Use '$0 help' for usage information."
        ;;
esac 