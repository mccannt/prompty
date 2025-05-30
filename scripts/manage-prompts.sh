#!/bin/bash

# Prompt Library Management Script
# Usage: ./scripts/manage-prompts.sh [backup|restore|help]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

case "$1" in
    backup)
        echo "🔄 Creating backup..."
        node scripts/backup-database.js
        echo ""
        echo "📁 Backup files available:"
        ls -la backups/
        ;;
    
    restore)
        BACKUP_FILE="${2:-backups/prompts-backup-latest.json}"
        
        if [[ ! -f "$BACKUP_FILE" ]]; then
            echo "❌ Backup file not found: $BACKUP_FILE"
            echo "📁 Available backup files:"
            ls -la backups/ 2>/dev/null || echo "No backup files found"
            exit 1
        fi
        
        echo "🔄 Restoring from backup: $BACKUP_FILE"
        
        # Check for additional options
        RESTORE_OPTS=""
        if [[ "$3" == "--skip-existing" ]]; then
            RESTORE_OPTS="--skip-existing"
        elif [[ "$3" == "--clear-first" ]]; then
            RESTORE_OPTS="--clear-first"
        fi
        
        node scripts/restore-database.js "$BACKUP_FILE" $RESTORE_OPTS
        ;;
    
    list-backups)
        echo "📁 Available backup files:"
        if [[ -d "backups" ]]; then
            ls -la backups/
        else
            echo "No backup directory found"
        fi
        ;;
    
    status)
        echo "🔍 Application Status:"
        echo ""
        echo "Docker containers:"
        docker-compose ps 2>/dev/null || echo "Docker Compose not available"
        echo ""
        echo "Database file:"
        if [[ -f "backend/data/db.sqlite" ]]; then
            echo "✅ Database file exists: $(ls -lh backend/data/db.sqlite | awk '{print $5}')"
        else
            echo "❌ Database file not found"
        fi
        echo ""
        echo "API Health:"
        curl -s http://localhost/api/health 2>/dev/null && echo "" || echo "❌ API not responding"
        echo ""
        echo "Total prompts:"
        curl -s http://localhost/api/prompts 2>/dev/null | jq 'length' || echo "❌ Cannot fetch prompts"
        ;;
    
    help|*)
        echo "Prompt Library Management Script"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  backup              Create a backup of all prompts"
        echo "  restore [file]      Restore prompts from backup file"
        echo "                      (defaults to latest backup)"
        echo "  list-backups        Show available backup files"
        echo "  status              Show application and database status"
        echo "  help                Show this help message"
        echo ""
        echo "Restore options:"
        echo "  --skip-existing     Skip prompts that already exist"
        echo "  --clear-first       Clear existing prompts before restore"
        echo ""
        echo "Examples:"
        echo "  $0 backup"
        echo "  $0 restore"
        echo "  $0 restore backups/prompts-backup-2025-05-29T18-44-24-443Z.json"
        echo "  $0 restore --skip-existing"
        echo "  $0 status"
        ;;
esac 