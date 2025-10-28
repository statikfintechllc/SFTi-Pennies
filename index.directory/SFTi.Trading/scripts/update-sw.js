#!/usr/bin/env node

/**
 * Post-build script to inject actual asset filenames into service worker
 * This ensures all Vite-generated hashed assets are properly cached for offline use
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const SW_PATH = path.join(DIST_DIR, 'sw.js');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

console.log('🔧 Updating service worker with actual asset filenames...');

try {
  // Read the built index.html to extract asset references
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
  
  // Extract CSS and JS files from index.html
  const cssMatches = indexHtml.match(/href="([^"]*\.css)"/g) || [];
  const jsMatches = indexHtml.match(/src="([^"]*\.js)"/g) || [];
  
  const cssFiles = cssMatches.map(match => match.replace(/href="([^"]*)"/, '$1'));
  const jsFiles = jsMatches.map(match => match.replace(/src="([^"]*)"/, '$1'));
  
  // Get all asset files from assets directory
  const assetFiles = [];
  if (fs.existsSync(ASSETS_DIR)) {
    const files = fs.readdirSync(ASSETS_DIR);
    files.forEach(file => {
      assetFiles.push(`/assets/${file}`);
    });
  }
  
  // Create the complete list of files to cache
  const staticFiles = [
    '/',
    '/index.html',
    '/manifest.json',
    ...cssFiles,
    ...jsFiles,
    ...assetFiles
  ];
  
  console.log(`📦 Found ${staticFiles.length} files to cache:`, staticFiles);
  
  // Read the service worker
  let swContent = fs.readFileSync(SW_PATH, 'utf8');
  
  // Replace the static files array
  const staticFilesString = JSON.stringify(staticFiles, null, 2);
  swContent = swContent.replace(
    /const STATIC_FILES = \[[\s\S]*?\];/,
    `const STATIC_FILES = ${staticFilesString};`
  );
  
  // Write the updated service worker
  fs.writeFileSync(SW_PATH, swContent);
  
  console.log('✅ Service worker updated successfully!');
  console.log(`📱 PWA will now cache ${staticFiles.length} files for offline use`);
  
} catch (error) {
  console.error('❌ Error updating service worker:', error);
  process.exit(1);
}