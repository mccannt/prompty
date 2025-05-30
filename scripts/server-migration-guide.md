# Server Migration Guide

This guide helps you migrate your Prompt Library application to a new server while preserving all data.

## Pre-Migration Steps

### 1. Create a Complete Backup
```bash
# Run on the old server
node scripts/backup-database.js
```

### 2. Copy Essential Files
Make sure to copy these critical files/directories:
- `backend/data/` - Database files (SQLite)
- `backups/` - All backup files
- `docker-compose.yml` - Container configuration
- `.env` files (if any)
- Custom configuration files

## Migration Methods

### Method 1: Direct File Copy (Recommended for same OS)
```bash
# On old server - create archive
tar -czf prompty-migration.tar.gz \
  backend/data/ \
  backups/ \
  docker-compose.yml \
  frontend/ \
  backend/ \
  nginx/ \
  scripts/

# Transfer to new server
scp prompty-migration.tar.gz user@new-server:/path/to/destination/

# On new server - extract
tar -xzf prompty-migration.tar.gz
```

### Method 2: Database Export/Import (Cross-platform safe)
```bash
# On old server
node scripts/backup-database.js

# Transfer only the backup file
scp backups/prompts-backup-latest.json user@new-server:/path/to/destination/

# On new server - after setting up application
node scripts/restore-database.js backups/prompts-backup-latest.json
```

## New Server Setup

### 1. Install Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Set Up Application
```bash
# Clone or copy application files
git clone <your-repo> prompty
# OR copy files from migration archive

cd prompty

# Ensure correct permissions
chmod -R 755 .
chown -R $USER:$USER .
```

### 3. Restore Data
```bash
# Method 1: If you copied the data directory
# Files should already be in backend/data/

# Method 2: If using backup file
node scripts/restore-database.js backups/prompts-backup-latest.json

# Start the application
docker-compose up -d
```

### 4. Verify Migration
```bash
# Check container status
docker-compose ps

# Test API endpoint
curl http://localhost/api/health

# Verify prompt count
curl http://localhost/api/prompts | jq 'length'

# Check for Web Dev prompts specifically
curl http://localhost/api/prompts | jq '.[] | select(.tags != null and (.tags | contains("Web Dev"))) | .title' | wc -l
```

## Post-Migration Checklist

- [ ] All containers are running (`docker-compose ps`)
- [ ] Application accessible at expected URL
- [ ] All prompts are present and correct
- [ ] Web Dev prompts are visible (25 expected)
- [ ] Search functionality works
- [ ] Dark mode toggle works
- [ ] Add/edit/delete functions work
- [ ] Lock/unlock functionality works

## Backup Strategy for New Server

### 1. Automated Daily Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-prompts.sh << 'EOF'
#!/bin/bash
cd /path/to/your/prompty
node scripts/backup-database.js
# Optional: Upload to cloud storage
# aws s3 cp backups/prompts-backup-latest.json s3://your-bucket/
EOF

chmod +x /usr/local/bin/backup-prompts.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add line: 0 2 * * * /usr/local/bin/backup-prompts.sh
```

### 2. Database File Monitoring
The SQLite database is automatically persisted in the Docker volume:
- File location: `backend/data/db.sqlite`
- Mounted from host: `./backend/data/`
- Survives container restarts and rebuilds

## Troubleshooting

### Issue: Database not persisting
```bash
# Check if volume mount is correct
docker-compose config

# Verify file location
ls -la backend/data/
```

### Issue: Permission errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Issue: Port conflicts
```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Modify docker-compose.yml to use different port
# Change "80:80" to "8080:80"
```

## Cloud Storage Integration

For additional safety, consider integrating with cloud storage:

```bash
# Example: AWS S3 backup
aws s3 sync backups/ s3://your-backup-bucket/prompty-backups/

# Example: Google Cloud Storage
gsutil -m rsync -r backups/ gs://your-backup-bucket/prompty-backups/

# Example: Basic rsync to remote server
rsync -avz backups/ user@backup-server:/backups/prompty/
``` 