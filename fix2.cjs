const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// Fix Plus Button focus stealing
code = code.replace(/ref=\{sideMenuRef\}\n\s*onClick=\{handleSideMenuClick\}/g, 
  'ref={sideMenuRef}\n                onMouseDown={(e) => e.preventDefault()}\n                onTouchStart={(e) => e.preventDefault()}\n                onClick={handleSideMenuClick}'
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
