# Docker Setup Guide for Prompt Library v2

This guide provides detailed instructions for setting up and running the Prompt Library application in various containerized environments.

## 🐳 Docker Architecture

The application consists of three main services:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     nginx       │    │    frontend     │    │    backend      │
│  (Port 80)      │    │  (Port 3000)    │    │  (Port 5000)    │
│                 │    │                 │    │                 │
│ • Reverse Proxy │    │ • React App     │    │ • Node.js API   │
│ • Static Files  │    │ • Vite Build    │    │ • SQLite DB     │
│ • Load Balancer │    │ • Tailwind CSS  │    │ • Express       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Docker        │
                    │   Network       │
                    │  (prompty_      │
                    │   default)      │
                    └─────────────────┘
```

## 🚀 Quick Start Commands

### Development Environment

```bash
# Clone and start
git clone <repository-url>
cd prompty
docker-compose up --build

# Access application
open http://localhost
```

### Production Environment

```bash
# Start in background
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📁 Docker Configuration Files

### docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    restart: always
    expose:
      - "5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend/data:/app/data

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE: "/api"
    restart: always
    expose:
      - "3000"

  nginx:
    image: nginx:1.25
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE
ENV VITE_API_BASE $VITE_API_BASE
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### nginx Configuration

```nginx
events {}

http {
  server {
    listen 80;
    server_name _;

    # Serve frontend
    location / {
      proxy_pass http://frontend:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy API requests
    location /api/ {
      proxy_pass http://backend:5000/api/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

## 🔧 Advanced Docker Operations

### Container Management

```bash
# Build without cache
docker-compose build --no-cache

# Start specific service
docker-compose up frontend

# Scale services (if needed)
docker-compose up --scale backend=2

# Remove all containers and volumes
docker-compose down -v --remove-orphans
```

### Debugging Containers

```bash
# Execute commands in running containers
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec nginx sh

# View container resource usage
docker stats

# Inspect container configuration
docker-compose config

# View detailed service information
docker-compose ps --services
```

### Log Management

```bash
# View logs for all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs backend

# View last 50 lines
docker-compose logs --tail=50

# View logs with timestamps
docker-compose logs -t
```

## 🌍 Environment-Specific Configurations

### Development Environment

Create `docker-compose.dev.yml`:

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: ./frontend
      target: build
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    environment:
      - NODE_ENV=development
    command: npm run dev

  backend:
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  nginx:
    ports:
      - "3001:80"  # Different port for dev
```

Run with: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

### Production Environment

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  backend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.3'
    environment:
      - NODE_ENV=production

  nginx:
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.2'
```

Run with: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

### Testing Environment

Create `docker-compose.test.yml`:

```yaml
version: "3.8"
services:
  frontend-test:
    build:
      context: ./frontend
    command: npm test
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend-test:
    build:
      context: ./backend
    command: npm test
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=test
```

## 🔒 Security Considerations

### Production Security

1. **Use specific image versions**:
   ```yaml
   nginx:
     image: nginx:1.25.3-alpine
   ```

2. **Run as non-root user**:
   ```dockerfile
   FROM node:18-alpine
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   USER nextjs
   ```

3. **Limit container resources**:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

4. **Use secrets for sensitive data**:
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

### Network Security

```yaml
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    internal: true  # No external access
```

## 📊 Monitoring & Health Checks

### Health Check Configuration

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/prompts"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Monitoring Commands

```bash
# Check health status
docker-compose ps

# Monitor resource usage
docker stats $(docker-compose ps -q)

# Check container health
docker inspect --format='{{.State.Health.Status}}' container_name
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup
docker-compose exec backend cp /app/db.sqlite /app/data/backup-$(date +%Y%m%d).sqlite

# Copy backup to host
docker cp $(docker-compose ps -q backend):/app/data/backup-$(date +%Y%m%d).sqlite ./backups/
```

### Full System Backup

```bash
# Stop services
docker-compose down

# Backup volumes
docker run --rm -v prompty_backend_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/data-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restart services
docker-compose up -d
```

### Recovery

```bash
# Stop services
docker-compose down -v

# Restore data
docker run --rm -v prompty_backend_data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/data-backup-YYYYMMDD.tar.gz -C /data

# Start services
docker-compose up -d
```

## 🚀 Performance Optimization

### Build Optimization

```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### nginx Optimization

```nginx
http {
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Enable caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 Troubleshooting

### Common Docker Issues

**Container exits immediately**:
```bash
# Check exit code and logs
docker-compose ps
docker-compose logs service_name
```

**Port conflicts**:
```bash
# Find process using port
sudo lsof -i :80
# Kill process or change port in docker-compose.yml
```

**Out of disk space**:
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

**Permission issues**:
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Performance Issues

**Slow builds**:
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1
docker-compose build
```

**High memory usage**:
```bash
# Add memory limits
docker-compose up --memory=512m
```

---

This guide covers comprehensive Docker setup and management for the Prompt Library application. For additional help, refer to the main README.md or contact the development team. 