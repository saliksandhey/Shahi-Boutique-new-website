const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixEncoding(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Specifically replace ONLY the known corrupted string for Rupee
  let original = content;
  content = content.replace(/Ã¢â€šÂ¹/g, '₹');
  content = content.replace(/â‚¹/g, '₹');
  // Removed the dangerous /,1/g replacement
  
  if (content !== original) {
    console.log(`Fixed currency symbol in: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

walkDir('./components', fixEncoding);
walkDir('./app', fixEncoding);
walkDir('./lib', fixEncoding);
