const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

code = code.replace(
/onSelectionUpdate: \(\{ editor \}\) => \{\n\s*onSelectionUpdate\?\.\(editor\);\n\s*\}/g,
`onSelectionUpdate: ({ editor }) => {
      onSelectionUpdate?.(editor);
    },
    onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    }`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
