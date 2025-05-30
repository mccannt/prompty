import fs from 'fs';
import axios from 'axios';
import { execSync } from 'child_process';

async function exportDatabase(format = 'json', outputFile = null, apiUrl = 'http://localhost/api') {
  const timestamp = new Date().toISOString().slice(0, 10);
  
  try {
    if (format === 'json' || format === 'all') {
      // Export via API
      console.log('Fetching prompts from API...');
      const response = await axios.get(`${apiUrl}/prompts`);
      const prompts = response.data;
      
      const jsonFile = outputFile || `database-export-${timestamp}.json`;
      fs.writeFileSync(jsonFile, JSON.stringify(prompts, null, 2));
      console.log(`✅ JSON export saved to: ${jsonFile} (${prompts.length} prompts)`);
    }
    
    if (format === 'sql' || format === 'all') {
      // Export via SQLite dump
      console.log('Creating SQL dump...');
      const sqlFile = outputFile || `database-export-${timestamp}.sql`;
      execSync(`sqlite3 backend/data/db.sqlite ".dump" > ${sqlFile}`);
      console.log(`✅ SQL export saved to: ${sqlFile}`);
    }
    
    if (format === 'sqlite' || format === 'all') {
      // Copy the SQLite file
      console.log('Copying SQLite database...');
      const dbFile = outputFile || `database-backup-${timestamp}.sqlite`;
      execSync(`cp backend/data/db.sqlite ${dbFile}`);
      console.log(`✅ SQLite backup saved to: ${dbFile}`);
    }
    
    console.log('🎉 Database export completed!');
    
  } catch (error) {
    console.error('Export failed:', error.message);
  }
}

// Usage
const format = process.argv[2] || 'json'; // json, sql, sqlite, or all
const outputFile = process.argv[3]; // optional custom filename
const apiUrl = process.argv[4] || 'http://localhost/api';

console.log(`Exporting database in ${format} format...`);
exportDatabase(format, outputFile, apiUrl); 