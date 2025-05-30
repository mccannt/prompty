# Prompt Library v2

A modern, containerized prompt management system for engineering teams. Built with React, Node.js, SQLite, and nginx, featuring multiple color themes and a responsive design.

![BOLD Logo](frontend/public/images/bold-logo.svg)

## 🚀 Features

- **Modern UI**: Clean, responsive interface with dark mode support
- **Theme System**: 5 built-in color schemes (Bold Red, Ocean Blue, Forest Green, Royal Purple, Sunset Orange)
- **Prompt Management**: Create, edit, delete, and organize prompts with tags
- **Lock System**: Protect important prompts from accidental changes
- **Tag Filtering**: Organize and filter prompts by categories
- **Copy to Clipboard**: One-click copying of prompt content
- **Containerized**: Fully dockerized for easy deployment
- **Reverse Proxy**: nginx handles routing and static file serving

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

### Installing Docker

#### macOS
```bash
# Install Docker Desktop
brew install --cask docker
```

#### Ubuntu/Debian
```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
```

#### Windows
Download and install [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)

## 🛠 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd prompty
```

### 2. Project Structure

```
prompty/
├── docker-compose.yml          # Container orchestration
├── nginx/
│   └── nginx.conf             # Reverse proxy configuration
├── frontend/                  # React application
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── images/
│   │       └── bold-logo.svg
│   └── src/
│       └── App.jsx
├── backend/                   # Node.js API server
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── README.md
```

### 3. Environment Configuration

The application uses the following default configuration:

- **Frontend**: React app served on port 3000 (internal)
- **Backend**: Node.js API on port 5000 (internal)
- **nginx**: Reverse proxy on port 80 (external)
- **Database**: SQLite file stored in `backend/data/`

No additional environment variables are required for basic setup.

## 🚀 Running the Application

### Quick Start

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### Step-by-Step Startup

1. **Build the containers**:
   ```bash
   docker-compose build
   ```

2. **Start the services**:
   ```bash
   docker-compose up -d
   ```

3. **Verify all services are running**:
   ```bash
   docker-compose ps
   ```

4. **Access the application**:
   - Open your browser and navigate to `http://localhost`
   - The application should load with sample prompts

### Service Health Check

```bash
# Check logs for all services
docker-compose logs

# Check specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f
```

## 🔧 Development & Management

### Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Rebuilding After Changes

```bash
# Rebuild and restart all services
docker-compose up --build

# Rebuild specific service
docker-compose up --build frontend
```

### Database Management

The SQLite database is automatically created and seeded with sample data on first run.

**Database Location**: `backend/data/db.sqlite`

**Backup Database**:
```bash
# Copy database from container
docker-compose exec backend cp /app/db.sqlite /app/data/backup.sqlite
```

**Reset Database**:
```bash
# Stop services and remove volumes
docker-compose down -v

# Restart services (will recreate database)
docker-compose up -d
```

### Accessing Container Shells

```bash
# Access frontend container
docker-compose exec frontend sh

# Access backend container
docker-compose exec backend sh

# Access nginx container
docker-compose exec nginx sh
```

## 🌐 API Endpoints

The backend provides the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prompts` | Get all prompts |
| POST | `/api/prompts` | Create new prompt |
| PUT | `/api/prompts/:id` | Update prompt |
| DELETE | `/api/prompts/:id` | Delete prompt |
| PATCH | `/api/prompts/:id/lock` | Toggle prompt lock status |

### Example API Usage

```bash
# Get all prompts
curl http://localhost/api/prompts

# Create a new prompt
curl -X POST http://localhost/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Prompt",
    "body": "This is a sample prompt",
    "tags": "Technical,Testing",
    "locked": false
  }'
```

## 🎨 Using the Application

### Theme Selection
1. Click the 🎨 icon in the header
2. Choose from 5 available themes:
   - **Bold Red** (default)
   - **Ocean Blue**
   - **Forest Green**
   - **Royal Purple**
   - **Sunset Orange**

### Managing Prompts
- **Add Prompt**: Click "+ Add Prompt" button
- **Edit Prompt**: Click the ✏️ icon (only for unlocked prompts)
- **Delete Prompt**: Click the 🗑️ icon (only for unlocked prompts)
- **Lock/Unlock**: Click the 🔒/🔓 icon to toggle protection
- **View Details**: Click anywhere on a prompt card
- **Copy Content**: Use the "📋 Copy Prompt" button in detail view

### Filtering & Organization
- Use tag buttons to filter prompts by category
- Tags are automatically extracted from prompt metadata
- "All" button shows all prompts

## 🔧 Troubleshooting

### Common Issues

**Port 80 already in use**:
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service or change port in docker-compose.yml
```

**Services not starting**:
```bash
# Check Docker daemon is running
docker info

# Check available disk space
df -h

# Restart Docker service (Linux)
sudo systemctl restart docker
```

**Database issues**:
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

**Frontend not loading**:
```bash
# Check nginx logs
docker-compose logs nginx

# Verify frontend build
docker-compose logs frontend
```

### Performance Optimization

**For production deployment**:

1. **Enable nginx gzip compression** (add to nginx.conf):
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Set resource limits** (add to docker-compose.yml):
   ```yaml
   services:
     frontend:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

3. **Use production builds**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
   ```

## 📦 Deployment

### Docker Compose (Recommended for Development)

1. **Clone repository on server**:
   ```bash
   git clone <repository-url>
   cd prompty
   ```

2. **Set production environment**:
   ```bash
   export NODE_ENV=production
   ```

3. **Start services**:
   ```bash
   docker-compose up -d --build
   ```

4. **Configure reverse proxy** (if using external nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Kubernetes Deployment (Recommended for Production)

For scalable, production-ready deployment on Kubernetes:

#### Prerequisites
- **kubectl**: Kubernetes command-line tool
- **Local Kubernetes cluster**: Docker Desktop, minikube, or kind
- **Docker**: For building container images

#### Quick Deploy
```bash
# Deploy to Kubernetes with automated script
./k8s/deploy-k8s.sh
```

#### Manual Deploy
```bash
# Build images
docker build -t prompty-backend:latest -f backend/Dockerfile backend/
docker build -t prompty-frontend:latest -f frontend/Dockerfile frontend/

# Load images (for local clusters)
minikube image load prompty-backend:latest
minikube image load prompty-frontend:latest

# Deploy all resources
kubectl apply -k k8s/

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/prompty-backend -n prompty
```

#### Access the Application
- **With Ingress**: http://prompty.local (add `127.0.0.1 prompty.local` to `/etc/hosts`)
- **NodePort**: http://localhost:30080 (or minikube IP:30080)
- **Port Forward**: `kubectl port-forward service/prompty-nginx 8080:80 -n prompty`

#### Kubernetes Features
- **High Availability**: Multiple replicas with health checks
- **Persistent Storage**: SQLite database with PersistentVolume
- **Load Balancing**: nginx with automatic scaling
- **Resource Management**: CPU/memory limits and requests
- **Monitoring**: Built-in health checks and logging

#### Scaling
```bash
# Scale backend replicas
kubectl scale deployment prompty-backend --replicas=3 -n prompty

# Scale frontend replicas  
kubectl scale deployment prompty-frontend --replicas=2 -n prompty
```

#### Monitoring
```bash
# Check status
kubectl get pods -n prompty

# View logs
kubectl logs -f deployment/prompty-backend -n prompty

# Monitor resources
kubectl top pods -n prompty
```

**📋 For detailed Kubernetes instructions, see [k8s/README.md](k8s/README.md)**

### SSL/HTTPS Setup

For production with SSL, modify nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test with: `docker-compose up --build`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review container logs: `docker-compose logs`
3. Create an issue in the repository
4. Contact the development team

---

**Built with ❤️ by the BOLD team**