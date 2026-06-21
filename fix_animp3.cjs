const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

const blocks = code.split('<AnimatePresence>');
for (let i = 1; i < blocks.length; i++) {
  if (blocks[i].includes('createPortal(') && blocks[i].includes('suggestionPosition')) {
    const endIdx = blocks[i].indexOf('</AnimatePresence>');
    if (endIdx !== -1) {
       const content = blocks[i].substring(0, endIdx);
       // we want everything inside <div className="fixed inset-0 z-[9999] pointer-events-none"> ... </div>, document.body
       const startDiv = content.indexOf('<div className="fixed inset-0 z-[9999] pointer-events-none">');
       const endDiv = content.lastIndexOf('</div>'); // of the portal
       if (startDiv !== -1 && endDiv !== -1) {
          const innerContent = content.substring(startDiv + '<div className="fixed inset-0 z-[9999] pointer-events-none">'.length, endDiv);
          
          let newStr = `
            {createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    ${innerContent}
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}
          `;
          blocks[i] = newStr + blocks[i].substring(endIdx + '</AnimatePresence>'.length);
       }
    }
  }
}

fs.writeFileSync('src/components/DiaryEditorPage.tsx', blocks.join(''));
