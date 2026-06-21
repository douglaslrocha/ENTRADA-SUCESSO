const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

if (!code.includes('createPortal')) {
    code = code.replace(/import React, \{([^}]+)\} from 'react';/, "import React, { $1 } from 'react';\nimport { createPortal } from 'react-dom';");
}

code = code.replace(/<AnimatePresence>([\s\S]*?)<\/AnimatePresence>/g, (match, inner) => {
    if (inner.includes('suggestionVisible && suggestionPosition')) {
        let replacement = inner.replace(/<div className="fixed inset-0 z-50 pointer-events-none">([\s\S]*?)<\/div>\n\s*\}\)/, 
        `createPortal(
                <div className="fixed inset-0 z-[9999] pointer-events-none" style={{ position: 'fixed' }}>
                  $1
                </div>,
                document.body
              )
            })`);
        // Note: the original matching was:
        // {suggestionVisible && suggestionPosition && (
        //   <div className="fixed inset-0 z-50 pointer-events-none">
        //      <div className="absolute bg-transparent"...
        //      <motion.div ...
        //   </div>
        // )}
        return `<AnimatePresence>${replacement}</AnimatePresence>`;
    }
    return match;
});

// Ensure createPortal import replacement actually worked
if (!code.includes('import { createPortal }')) {
    code = code.replace(/import React, /, "import { createPortal } from 'react-dom';\nimport React, ");
}

// Ensure the suggestion modal uses createPortal
fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
