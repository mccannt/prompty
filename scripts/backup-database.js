import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = './backups';
const API_BASE = process.env.API_BASE || 'http://localhost/api';

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    // Fetch all prompts
    console.log('📥 Fetching all prompts...');
    const response = await axios.get(`${API_BASE}/prompts`);
    const prompts = response.data;
    
    console.log(`📊 Found ${prompts.length} prompts to backup`);
    
    // Create timestamp for backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `prompts-backup-${timestamp}.json`);
    
    // Prepare backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      totalPrompts: prompts.length,
      prompts: prompts
    };
    
    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Total prompts backed up: ${prompts.length}`);
    
    // Also create a "latest" backup
    const latestBackupFile = path.join(BACKUP_DIR, 'prompts-backup-latest.json');
    fs.writeFileSync(latestBackupFile, JSON.stringify(backupData, null, 2));
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase()
    .then((backupFile) => {
      console.log(`\n🎉 Backup process completed: ${backupFile}`);
    })
    .catch((error) => {
      console.error('❌ Backup process failed:', error);
      process.exit(1);
    });
}

export { backupDatabase }; 