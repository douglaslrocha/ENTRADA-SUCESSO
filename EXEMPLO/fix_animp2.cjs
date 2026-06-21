const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

const regex = /<AnimatePresence>[\s\S]*?\{suggestionVisible &&\s*suggestionPosition &&\s*createPortal\([\s\S]*?<div className="fixed inset-0 z-\[9999\] pointer-events-none">([\s\S]*?)<\/div>,\s*document\.body,\?\s*\)\}[\s\S]*?<\/AnimatePresence>/g;

code = code.replace(regex, (match, inner) => {
  return `{createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    ${inner}
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}`;
});

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
