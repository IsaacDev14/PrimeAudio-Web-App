const fs = require('fs');
const path = require('path');

const srcDir = './src';
const configFile = path.join(srcDir, 'config', 'api.js');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walkDir(p, callback);
        else if (f.endsWith('.jsx') || f.endsWith('.js')) callback(p);
    });
}

function getRelativePath(from) {
    const rel = path.relative(path.dirname(from), path.join(srcDir, 'config', 'api'));
    return rel.startsWith('.') ? rel.replace(/\\/g, '/') : './' + rel.replace(/\\/g, '/');
}

let count = 0;
walkDir(srcDir, (file) => {
    if (file.includes('config/api.js') || file.includes('config\\api.js')) return;

    let c = fs.readFileSync(file, 'utf8');
    if (!c.includes('localhost:8000')) return;

    // Add import if needed
    if (!c.includes("import { API_URL }")) {
        const imp = `import { API_URL } from '${getRelativePath(file)}';\n`;
        c = c.replace(/^(import .+\n)+/, m => m + imp);
    }

    // Replace URLs - handle different quote types
    c = c.replace(/'http:\/\/localhost:8000([^']*)'/g, '`${API_URL}$1`');
    c = c.replace(/"http:\/\/localhost:8000([^"]*)"/g, '`${API_URL}$1`');
    c = c.replace(/`http:\/\/localhost:8000([^`]*)`/g, '`${API_URL}$1`');

    fs.writeFileSync(file, c, 'utf8');
    console.log('Fixed:', path.basename(file));
    count++;
});
console.log(`\nUpdated ${count} files.`);
