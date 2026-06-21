const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// Replace the buggy AnimatePresence + Portal with a proper unconditional Portal
code = code.replace(
  /<AnimatePresence>[\s\n]*\{suggestionVisible &&\s*suggestionPosition &&\s*createPortal\([\s\n]*<div className="fixed inset-0 z-\[9999\] pointer-events-none">([\s\S]*?)<\/div>,\s*document\.body,\?\s*\)\}[\s\n]*<\/AnimatePresence>/g,
  `{createPortal(
              <AnimatePresence>
                {suggestionVisible && suggestionPosition && (
                  <div className="fixed inset-0 z-[9999] pointer-events-none">
                    $1
                  </div>
                )}
              </AnimatePresence>,
              document.body
            )}`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
