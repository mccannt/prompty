# Data Persistence & Migration Guide

This document explains how data persistence is implemented in the Prompt Library application and provides guidance for backup, restore, and server migration operations.

## 📊 Current Status

✅ **Database Persistence**: Fixed and working  
✅ **Docker Volume**: Properly configured  
✅ **Backup Scripts**: Available and tested  
✅ **Restore Scripts**: Available and tested  
✅ **Migration Guide**: Complete documentation  

## 🗄️ Database Persistence

### How It Works
- **Database Type**: SQLite
- **File Location**: `backend/data/db.sqlite`
- **Docker Volume**: `./backend/data:/app/data`
- **Persistence**: Survives container restarts, rebuilds, and system reboots

### What's Persisted
- All prompts (title, content, tags, lock status)
- Prompt IDs and relationships
- Custom prompts you create
- All 25 Web Dev prompts (once added)

## 🔧 Quick Management Commands

Use the management script for common operations:

```bash
# Check application status
./scripts/manage-prompts.sh status

# Create a backup
./scripts/manage-prompts.sh backup

# List available backups
./scripts/manage-prompts.sh list-backups

# Restore from latest backup
./scripts/manage-prompts.sh restore

# Restore from specific backup
./scripts/manage-prompts.sh restore backups/prompts-backup-2025-05-29T18-44-24-443Z.json

# Restore with options
./scripts/manage-prompts.sh restore --skip-existing
./scripts/manage-prompts.sh restore --clear-first

# Show help
./scripts/manage-prompts.sh help
```

## 💾 Backup & Restore

### Manual Backup
```bash
node scripts/backup-database.js
```

Creates:
- Timestamped backup: `backups/prompts-backup-YYYY-MM-DDTHH-MM-SS-SSSZ.json`
- Latest backup: `backups/prompts-backup-latest.json`

### Manual Restore
```bash
# Restore from latest backup
node scripts/restore-database.js

# Restore from specific file
node scripts/restore-database.js backups/prompts-backup-2025-05-29T18-44-24-443Z.json

# Skip existing prompts (avoid duplicates)
node scripts/restore-database.js --skip-existing

# Clear existing prompts first
node scripts/restore-database.js --clear-first
```

### Automated Backups

Set up daily automated backups:

```bash
# Create backup script
sudo tee /usr/local/bin/backup-prompts.sh > /dev/null << 'EOF'
#!/bin/bash
cd /path/to/your/prompty
node scripts/backup-database.js

# Optional: Upload to cloud storage
# aws s3 cp backups/prompts-backup-latest.json s3://your-bucket/
# gsutil cp backups/prompts-backup-latest.json gs://your-bucket/
EOF

sudo chmod +x /usr/local/bin/backup-prompts.sh

# Add to crontab for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-prompts.sh") | crontab -
```

## 🚚 Server Migration

### Quick Migration (Same OS)
```bash
# On old server
tar -czf prompty-migration.tar.gz backend/data/ backups/ docker-compose.yml frontend/ backend/ nginx/ scripts/

# Transfer to new server
scp prompty-migration.tar.gz user@new-server:/path/to/destination/

# On new server
tar -xzf prompty-migration.tar.gz
docker-compose up -d
```

### Cross-Platform Migration
```bash
# On old server
./scripts/manage-prompts.sh backup
scp backups/prompts-backup-latest.json user@new-server:/path/to/destination/

# On new server (after setting up application)
./scripts/manage-prompts.sh restore backups/prompts-backup-latest.json
```

For detailed migration instructions, see: [scripts/server-migration-guide.md](scripts/server-migration-guide.md)

## 🔍 Verification Commands

After migration or restore, verify everything works:

```bash
# Check containers are running
docker-compose ps

# Verify API is healthy
curl http://localhost/api/health

# Count total prompts
curl -s http://localhost/api/prompts | jq 'length'

# Count Web Dev prompts (should be 25)
curl -s http://localhost/api/prompts | jq '.[] | select(.tags != null and (.tags | contains("Web Dev"))) | .title' | wc -l

# Test the application
open http://localhost  # or your server URL
```

## 🛠️ Troubleshooting

### Database Not Persisting
```bash
# Check if volume mount is correct
docker-compose config | grep -A5 -B5 volumes

# Verify database file exists
ls -la backend/data/db.sqlite

# Check container logs
docker-compose logs backend
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .

# Restart containers
docker-compose restart
```

### Missing Prompts After Restart
```bash
# Check if database file exists
ls -la backend/data/

# If empty, restore from backup
./scripts/manage-prompts.sh restore

# If no backup, the Web Dev prompts will need to be re-added
```

### API Not Responding
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs backend
docker-compose logs nginx

# Restart all containers
docker-compose restart
```

## 📁 File Structure

```
prompty/
├── backend/
│   ├── data/
│   │   └── db.sqlite           # ← Database file (persisted)
│   ├── server.js
│   └── ...
├── backups/                    # ← Backup files (keep these!)
│   ├── prompts-backup-latest.json
│   └── prompts-backup-YYYY-MM-DDTHH-MM-SS-SSSZ.json
├── scripts/
│   ├── backup-database.js      # ← Backup script
│   ├── restore-database.js     # ← Restore script
│   ├── manage-prompts.sh       # ← Management helper
│   └── server-migration-guide.md
├── docker-compose.yml          # ← Contains volume configuration
└── README-persistence.md       # ← This file
```

## 🌐 Cloud Storage Integration

For additional safety, integrate with cloud storage:

### AWS S3
```bash
# Install AWS CLI
aws configure

# Sync backups to S3
aws s3 sync backups/ s3://your-backup-bucket/prompty-backups/

# Restore from S3
aws s3 cp s3://your-backup-bucket/prompty-backups/prompts-backup-latest.json backups/
./scripts/manage-prompts.sh restore
```

### Google Cloud Storage
```bash
# Install gcloud CLI
gcloud auth login

# Sync backups to GCS
gsutil -m rsync -r backups/ gs://your-backup-bucket/prompty-backups/

# Restore from GCS
gsutil cp gs://your-backup-bucket/prompty-backups/prompts-backup-latest.json backups/
./scripts/manage-prompts.sh restore
```

## 📋 Best Practices

1. **Regular Backups**: Set up automated daily backups
2. **Test Restores**: Periodically test restore process
3. **Multiple Copies**: Keep backups in multiple locations
4. **Version Control**: Track changes to application code
5. **Documentation**: Update this guide when making changes
6. **Monitoring**: Monitor disk space for database growth

## 🆘 Emergency Recovery

If everything goes wrong:

1. **Check for backups**: `ls -la backups/`
2. **Restore from latest backup**: `./scripts/manage-prompts.sh restore`
3. **If no backups exist**: The application will reseed with default prompts
4. **Re-add Web Dev prompts**: Use the scripts from your project history
5. **Set up proper backups**: Follow the automated backup instructions above

---

**Need Help?** Check the troubleshooting section above or refer to the [server migration guide](scripts/server-migration-guide.md) for detailed instructions. 