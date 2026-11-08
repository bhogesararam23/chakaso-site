const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const htmlFiles = [];

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (f.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

walk(distDir);
console.log('Total built HTML files:', htmlFiles.length);

const existingPaths = new Set(
  htmlFiles.map(f => {
    let p = f.substring(distDir.length).replace(/\\/g, '/');
    if (p.endsWith('/index.html')) p = p.replace('/index.html', '');
    if (p === '') p = '/';
    return p;
  })
);

let checkedLinks = 0;
const missingLinks = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map(m => m[1]);
  for (const href of hrefs) {
    const cleanHref = href.split('#')[0].split('?')[0] || '/';
    if (cleanHref.includes('.')) {
      const publicPath = path.join(__dirname, '../public', cleanHref);
      const distPath = path.join(distDir, cleanHref);
      if (!fs.existsSync(publicPath) && !fs.existsSync(distPath)) {
        missingLinks.push({ file: path.basename(file), cleanHref });
      }
    } else {
      let norm = cleanHref.replace(/\/$/, '');
      if (norm === '') norm = '/';
      if (!existingPaths.has(norm)) {
        missingLinks.push({ file: path.basename(file), cleanHref: norm });
      }
    }
    checkedLinks++;
  }
}

console.log('Total checked internal links:', checkedLinks);
console.log('Missing/broken internal links:', missingLinks.length);
if (missingLinks.length > 0) {
  console.log('Sample missing:', missingLinks.slice(0, 10));
  process.exit(1);
} else {
  console.log('All internal links resolve successfully to built pages or assets!');
}
