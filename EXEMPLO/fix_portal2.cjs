const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

let count = 0;
code = code.replace(/\{suggestionVisible && suggestionPosition && \(\s*<div className="fixed inset-0 z-50 pointer-events-none">([\s\S]*?)<\/motion\.div>\s*<\/div>\s*\)\}/g, (match, innerProps) => {
    count++;
    return `{suggestionVisible && suggestionPosition && createPortal(
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                  ${innerProps}
                  </motion.div>
                </div>,
                document.body
              )}`;
});

console.log("Replaced:", count);

if (count > 0 && !code.includes('createPortal')) {
    code = code.replace(/import React, /, "import { createPortal } from 'react-dom';\nimport React, ");
}

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
