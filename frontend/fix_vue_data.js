const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'src', 'views');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (content.includes('res.data.list')) {
    content = content.replace(/res\.data\.list/g, 'res.list');
    changed = true;
  }
  if (content.includes('res.data.total')) {
    content = content.replace(/res\.data\.total/g, 'res.total');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

fs.readdirSync(viewsDir).forEach(file => {
  if (file.endsWith('.vue')) {
    fixFile(path.join(viewsDir, file));
  }
});
