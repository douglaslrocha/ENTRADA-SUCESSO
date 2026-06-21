const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

code = code.replace(
  /onMouseDown=\{\(e\) => e\.preventDefault\(\)\}\n\s*onTouchStart=\{\(e\) => e\.preventDefault\(\)\}\n\s*onClick=\{handleSideMenuClick\}/g,
  `onMouseDown={(e) => { e.preventDefault(); handleSideMenuClick(); }}
                onTouchStart={(e) => { e.preventDefault(); handleSideMenuClick(); }}`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
