const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// For "Adicionar imagem"
code = code.replace(
/const input = document\.createElement\('input'\);\n\s*input\.type = 'file';\n\s*input\.accept = 'image\/\*';\n\s*input\.onchange = async \(e: any\) => \{/g,
`const savedSelection = editor.state.selection;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {`
);

// For Carousel (multiple)
code = code.replace(
/const input = document\.createElement\('input'\);\n\s*input\.type = 'file';\n\s*input\.accept = 'image\/\*';\n\s*input\.multiple = true;\n\s*input\.onchange = async \(e: any\) => \{/g,
`const savedSelection = editor.state.selection;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.onchange = async (e: any) => {`
);

// Now inside the onchange for Image
code = code.replace(
/const \{ selection \} = editor\.state;\n(\s*)const isNotEmpty = editor\.state\.doc\.resolve\(selection\.from\)\.parent\.textContent\.length > 0;/g,
`const selection = savedSelection;
$1const isNotEmpty = editor.state.doc.resolve(selection.from).parent.textContent.length > 0;`
);

// Now modify the insert code to use the savedSelection.
code = code.replace(
/editor\.chain\(\)\.focus\(\)\.insertContent\(\[\{ type: 'paragraph' \}, \{ type: 'image', attrs: \{ src: url \} \}\]\)\.run\(\);/g,
`editor.chain().focus().setTextSelection(selection).insertContent([{ type: 'paragraph' }, { type: 'image', attrs: { src: url } }]).run();`
);
code = code.replace(
/editor\.chain\(\)\.focus\(\)\.setImage\(\{ src: url \}\)\.run\(\);/g,
`editor.chain().focus().setTextSelection(selection).setImage({ src: url }).run();`
);

// For Carousel insert
code = code.replace(
/editor\.chain\(\)\.focus\(\)\.insertContent\(\[\{ type: 'paragraph' \}, \{ type: 'imageCarousel', attrs: \{ images \} \}\]\)\.run\(\);/g,
`editor.chain().focus().setTextSelection(selection).insertContent([{ type: 'paragraph' }, { type: 'imageCarousel', attrs: { images } }]).run();`
);
code = code.replace(
/editor\.chain\(\)\.focus\(\)\.setImageCarousel\(\{ images \}\)\.run\(\);/g,
`editor.chain().focus().setTextSelection(selection).setImageCarousel({ images }).run();`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
