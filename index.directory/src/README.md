# Source Files

**📁 Location:** `/index.directory/src`

## Overview

This directory contains source JavaScript files that serve as entry points for bundling with esbuild. These files import and configure the libraries used for PDF and Markdown rendering.

## Files

### `main.js`
**Bundle entry point**

**Size:** ~179 bytes  
**Lines:** ~8

#### Purpose
Main entry point for the JavaScript bundle that:
- Imports PDF.js for PDF rendering
- Imports Marked.js for Markdown parsing
- Imports Highlight.js for code syntax highlighting
- Configures and exports libraries for use in the application

#### Content

```javascript
// Import PDF.js
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';

// Import Marked.js and extensions
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Configure Marked with GFM and syntax highlighting
marked.use(
  gfmHeadingId(),
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// Export for use in application
export { pdfjsLib, marked, hljs };
```

#### Dependencies

**PDF.js:**
```javascript
import * as pdfjsLib from 'pdfjs-dist';
```
- Package: `pdfjs-dist@5.4.296`
- Purpose: Render PDF documents in browser
- Size: ~1MB minified

**Marked.js:**
```javascript
import { marked } from 'marked';
```
- Package: `marked@16.4.0`
- Purpose: Parse markdown to HTML
- Size: ~50KB minified

**Marked Extensions:**
```javascript
import { markedHighlight } from 'marked-highlight';
import { gfmHeadingId } from 'marked-gfm-heading-id';
```
- Packages: `marked-highlight@2.2.2`, `marked-gfm-heading-id@4.1.2`
- Purpose: Add syntax highlighting and heading IDs
- Size: ~10KB combined

**Highlight.js:**
```javascript
import hljs from 'highlight.js';
```
- Package: `highlight.js@11.11.1`
- Purpose: Syntax highlighting for code blocks
- Size: ~100KB minified (core + common languages)

## Build Process

### Building the Bundle

The source files are bundled using esbuild via the build script:

```bash
# Install dependencies
npm install

# Run build
npm run build

# Or directly
node .github/scripts/build.mjs
```

### Build Configuration

From `.github/scripts/build.mjs`:

```javascript
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['index.directory/src/main.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2020',
  outfile: 'index.directory/assets/js/bundle.min.js',
  external: [],  // Bundle all dependencies
  loader: {
    '.mjs': 'js'
  },
  sourcemap: false,
  treeShaking: true
});
```

### Build Output

**Generated Files:**
- `index.directory/assets/js/bundle.min.js` (~1.5MB)
  - Contains: PDF.js, Marked.js, Highlight.js, extensions
  - Format: ES Module (ESM)
  - Minified: Yes
  - Source maps: No (can be enabled)

- `index.directory/assets/js/pdf.worker.min.mjs` (~1MB)
  - PDF.js web worker
  - Separate file for background processing

## Usage

### In Application Code

After building, import from the bundle:

```javascript
// Import from bundle
import { pdfjsLib, marked, hljs } from './assets/js/bundle.min.js';

// Use PDF.js
const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

// Use Marked
const html = marked.parse(markdown);

// Use Highlight.js
const highlighted = hljs.highlight(code, { language: 'javascript' }).value;
```

### In HTML

```html
<!-- Include bundle -->
<script type="module">
  import { pdfjsLib, marked, hljs } from '/index.directory/assets/js/bundle.min.js';
  
  // Use libraries...
</script>
```

## Configuration

### PDF.js Configuration

```javascript
// Worker configuration (already set in main.js)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Optional: Document loading parameters
const loadingTask = pdfjsLib.getDocument({
  url: pdfUrl,
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/standard_fonts/'
});
```

### Marked Configuration

```javascript
// Already configured in main.js with:
// - GFM (GitHub Flavored Markdown)
// - Heading IDs for anchors
// - Syntax highlighting

// Additional options can be set:
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true
});
```

### Highlight.js Configuration

```javascript
// Configure theme (in CSS)
import 'highlight.js/styles/github-dark.css';

// Or custom theme
import './styles/custom-highlight.css';

// Register additional languages if needed
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
```

## Development

### Adding New Libraries

1. **Install package:**
   ```bash
   npm install new-package
   ```

2. **Import in main.js:**
   ```javascript
   import newLibrary from 'new-package';
   export { newLibrary };
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Use in application:**
   ```javascript
   import { newLibrary } from './bundle.min.js';
   ```

### Development Mode

For faster development without minification:

```javascript
// In build.mjs, modify:
await esbuild.build({
  // ... other options
  minify: false,        // Disable minification
  sourcemap: 'inline',  // Enable source maps
});
```

### Watching for Changes

Add a watch mode:

```javascript
// In build.mjs
const ctx = await esbuild.context({
  // ... build options
});

await ctx.watch();
console.log('Watching for changes...');
```

Or use nodemon:
```bash
npx nodemon --watch src --exec "npm run build"
```

## Dependencies

### Package Versions

Current versions in `package.json`:

```json
{
  "dependencies": {
    "pdfjs-dist": "^5.4.296",
    "marked": "^16.4.0",
    "marked-gfm-heading-id": "^4.1.2",
    "marked-highlight": "^2.2.2",
    "highlight.js": "^11.11.1",
    "esbuild": "^0.25.11"
  }
}
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update pdfjs-dist

# Update all packages
npm update

# Install latest versions
npm install pdfjs-dist@latest marked@latest
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

## File Size Analysis

### Current Bundle Size

```
bundle.min.js:      ~1.5MB (minified)
pdf.worker.min.mjs: ~1.0MB (minified)
Total:              ~2.5MB
```

### Size Breakdown

- **PDF.js**: ~60% (1.5MB)
- **Highlight.js**: ~25% (600KB)
- **Marked.js**: ~10% (250KB)
- **Extensions**: ~5% (125KB)

### Optimization Strategies

**Tree Shaking:**
```javascript
// Import only what you need
import { marked } from 'marked';  // Not: import marked from 'marked';
```

**Code Splitting:**
```javascript
// Split PDF and Markdown into separate bundles
// Bundle 1: PDF only
// Bundle 2: Markdown only
// Load based on page needs
```

**Dynamic Imports:**
```javascript
// Load PDF.js only when needed
const loadPDF = async () => {
  const { pdfjsLib } = await import('./bundle.min.js');
  return pdfjsLib;
};
```

**Selective Language Loading (Highlight.js):**
```javascript
// Instead of importing all languages
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
// Much smaller bundle!
```

## Browser Compatibility

### Supported Browsers

The bundle uses ES2020 features:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13.1+
- ✅ Edge 80+

### Transpiling for Older Browsers

If needed, adjust esbuild target:

```javascript
await esbuild.build({
  target: 'es2015',  // Support older browsers
  // ... other options
});
```

Or use Babel for more control:

```bash
npm install --save-dev @babel/core @babel/preset-env
```

## Troubleshooting

### Build Fails

**Issue:** esbuild errors during build

**Solutions:**
1. Check syntax errors in main.js
2. Verify all imports are valid
3. Ensure dependencies are installed
4. Check esbuild configuration
5. Try cleaning node_modules and reinstalling

### Import Errors

**Issue:** "Cannot find module" in browser

**Solutions:**
1. Verify bundle path is correct
2. Check module type in script tag (`type="module"`)
3. Ensure file is served correctly
4. Check browser console for details
5. Verify CORS headers if hosted externally

### Large Bundle Size

**Issue:** Bundle too large for production

**Solutions:**
1. Enable code splitting
2. Use dynamic imports
3. Import only needed features
4. Consider CDN for large libraries
5. Implement lazy loading

## Related Documentation

- [Build Script](../../../.github/scripts/README.md)
- [JavaScript Assets](../assets/js/README.md)
- [Rendering Modules](../render/README.md)
- [Developer Guide](../../../.github/docs/README-DEV.md)

---

**Last Updated:** October 2025  
**File Count:** 1  
**Purpose:** Bundle entry point and library configuration
