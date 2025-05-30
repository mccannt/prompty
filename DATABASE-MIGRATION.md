# Database Migration Guide

This guide explains how to migrate your Prompty database to a new server or environment.

## Current Database Status
- **Database Type:** SQLite
- **Location:** `backend/data/db.sqlite`
- **Size:** ~204KB
- **Prompts:** 388 total prompts
- **Persistence:** Configured via Docker volumes

## Migration Options

### Option 1: Direct File Copy (Recommended for Simple Deployments)

**Pros:** Fast, simple, preserves all data exactly
**Cons:** Requires file system access

```bash
# 1. Create backup
cp backend/data/db.sqlite db-backup-$(date +%Y%m%d).sqlite

# 2. Transfer entire project
rsync -avz /path/to/prompty/ user@newserver:/path/to/destination/

# 3. Deploy on new server
cd /path/to/destination/prompty
docker-compose up -d
```

### Option 2: SQL Export/Import (Most Reliable)

**Pros:** Database-agnostic, version control friendly, easy to inspect
**Cons:** Slightly more steps

**Export (Current Server):**
```bash
# Create SQL dump
sqlite3 backend/data/db.sqlite ".dump" > database-export.sql

# Or use the export script
node scripts/export-database.js sql
```

**Import (New Server):**
```bash
# 1. Set up project (empty database)
docker-compose up -d
docker-compose down

# 2. Import data
sqlite3 backend/data/db.sqlite < database-export.sql

# 3. Start services
docker-compose up -d
```

### Option 3: JSON Export/Import (Most Flexible)

**Pros:** Human-readable, easy to modify, works with any backend
**Cons:** Requires API to be running for import

**Export:**
```bash
# Using export script
node scripts/export-database.js json

# Or manual via API
curl "http://localhost/api/prompts" > database-export.json
```

**Import:**
```bash
# Start your new environment
docker-compose up -d

# Import using script
node scripts/import-database.js database-export.json
```

## Export Scripts Usage

### Export Database
```bash
# Export as JSON (default)
node scripts/export-database.js

# Export as SQL dump
node scripts/export-database.js sql

# Export SQLite file copy
node scripts/export-database.js sqlite

# Export all formats
node scripts/export-database.js all

# Custom filename
node scripts/export-database.js json my-backup.json
```

### Import Database
```bash
# Import from JSON (default file: database-export.json)
node scripts/import-database.js

# Import from specific file
node scripts/import-database.js my-backup.json

# Import to different API endpoint
node scripts/import-database.js database-export.json http://myserver.com/api
```

## Docker Volume Persistence

Your `docker-compose.yml` is already configured for persistence:

```yaml
volumes:
  - ./backend/data:/app/data
```

This means:
- ✅ Database persists across container restarts
- ✅ Data survives container updates
- ✅ Easy to backup (just copy the `backend/data` folder)

## Cloud Deployment Considerations

### AWS/GCP/Azure
```bash
# Option A: Include database in Docker image
COPY backend/data/db.sqlite /app/data/

# Option B: Use cloud storage for persistence
# Mount cloud storage volume to /app/data

# Option C: Use managed database service
# Migrate from SQLite to PostgreSQL/MySQL
```

### Heroku
```bash
# Heroku doesn't support file persistence
# Recommend migrating to Heroku Postgres
# Use JSON export to migrate data
```

### DigitalOcean/Linode
```bash
# Use block storage volumes for persistence
# Mount to /app/data in container
```

## Backup Strategy

### Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * cd /path/to/prompty && node scripts/export-database.js all
```

### Pre-deployment Backup
```bash
# Always backup before deployments
node scripts/export-database.js all
```

### Version Control
```bash
# Consider committing SQL dumps for major versions
git add database-export-v1.0.sql
git commit -m "Database backup for v1.0 release"
```

## Troubleshooting

### Database Locked Error
```bash
# Stop all containers first
docker-compose down

# Then perform database operations
sqlite3 backend/data/db.sqlite ".dump" > backup.sql
```

### Permission Issues
```bash
# Fix ownership
sudo chown -R $USER:$USER backend/data/
chmod 644 backend/data/db.sqlite
```

### Import Failures
```bash
# Check API is running
curl http://localhost/api/prompts

# Check database is accessible
sqlite3 backend/data/db.sqlite "SELECT COUNT(*) FROM prompts;"
```

## Migration Checklist

- [ ] Create backup of current database
- [ ] Test export/import process locally
- [ ] Verify new server meets requirements
- [ ] Transfer database using chosen method
- [ ] Start services and verify data
- [ ] Test application functionality
- [ ] Set up backup strategy on new server

## Files Created
- `database-export.sql` - Complete SQL dump
- `database-export.json` - JSON format export
- `scripts/export-database.js` - Export utility
- `scripts/import-database.js` - Import utility 