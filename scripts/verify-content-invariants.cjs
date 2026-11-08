const fs = require('fs');
const path = require('path');

let errors = 0;

function report(condition, message) {
  if (!condition) {
    console.error('FAIL: ' + message);
    errors++;
  } else {
    console.log('PASS: ' + message);
  }
}

// 1. Experiment archive invariants
const expFile = path.join(__dirname, '../src/data/experiments.ts');
const expContent = fs.readFileSync(expFile, 'utf8');

// Parse IDs
const idMatches = [...expContent.matchAll(/"id":\s*"([^"]+)"/g)].map(m => m[1]);
report(idMatches.length === 35, `Experiment archive must contain exactly 35 records (found ${idMatches.length})`);
report(!idMatches.includes('E2609'), 'Experiment archive must NOT contain nonexistent E2609');

const uniqueIds = new Set(idMatches);
report(uniqueIds.size === idMatches.length, 'All experiment IDs must be unique');

// Check expected IDs
for (let i = 1; i <= 8; i++) {
  const id = 'E260' + i;
  report(uniqueIds.has(id), `Archive contains ${id}`);
}
for (let i = 10; i <= 36; i++) {
  const id = 'E26' + i;
  report(uniqueIds.has(id), `Archive contains ${id}`);
}

// 2. SwiGLU check in released model references
// Chakaso Base 0.1.0 uses standard GELU, not SwiGLU.
// Released models and architectural schematics must not refer to SwiGLU as active.
const filesToCheckForSwiglu = [
  'src/components/ArchitectureFlow.astro',
  'src/components/HeroVisual.astro',
  'src/data/researchDomains.ts',
  'src/pages/architecture.astro',
  'src/pages/models.astro'
];

for (const relPath of filesToCheckForSwiglu) {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const hasSwiglu = /\bswiglu\b/i.test(fileContent);
    report(!hasSwiglu, `${relPath} must not describe active baseline as SwiGLU`);
  }
}

// 3. GitHub markdown link invariants - no dead / raw GitHub links to markdown files in research or content
const allSrcFiles = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== '.git' && item !== 'dist') walk(full);
    } else if (full.endsWith('.astro') || full.endsWith('.ts') || full.endsWith('.tsx')) {
      allSrcFiles.push(full);
    }
  }
}
walk(path.join(__dirname, '../src'));

let rawGithubMdLinks = 0;
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Look for links to github.com/.../*.md
  const matches = content.match(/https:\/\/github\.com\/[^"'\s\)]+\.md/g);
  if (matches) {
    rawGithubMdLinks += matches.length;
    console.error(`Found raw GitHub .md links in ${file}:`, matches);
  }
}
report(rawGithubMdLinks === 0, `No raw GitHub markdown file links in src/ (found ${rawGithubMdLinks})`);

// 4. Check Node version alignment
const ciWorkflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/ci.yml'), 'utf8');
report(/node-version:\s*(22|'22'|"22")/i.test(ciWorkflow), 'CI workflow uses Node 22');

// 5. Check Sitemap contains all 35 experiments
const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
for (const id of uniqueIds) {
  report(sitemap.includes(`https://chakaso.tech/research/experiments/${id}`), `Sitemap includes ${id}`);
}

console.log(`\nVerification complete. Total failures: ${errors}`);
process.exit(errors > 0 ? 1 : 0);
