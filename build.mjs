import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

await esbuild.build({
  entryPoints: ['./src/main.js'],
  bundle: true,
  minify: true,
  outfile: './index.directory/assets/js/bundle.min.js',
  format: 'iife',
  globalName: 'AppBundle',
  platform: 'browser'
});

console.log('✓ Bundle created successfully at ./index.directory/assets/js/bundle.min.js');

// Copy PDF.js worker file
const workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
const workerDest = './index.directory/assets/js/pdf.worker.min.mjs';

fs.copyFileSync(workerSrc, workerDest);
console.log('✓ PDF.js worker copied to ./index.directory/assets/js/pdf.worker.min.mjs');
