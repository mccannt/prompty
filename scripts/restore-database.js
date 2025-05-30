import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = process.env.API_BASE || 'http://localhost/api';

async function restoreDatabase(backupFile, options = {}) {
  try {
    const { skipExisting = false, clearFirst = false } = options;
    
    console.log('🔄 Starting database restore...');
    console.log(`📁 Backup file: ${backupFile}`);
    
    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    // Read backup file
    console.log('📖 Reading backup file...');
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log(`📊 Backup contains ${backupData.totalPrompts} prompts`);
    console.log(`🕐 Backup timestamp: ${backupData.timestamp}`);
    
    // Clear existing prompts if requested
    if (clearFirst) {
      console.log('🗑️ Clearing existing prompts...');
      const existingPrompts = await axios.get(`${API_BASE}/prompts`);
      for (const prompt of existingPrompts.data) {
        if (!prompt.locked) {
          await axios.delete(`${API_BASE}/prompts/${prompt.id}`);
        }
      }
      console.log('✅ Cleared unlocked prompts');
    }
    
    // Get existing prompts to check for duplicates
    let existingTitles = new Set();
    if (skipExisting) {
      console.log('📥 Fetching existing prompts...');
      const response = await axios.get(`${API_BASE}/prompts`);
      existingTitles = new Set(response.data.map(p => p.title));
      console.log(`📊 Found ${existingTitles.size} existing prompts`);
    }
    
    // Restore prompts
    console.log('📤 Restoring prompts...');
    let restored = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const prompt of backupData.prompts) {
      try {
        // Skip if prompt already exists and skipExisting is true
        if (skipExisting && existingTitles.has(prompt.title)) {
          console.log(`⏭️ Skipping existing prompt: ${prompt.title}`);
          skipped++;
          continue;
        }
        
        // Remove ID from backup data (let database assign new ID)
        const { id, ...promptData } = prompt;
        
        // Restore prompt
        await axios.post(`${API_BASE}/prompts`, promptData);
        console.log(`✅ Restored: ${prompt.title}`);
        restored++;
        
      } catch (error) {
        console.error(`❌ Failed to restore: ${prompt.title}`, error.message);
        failed++;
      }
    }
    
    console.log('\n📊 Restore Summary:');
    console.log(`✅ Successfully restored: ${restored} prompts`);
    console.log(`⏭️ Skipped (already exists): ${skipped} prompts`);
    console.log(`❌ Failed to restore: ${failed} prompts`);
    console.log(`🎉 Restore completed!`);
    
    return { restored, skipped, failed };
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const backupFile = process.argv[2] || './backups/prompts-backup-latest.json';
  const skipExisting = process.argv.includes('--skip-existing');
  const clearFirst = process.argv.includes('--clear-first');
  
  console.log('🔧 Options:');
  console.log(`   Skip existing: ${skipExisting}`);
  console.log(`   Clear first: ${clearFirst}`);
  console.log('');
  
  restoreDatabase(backupFile, { skipExisting, clearFirst })
    .then((result) => {
      console.log(`\n🎉 Restore process completed!`);
    })
    .catch((error) => {
      console.error('❌ Restore process failed:', error);
      process.exit(1);
    });
}

export { restoreDatabase }; 