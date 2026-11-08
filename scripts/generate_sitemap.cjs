const fs = require('fs');
const path = require('path');

const coreRoutes = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: 'research', priority: '0.9', changefreq: 'weekly' },
  { path: 'research/experiments', priority: '0.9', changefreq: 'weekly' },
  { path: 'research/methodology', priority: '0.8', changefreq: 'monthly' },
  { path: 'research/data', priority: '0.8', changefreq: 'monthly' },
  { path: 'research/evaluation', priority: '0.8', changefreq: 'monthly' },
  { path: 'architecture', priority: '0.9', changefreq: 'monthly' },
  { path: 'models', priority: '0.9', changefreq: 'weekly' },
  { path: 'docs', priority: '0.8', changefreq: 'weekly' },
  { path: 'journal', priority: '0.8', changefreq: 'weekly' },
  { path: 'about', priority: '0.7', changefreq: 'monthly' },
];

const docSlugs = [
  'overview',
  'getting-started',
  'architecture',
  'tokenizer',
  'training',
  'data-provenance',
  'evaluation',
  'serving',
  'release-contract'
];

const expIds = [
  'E2601', 'E2602', 'E2603', 'E2604', 'E2605', 'E2606', 'E2607', 'E2608',
  'E2610', 'E2611', 'E2612', 'E2613', 'E2614', 'E2615', 'E2616', 'E2617',
  'E2618', 'E2619', 'E2620', 'E2621', 'E2622', 'E2623', 'E2624', 'E2625',
  'E2626', 'E2627', 'E2628', 'E2629', 'E2630', 'E2631', 'E2632', 'E2633',
  'E2634', 'E2635', 'E2636'
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

coreRoutes.forEach(r => {
  xml += `  <url>\n`;
  xml += `    <loc>https://chakaso.tech/${r.path}</loc>\n`;
  xml += `    <lastmod>2026-11-08</lastmod>\n`;
  xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
  xml += `    <priority>${r.priority}</priority>\n`;
  xml += `  </url>\n`;
});

docSlugs.forEach(slug => {
  xml += `  <url>\n`;
  xml += `    <loc>https://chakaso.tech/docs/${slug}</loc>\n`;
  xml += `    <lastmod>2026-11-08</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.7</priority>\n`;
  xml += `  </url>\n`;
});

expIds.forEach(id => {
  xml += `  <url>\n`;
  xml += `    <loc>https://chakaso.tech/research/experiments/${id}</loc>\n`;
  xml += `    <lastmod>2026-11-08</lastmod>\n`;
  xml += `    <changefreq>monthly</changefreq>\n`;
  xml += `    <priority>0.8</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml, 'utf8');
console.log('Generated public/sitemap.xml with', coreRoutes.length + docSlugs.length + expIds.length, 'URLs.');

