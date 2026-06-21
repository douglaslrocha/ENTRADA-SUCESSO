const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

code = code.replace(
  /onMouseDown=\{\(e\) => \{ e\.preventDefault\(\); handleSideMenuClick\(\); \}\}\n\s*onTouchStart=\{\(e\) => \{ e\.preventDefault\(\); handleSideMenuClick\(\); \}\}/g,
  `onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={handleSideMenuClick}`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
