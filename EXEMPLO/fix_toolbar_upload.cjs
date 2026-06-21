const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

const replacementAddImage = `  const addImage = () => {
    const currentEditor = activeEditor || editor;
    const savedSelection = currentEditor?.state.selection;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file && currentEditor) {
        try {
          const url = await diaryService.uploadImage(file);
          if (savedSelection) {
             currentEditor.chain().focus().setTextSelection(savedSelection).setImage({ src: url }).run();
          } else {
             currentEditor.chain().focus().setImage({ src: url }).run();
          }
        } catch (err) {
          console.error('[DiaryEditor] Falha ao fazer upload de imagem:', err);
          alert('Erro ao fazer upload da imagem.');
        }
      }
    };
    input.click();
  };`;

const replacementAddCarousel = `  const addCarousel = () => {
    const currentEditor = activeEditor || editor;
    const savedSelection = currentEditor?.state.selection;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files as FileList);
      if (files.length > 0 && currentEditor) {
        try {
          const images = await Promise.all(
            files.map(file => diaryService.uploadImage(file))
          );
          if (savedSelection) {
             currentEditor.chain().focus().setTextSelection(savedSelection).setImageCarousel({ images }).run();
          } else {
             currentEditor.chain().focus().setImageCarousel({ images }).run();
          }
        } catch (err) {
          console.error('[DiaryEditor] Falha ao fazer upload do carrossel:', err);
          alert('Erro ao fazer upload de uma ou mais imagens.');
        }
      }
    };
    input.click();
  };`;
  
code = code.replace(/const addImage = \(\) => \{[\s\S]*?input\.click\(\);\n\s*\};/, replacementAddImage);
code = code.replace(/const addCarousel = \(\) => \{[\s\S]*?input\.click\(\);\n\s*\};/, replacementAddCarousel);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
