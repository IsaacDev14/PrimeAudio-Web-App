/**
 * Script to replace hardcoded localhost:8000 URLs with API_URL from config
 * Run with: node replace-api-urls.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Files to process
function getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Calculate relative import path from file to config/api.js
function getImportPath(filePath) {
    const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'config', 'api.js'));
    let importPath = relativePath.replace(/\\/g, '/').replace('.js', '');
    if (!importPath.startsWith('.')) {
        importPath = './' + importPath;
    }
    return importPath;
}

// Process a single file
function processFile(filePath) {
    // Skip the api.js config file itself
    if (filePath.includes('config/api.js') || filePath.includes('config\\api.js')) {
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check if file contains localhost:8000
    if (!content.includes('localhost:8000')) {
        return false;
    }

    // Add import if not already present
    if (!content.includes("import { API_URL }") && !content.includes('import {API_URL}')) {
        const importPath = getImportPath(filePath);
        // Find first import statement and add after it
        const importMatch = content.match(/^import .+;?\r?\n/m);
        if (importMatch) {
            const insertPos = importMatch.index + importMatch[0].length;
            content = content.slice(0, insertPos) +
                `import { API_URL } from '${importPath}';\n` +
                content.slice(insertPos);
        } else {
            // No imports found, add at beginning
            content = `import { API_URL } from '${importPath}';\n` + content;
        }
    }

    // Replace all occurrences of 'http://localhost:8000 with `${API_URL}
    // Handle various quote styles
    content = content.replace(/'http:\/\/localhost:8000([^']*)'(,|\)|\s|;)/g, '`${API_URL}$1`$2');
    content = content.replace(/"http:\/\/localhost:8000([^"]*)"(,|\)|\s|;)/g, '`${API_URL}$1`$2');

    // Handle fetch calls with template literals or string concatenation
    content = content.replace(/`http:\/\/localhost:8000([^`]*)`/g, '`${API_URL}$1`');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', path.relative(__dirname, filePath));
        return true;
    }
    return false;
}

// Main
console.log('Starting API URL replacement...\n');
const files = getAllFiles(srcDir);
let updatedCount = 0;

for (const file of files) {
    if (processFile(file)) {
        updatedCount++;
    }
}

console.log(`\nDone! Updated ${updatedCount} files.`);
