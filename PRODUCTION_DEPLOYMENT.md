# Prompt Library v2 - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Prompt Library v2 application to a production environment.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended) or macOS
- **Docker**: Version 20.10+ 
- **Docker Compose**: Version 2.0+
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space
- **Network**: Ports 80 and 443 available

### Domain & SSL (Optional but Recommended)
- Domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

## 🚀 Quick Deployment

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd prompty

# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

### 2. Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit configuration (see Configuration section below)
nano .env
```

### 3. Deploy
```bash
# Deploy to production
./deploy.sh deploy
```

## ⚙️ Configuration

### Environment Variables (.env)
Create a `.env` file with your production settings:

```bash
# Application Settings
NODE_ENV=production
VITE_API_BASE=/api

# Domain Configuration
DOMAIN_NAME=your-domain.com
SSL_EMAIL=admin@your-domain.com

# Security (Generate strong secrets!)
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# Ports (default values work for most setups)
BACKEND_PORT=5000
FRONTEND_PORT=3000
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443
```

### SSL Configuration (Production)
For HTTPS support, you need SSL certificates:

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/key.pem
sudo chown $USER:$USER ./nginx/ssl/*.pem
```

#### Option 2: Custom Certificates
```bash
# Place your certificates in the nginx/ssl directory
cp your-certificate.pem ./nginx/ssl/cert.pem
cp your-private-key.pem ./nginx/ssl/key.pem
```

#### Enable HTTPS in nginx
Edit `nginx/nginx.prod.conf` and uncomment the HTTPS server block, then update the domain name.

## 🐳 Docker Configuration

### Production Docker Compose
The application uses `docker-compose.prod.yml` for production deployment with:

- **Health checks** for all services
- **Restart policies** (unless-stopped)
- **Resource limits** and logging
- **Security optimizations**
- **Performance tuning**

### Container Architecture
```
┌─────────────────┐
│     nginx       │  ← Reverse proxy, SSL termination, static files
│   (Port 80/443) │
└─────────┬───────┘
          │
    ┌─────▼─────┐ ┌─────────────┐
    │ frontend  │ │  backend    │
    │(Port 3000)│ │(Port 5000)  │
    └───────────┘ └─────┬───────┘
                        │
                  ┌─────▼─────┐
                  │  SQLite   │
                  │ Database  │
                  └───────────┘
```

## 🔧 Deployment Commands

### Basic Operations
```bash
# Deploy application
./deploy.sh deploy

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart

# View logs
./deploy.sh logs

# Check status
./deploy.sh status

# Backup database
./deploy.sh backup
```

### Manual Docker Commands
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart frontend
```

## 🔍 Health Monitoring

### Health Check Endpoints
- **Application**: `http://your-domain.com/health`
- **API**: `http://your-domain.com/api/prompts`

### Container Health
```bash
# Check container health
docker-compose -f docker-compose.prod.yml ps

# View health check logs
docker inspect prompty-nginx-1 | grep -A 10 Health
```

### Log Monitoring
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx access logs
docker exec prompty-nginx-1 tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec prompty-nginx-1 tail -f /var/log/nginx/error.log
```

## 🔒 Security Configuration

### Firewall Setup (Ubuntu/Debian)
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

### Security Headers
The nginx configuration includes:
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection
- **X-Content-Type-Options**: MIME type sniffing protection
- **Content-Security-Policy**: Content security policy
- **Strict-Transport-Security**: HTTPS enforcement (when SSL enabled)

### Rate Limiting
- **API endpoints**: 10 requests/second per IP
- **General endpoints**: 1 request/second per IP
- **Burst allowance**: 20 requests for API, 10 for general

## 💾 Backup & Recovery

### Automated Backups
The deployment script automatically backs up the database before each deployment.

### Manual Backup
```bash
# Backup database
./deploy.sh backup

# Manual backup
cp ./backend/data/db.sqlite ./backups/manual_backup_$(date +%Y%m%d_%H%M%S).sqlite
```

### Restore from Backup
```bash
# Stop application
./deploy.sh stop

# Restore database
cp ./backups/your_backup_file.sqlite ./backend/data/db.sqlite

# Start application
./deploy.sh deploy
```

## 🚀 Cloud Deployment

### AWS EC2
1. Launch EC2 instance (t3.medium or larger)
2. Install Docker and Docker Compose
3. Configure security groups (ports 22, 80, 443)
4. Follow deployment steps above

### DigitalOcean Droplet
1. Create droplet with Docker pre-installed
2. Configure firewall
3. Follow deployment steps above

### Google Cloud Platform
1. Create Compute Engine instance
2. Install Docker and Docker Compose
3. Configure firewall rules
4. Follow deployment steps above

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop apache2  # or nginx, etc.
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x deploy.sh
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in ./nginx/ssl/cert.pem -text -noout

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

#### Database Issues
```bash
# Check database file
ls -la ./backend/data/

# Reset database (WARNING: This deletes all data)
rm ./backend/data/db.sqlite
./deploy.sh restart
```

### Log Analysis
```bash
# Check application startup
docker-compose -f docker-compose.prod.yml logs backend | grep -i error

# Check nginx configuration
docker exec prompty-nginx-1 nginx -t

# Check disk space
df -h
```

## 📊 Performance Optimization

### Resource Monitoring
```bash
# Monitor container resources
docker stats

# Check system resources
htop
```

### Database Optimization
- Regular database backups
- Monitor database size
- Consider database cleanup for old data

### Nginx Optimization
- Gzip compression enabled
- Static file caching
- Connection keep-alive
- Worker process optimization

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Deploy updates
./deploy.sh deploy
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
./deploy.sh deploy
```

### SSL Certificate Renewal
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Copy renewed certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./nginx/ssl/key.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📞 Support

### Getting Help
1. Check logs: `./deploy.sh logs`
2. Verify configuration: `./deploy.sh status`
3. Review this documentation
4. Check Docker and system resources

### Useful Commands Reference
```bash
# Deployment
./deploy.sh deploy          # Full deployment
./deploy.sh stop            # Stop application
./deploy.sh restart         # Restart application
./deploy.sh logs            # View logs
./deploy.sh status          # Check status
./deploy.sh backup          # Backup database

# Docker
docker-compose -f docker-compose.prod.yml ps     # Container status
docker-compose -f docker-compose.prod.yml logs   # View logs
docker system prune -a                           # Clean up Docker

# System
sudo ufw status             # Firewall status
df -h                       # Disk usage
htop                        # System resources
```

---

## 🎉 Deployment Complete!

After successful deployment, your Prompt Library v2 will be available at:
- **HTTP**: `http://your-domain.com`
- **HTTPS**: `https://your-domain.com` (if SSL configured)
- **Health Check**: `http://your-domain.com/health`

The application includes:
- ✅ 63 production-ready prompts (all locked by default)
- ✅ 5 color themes with persistence
- ✅ Collapsible tag filters
- ✅ Bold Commerce branding
- ✅ Modern, responsive UI
- ✅ Complete documentation suite
- ✅ Production-ready infrastructure 