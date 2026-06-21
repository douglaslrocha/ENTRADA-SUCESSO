const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

code = code.replace(
/onFocus: \(\{ editor \}\) => \{\n\s*handleBlockSelection\(editor\);\n\s*\},\n\s*onFocus: \(\{ editor \}\) => \{\n\s*handleBlockSelection\(editor\);\n\s*\}/g,
`onFocus: ({ editor }) => {
      handleBlockSelection(editor);
    }`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
