import fs from 'fs';
import axios from 'axios';

async function importDatabase(jsonFile, apiUrl = 'http://localhost/api') {
  try {
    // Read the JSON export
    const data = fs.readFileSync(jsonFile, 'utf8');
    const prompts = JSON.parse(data);
    
    console.log(`Found ${prompts.length} prompts to import`);
    
    // Import each prompt
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      
      try {
        const response = await axios.post(`${apiUrl}/prompts`, {
          title: prompt.title,
          body: prompt.body,
          tags: prompt.tags,
          locked: prompt.locked
        });
        
        console.log(`✅ Imported: ${prompt.title} (${i + 1}/${prompts.length})`);
      } catch (error) {
        console.error(`❌ Failed to import: ${prompt.title}`, error.message);
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 Database import completed!');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

// Usage
const jsonFile = process.argv[2] || 'database-export.json';
const apiUrl = process.argv[3] || 'http://localhost/api';

importDatabase(jsonFile, apiUrl); 