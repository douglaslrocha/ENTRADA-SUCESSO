const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// The main editor inside DiaryEditorPage
// Find the main editor initialization and add onFocus if not present
code = code.replace(
/onSelectionUpdate: \(\{ editor \}\) => \{\n\s*handleBlockSelection\(editor\);\n\s*\}/g,
`onSelectionUpdate: ({ editor }) => {
      handleBlockSelection(editor);
    },
    onFocus: ({ editor }) => {
      handleBlockSelection(editor);
    }`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
