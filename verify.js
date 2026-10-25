import fs from 'fs';
import path from 'path';

console.log("--- GateKeeper AI Static Build Verification ---");

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  console.error("ERROR: dist directory not found");
  process.exit(1);
}

const htmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.error("ERROR: index.html not found");
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
console.log("✓ index.html exists, size:", htmlContent.length, "bytes");

// Check linked assets
const assetsDir = path.join(distDir, 'assets');
const assetFiles = fs.readdirSync(assetsDir);
console.log("✓ Assets generated:", assetFiles);

const hasJs = assetFiles.some(f => f.endsWith('.js'));
const hasCss = assetFiles.some(f => f.endsWith('.css'));

if (!hasJs || !hasCss) {
  console.error("ERROR: Missing JS or CSS bundles");
  process.exit(1);
}

// Verify relative paths in index.html for GitHub Pages compatibility
if (htmlContent.includes('href="./assets/') || htmlContent.includes('src="./assets/')) {
  console.log("✓ Relative assets confirmed (compatible with GitHub Pages ./ base)");
} else {
  console.log("ℹ Note: Check base asset references in HTML:", htmlContent.match(/(href|src)="[^"]+"/g));
}

console.log("All static build checks passed successfully!");
