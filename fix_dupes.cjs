const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// Fix duplicate onFocus
code = code.replace(/onFocus: \(\{ editor \}\) => \{\n\s*onSelectionUpdate\?\.\(editor\);\n\s*\},\n\s*onFocus: \(\{ editor \}\) => \{\n\s*onSelectionUpdate\?\.\(editor\);\n\s*\}/g,
`onFocus: ({ editor }) => {
      onSelectionUpdate?.(editor);
    }`
);

// Second attempt, sometimes it's duplicated differently? No, the code is standard.
// Let's strip ALL onFocus blocks from useEditor options, then re-add exactly one.
// Actually, it's safer to just replace instances where onFocus is repeated.

code = code.replace(
/onFocus: \(\{ editor \}\) => \{\n\s*handleBlockSelection\(editor\);\n\s*\},\n\s*onFocus: \(\{ editor \}\) => \{\n\s*handleBlockSelection\(editor\);\n\s*\}/g,
`onFocus: ({ editor }) => {
      handleBlockSelection(editor);
    }`
);

// Fix Carousel savedSelection issue
code = code.replace(
/command: \(\{ editor, range \}: any\) => \{\n\s*const input = document\.createElement\('input'\);\n\s*input\.type = 'file';\n\s*input\.multiple = true;\n\s*input\.accept = 'image\/\*';/g,
`command: ({ editor, range }: any) => {
        const savedSelection = editor.state.selection;
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
