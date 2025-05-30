const fs = require('fs');

console.log('Loading prompts from database export...');
const data = JSON.parse(fs.readFileSync('all-prompts.json', 'utf8'));

console.log(`Found ${data.length} prompts to process`);

// Generate the new comprehensive-prompts.js content
let output = 'export const COMPREHENSIVE_PROMPTS = [\n';

data.forEach((prompt, index) => {
  // Escape quotes and handle multiline content properly
  const title = prompt.title ? prompt.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';
  const body = prompt.body ? prompt.body.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') : '';
  const tags = prompt.tags || '';
  const locked = prompt.locked || 0;
  
  output += '  {\n';
  output += `    title: '${title}',\n`;
  output += `    body: '${body}',\n`;
  output += `    tags: '${tags}',\n`;
  output += `    locked: ${locked}\n`;
  output += '  }';
  
  if (index < data.length - 1) {
    output += ',';
  }
  output += '\n';
});

output += '];\n';

// Backup the original file
if (fs.existsSync('backend/comprehensive-prompts.js')) {
  fs.copyFileSync('backend/comprehensive-prompts.js', 'backend/comprehensive-prompts-backup.js');
  console.log('Created backup: backend/comprehensive-prompts-backup.js');
}

// Write the updated file
fs.writeFileSync('backend/comprehensive-prompts.js', output);
console.log(`✅ Updated backend/comprehensive-prompts.js with ${data.length} prompts`);

// Show file size
const stats = fs.statSync('backend/comprehensive-prompts.js');
console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

console.log('🎉 All database prompts have been added to comprehensive-prompts.js!'); 