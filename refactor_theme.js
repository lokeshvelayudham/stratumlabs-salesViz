const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)bg-slate-50/g, replacement: 'bg-slate-50 dark:bg-slate-950' },
  { regex: /(?<!dark:)text-slate-900/g, replacement: 'text-slate-900 dark:text-slate-50' },
  { regex: /(?<!dark:)text-slate-800/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /(?<!dark:)text-slate-700/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-slate-600/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-500/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)border-slate-200/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-300/g, replacement: 'border-slate-300 dark:border-slate-700' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { regex, replacement } of REPLACEMENTS) {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    // Skip page.tsx since it's the custom exotic landing page
    if (fullPath.endsWith('/src/app/page.tsx')) continue;

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'app'));
processDirectory(path.join(__dirname, 'src', 'components'));

console.log('Done refactoring theme classes.');
