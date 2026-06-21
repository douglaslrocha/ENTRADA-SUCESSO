const fs = require('fs');
let c = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');
c = c.replace(/editor\.on\('blur', closeMenus\);\n/g, '');
c = c.replace(/editor\.off\('blur', closeMenus\);\n/g, '');
fs.writeFileSync('src/components/DiaryEditorPage.tsx', c);
console.log('Done');
