const fs = require('fs');
let code = fs.readFileSync('src/components/DiaryEditorPage.tsx', 'utf8');

// The `join` operation from before stripped out `<AnimatePresence>`. 
// The string was: blocks.join('') instead of blocks.join('<AnimatePresence>').
// This means every place that HAD <AnimatePresence> and wasn't my custom replaced portal, now has it missing.
// We can find them because they end with </AnimatePresence>.

// Let's find occurrences of `</AnimatePresence>`.
let index = -1;
let cursor = 0;
while ((index = code.indexOf('</AnimatePresence>', cursor)) !== -1) {
    // Look backwards to see if there is an <AnimatePresence> after the previous </AnimatePresence>
    const prevClose = code.lastIndexOf('</AnimatePresence>', index - 1);
    const hasOpenBetween = code.indexOf('<AnimatePresence>', prevClose === -1 ? 0 : prevClose) !== -1;
    
    // There shouldn't be two </AnimatePresence> without an <AnimatePresence> in between.
    // Wait, since I stripped ALL un-replaced <AnimatePresence>, any </AnimatePresence> that doesn't have a matching open before it needs one.

    cursor = index + 1;
}

// Actually, I can just read the original file if I backed it up? No I didn't backup.
// Let's identify the missing `<AnimatePresence>` by searching for React conditionally rendered elements that should be wrapped.
// For example:
code = code.replace(
  /(\s*)\{isTitleLoading \? \(/g,
  '$1<AnimatePresence>\n$1{isTitleLoading ? ('
);

code = code.replace(
  /(\s*)\{isNavLoading \? \(/g,
  '$1<AnimatePresence>\n$1{isNavLoading ? ('
);

code = code.replace(
  /(\s*)\{isEditingTitle \? \(/g,
  '$1<AnimatePresence mode="wait">\n$1{isEditingTitle ? ('
);

code = code.replace(
  /(\s*)\{isCoverModalOpen && \(/g,
  '$1<AnimatePresence>\n$1{isCoverModalOpen && ('
);

code = code.replace(
  /(\s*)\{isIconModalOpen && \(/g,
  '$1<AnimatePresence>\n$1{isIconModalOpen && ('
);

code = code.replace(
  /(\s*)<motion\.div[\s\S]*?className="absolute inset-0 z-[-1]"[\s\S]*?alt="Ritualistic closure background"[\s\S]*?\/>\s*<\/motion\.div>/g,
  `$1<AnimatePresence>\n$&`
);

fs.writeFileSync('src/components/DiaryEditorPage.tsx', code);
