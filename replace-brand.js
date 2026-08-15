const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      callback(path.join(dir, f));
    }
  });
}

function replaceInFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js') && !filePath.endsWith('.md')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/AEGIS Academy/g, 'EmberQuest')
    .replace(/Aegis Academy/g, 'EmberQuest')
    .replace(/AEGIS AE/g, 'EmberQuest')
    .replace(/Aegis/g, 'EmberQuest')
    .replace(/AEGIS/g, 'EmberQuest');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated:', filePath);
  }
}

walkDir(path.join(__dirname, 'src'), replaceInFile);
console.log('Replacement complete.');
