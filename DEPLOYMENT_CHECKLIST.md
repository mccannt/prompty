# Deployment Checklist for Prompt Library v2

Use this checklist to ensure a successful deployment of the Prompt Library application in production environments.

## 📋 Pre-Deployment Checklist

### ✅ System Requirements
- [ ] Docker 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] Minimum 2GB RAM available
- [ ] Minimum 5GB disk space available
- [ ] Port 80 available (or alternative port configured)

### ✅ Security Preparation
- [ ] Server firewall configured
- [ ] SSL certificates obtained (if using HTTPS)
- [ ] Domain name configured (if applicable)
- [ ] Backup strategy planned
- [ ] Access controls reviewed

### ✅ Environment Setup
- [ ] Production server access confirmed
- [ ] Git repository access configured
- [ ] Environment variables documented
- [ ] Resource limits planned

## 🚀 Deployment Steps

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
```
- [ ] System updated
- [ ] Docker installed
- [ ] User permissions configured

### 2. Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd prompty

# Review configuration
cat docker-compose.yml
cat nginx/nginx.conf

# Start services
docker-compose up -d --build
```
- [ ] Repository cloned
- [ ] Configuration reviewed
- [ ] Services started successfully

### 3. Service Verification
```bash
# Check service status
docker-compose ps

# Verify logs
docker-compose logs

# Test application
curl -I http://localhost
curl http://localhost/api/prompts
```
- [ ] All services running
- [ ] No error logs
- [ ] Frontend accessible
- [ ] API responding

### 4. Health Checks
- [ ] Application loads in browser
- [ ] Sample prompts visible
- [ ] Theme selector works
- [ ] Add/edit/delete functionality works
- [ ] Dark mode toggle works
- [ ] API endpoints respond correctly

## 🔧 Production Configuration

### nginx Optimization
```nginx
# Add to nginx.conf for production
http {
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name _;

        # Rate limit API requests
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:5000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://frontend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```
- [ ] Gzip compression enabled
- [ ] Security headers added
- [ ] Rate limiting configured

### Resource Limits
Add to `docker-compose.yml`:
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  backend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.3'
        reservations:
          memory: 128M
          cpus: '0.15'

  nginx:
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.2'
        reservations:
          memory: 64M
          cpus: '0.1'
```
- [ ] Memory limits set
- [ ] CPU limits configured
- [ ] Resource reservations defined

## 🔒 Security Hardening

### SSL/HTTPS Setup (Optional)
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```
- [ ] SSL certificates installed
- [ ] HTTPS configuration tested
- [ ] HTTP to HTTPS redirect working

### Firewall Configuration
```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```
- [ ] Firewall rules configured
- [ ] Only necessary ports open
- [ ] SSH access maintained

## 📊 Monitoring Setup

### Log Rotation
```bash
# Configure Docker log rotation
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```
- [ ] Log rotation configured
- [ ] Docker daemon restarted

### Health Monitoring
Create `health-check.sh`:
```bash
#!/bin/bash
# Simple health check script

echo "Checking application health..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "ERROR: Some containers are not running"
    exit 1
fi

# Check if application responds
if ! curl -f http://localhost > /dev/null 2>&1; then
    echo "ERROR: Application not responding"
    exit 1
fi

# Check API
if ! curl -f http://localhost/api/prompts > /dev/null 2>&1; then
    echo "ERROR: API not responding"
    exit 1
fi

echo "All checks passed!"
```
- [ ] Health check script created
- [ ] Monitoring solution planned

## 🔄 Backup Strategy

### Database Backup Script
Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T backend cp /app/db.sqlite /app/data/backup_$DATE.sqlite

# Copy to host
docker cp $(docker-compose ps -q backend):/app/data/backup_$DATE.sqlite $BACKUP_DIR/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sqlite" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sqlite"
```
- [ ] Backup script created
- [ ] Backup schedule configured
- [ ] Backup restoration tested

### Automated Backups
```bash
# Add to crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```
- [ ] Cron job configured
- [ ] Backup notifications set up

## 🚀 Go-Live Checklist

### Final Verification
- [ ] All services healthy
- [ ] Application fully functional
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring active
- [ ] Backups working
- [ ] Documentation updated
- [ ] Team notified

### Post-Deployment
- [ ] Monitor logs for 24 hours
- [ ] Verify backup completion
- [ ] Test disaster recovery
- [ ] Update monitoring dashboards
- [ ] Document any issues
- [ ] Plan maintenance windows

## 📞 Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| DevOps Lead | [Contact Info] | Infrastructure issues |
| Backend Developer | [Contact Info] | API/Database issues |
| Frontend Developer | [Contact Info] | UI/UX issues |
| System Administrator | [Contact Info] | Server/Network issues |

## 🔧 Quick Commands Reference

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart frontend

# Update application
git pull
docker-compose up -d --build

# Emergency stop
docker-compose down --remove-orphans

# Check disk usage
docker system df

# Clean up
docker system prune -a
```

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: ___________  
**Environment**: ___________ 