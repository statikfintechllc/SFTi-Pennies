# Rendering Modules

**📁 Location:** `/index.directory/render`

## Overview

This directory contains JavaScript modules responsible for rendering PDF and Markdown content in the trading journal interface. These modules handle the display of trading books (PDFs) and trading notes (Markdown) with proper styling and interactivity.

## Files

### 1. `pdfRenderer.js`
**PDF document rendering module with lazy loading**

**Size:** ~23KB  
**Lines:** ~774  
**Version:** 2.0.0 (Updated October 2025)

#### Purpose
Renders PDF files (trading books) with memory-efficient lazy loading:
- Display PDFs in embedded viewer with progressive loading
- Lazy rendering: Only visible pages are rendered
- Memory management: Automatic cleanup of off-screen pages
- Zoom and pan functionality
- Mobile-optimized rendering
- Loading progress indicators
- Comprehensive error handling
- **Solves auto-refresh issue with large PDFs (>4KB)**

#### Key Features (v2.0.0)

**Lazy Loading:**
- Only renders pages visible in viewport + buffer zone
- Intersection Observer API for efficient visibility detection
- Progressive loading with percentage indicators
- Configurable render buffer and concurrent page limits

**Memory Management:**
- Limits concurrent rendered pages (default: 5)
- Automatically cleans up distant off-screen pages
- Proper resource disposal on destroy
- Optimized canvas rendering (no alpha, capped pixel ratio)

**Performance Optimizations:**
- Disabled WebGL to prevent memory issues
- Streaming PDF support for large files
- Smart render queue processing
- Distance-based page cleanup

#### Key Functions

```javascript
// Initialize PDF renderer with lazy loading
const pdfRenderer = new PDFRenderer('container-id', {
  scale: 0.9,
  enableZoom: true,
  enableScroll: true,
  lazyLoad: true,        // Enable lazy loading (default: true)
  renderBuffer: 2,       // Pages to render above/below viewport
  maxRenderedPages: 5    // Maximum concurrent rendered pages
});

// Load PDF with progressive loading
async function loadPDF(url) {
  const loadingTask = pdfjsLib.getDocument({
    url: url,
    disableAutoFetch: true,
    disableStream: false,
    disableRange: false
  });
  
  // Show progress
  loadingTask.onProgress = (progress) => {
    updateLoadingProgress(progress.loaded / progress.total);
  };
  
  return await loadingTask.promise;
}

// Lazy loading setup
async function setupLazyLoading() {
  // Create page placeholders
  // Setup Intersection Observer
  // Queue rendering for visible pages
}

// Render specific page (lazy)
async function renderPage(pageNum) {
  // Check if already rendered
  // Render with optimized settings
  // Track in renderedPages map
}

// Memory cleanup
async function cleanupDistantPages(currentPageNum) {
  // Find pages far from viewport
  // Unrender to free memory
}

// Destroy and cleanup
function destroy() {
  // Disconnect observers
  // Clear render queue
  // Clean up canvases
  // Destroy PDF document
}
```

#### Features

**PDF Display:**
- Canvas-based rendering with memory optimization
- High-quality text rendering
- Image preservation
- Responsive sizing with device adaptation
- Progressive loading for large files

**Lazy Loading (v2.0.0):**
- Intersection Observer for visibility detection
- 200px buffer zone for preloading
- Automatic page cleanup when memory limit reached
- Render queue for smooth loading experience
- Support for PDFs up to 500KB+ without issues

**Navigation:**
- Smooth scrolling between pages
- Page number labels
- Keyboard shortcuts (Arrow keys, Page Up/Down)
- Current page tracking

**Zoom Controls:**
- Zoom in/out buttons (50% - 300%)
- Fit to width automatically
- Mobile-responsive scaling
- Maintains zoom on page change

**Memory Management:**
- Maximum 5 concurrent rendered pages (configurable)
- Automatic cleanup of distant pages
- Proper canvas disposal
- Intersection Observer cleanup on destroy
- Prevents auto-refresh issues with large files

**Performance:**
- Lazy page loading (only visible pages)
- Canvas optimization (no alpha channel, capped DPI)
- Worker thread for PDF processing
- Progressive rendering
- Streaming support for large files

#### Usage

```javascript
// In books.html - Lazy loading enabled by default
let pdfRenderer = null;

async function openPDF(filepath, title) {
  // Clean up previous renderer
  if (pdfRenderer) {
    pdfRenderer.destroy();
    pdfRenderer = null;
  }
  
  // Initialize with lazy loading for large PDFs
  pdfRenderer = new PDFRenderer('pdf-viewer-root', {
    scale: 0.9,
    enableZoom: true,
    enableScroll: true,
    lazyLoad: true,        // Lazy loading (recommended)
    renderBuffer: 2,       // Pre-render 2 pages above/below
    maxRenderedPages: 5    // Max 5 pages in memory
  });
  
  // Load PDF with progress tracking
  await pdfRenderer.loadPDF(filepath);
}

function closePDF() {
  if (pdfRenderer) {
    pdfRenderer.destroy();  // Properly clean up resources
    pdfRenderer = null;
  }
}
```

#### Configuration

```javascript
const config = {
  // Display settings
  scale: 0.9,              // Initial zoom level (0.5 - 3.0)
  enableZoom: true,        // Show zoom controls
  enableScroll: true,      // Enable scrolling
  
  // Lazy loading settings (v2.0.0)
  lazyLoad: true,          // Enable lazy loading
  renderBuffer: 2,         // Pages to render above/below viewport
  maxRenderedPages: 5      // Maximum concurrent rendered pages
};
```

#### Performance Metrics

**Before Lazy Loading (v1.0.0):**
- Memory: ~150MB peak (all pages rendered with browser overhead) for 10MB PDF
- Initial Load: 8-12 seconds
- Auto-refresh: Occurred with PDFs >4KB

**After Lazy Loading (v2.0.0):**
- Memory: ~30MB peak (5 pages rendered with browser overhead) for 10MB PDF
- Initial Load: 2-3 seconds (first page)
- Auto-refresh: ✅ Resolved
- Supports: PDFs up to 500KB+ without issues

### 2. `markdownRenderer.js`
**Markdown document rendering module**

**Size:** ~4KB  
**Lines:** ~122

#### Purpose
Renders Markdown files (trading notes) in the browser using Marked.js library:
- Parse markdown to HTML
- Apply GitHub-style formatting
- Syntax highlighting for code blocks
- Table support
- Task list support
- Auto-linking URLs

#### Key Functions

```javascript
// Initialize markdown renderer
initMarkdownRenderer(container, markdownUrl)

// Load and render markdown
async function loadMarkdown(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

// Parse and render markdown
function renderMarkdown(markdown) {
  const html = marked.parse(markdown, {
    gfm: true,              // GitHub Flavored Markdown
    breaks: true,           // Convert \n to <br>
    headerIds: true,        // Auto-generate heading IDs
    mangle: false,          // Don't escape email addresses
    highlight: highlightCode // Syntax highlighting
  });
  return html;
}

// Syntax highlighting for code blocks
function highlightCode(code, language) {
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(code, { language }).value;
  }
  return hljs.highlightAuto(code).value;
}

// Post-processing
function processLinks()      // Open external links in new tab
function processImages()     // Lazy load images
function processTables()     // Make tables responsive
```

#### Features

**Markdown Support:**
- GitHub Flavored Markdown (GFM)
- Tables
- Task lists
- Strikethrough
- Auto-linking
- Emoji (via GFM)

**Code Highlighting:**
- Syntax highlighting via Highlight.js
- Line numbers (optional)
- Copy button (optional)
- Language badges

**Content Processing:**
- External links open in new tab
- Relative image paths resolution
- Table responsiveness
- Heading anchors for linking

**Styling:**
- GitHub markdown CSS
- Dark theme adaptation
- Mobile-responsive tables
- Consistent typography

#### Usage

```javascript
// In notes.html or similar
import { initMarkdownRenderer } from './render/markdownRenderer.js';

// Initialize with container and markdown URL
const container = document.getElementById('markdown-container');
const markdownUrl = '/index.directory/SFTi.Notez/7.Step.Frame.md';
initMarkdownRenderer(container, markdownUrl);
```

#### Configuration

```javascript
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  highlight: function(code, lang) {
    // Syntax highlighting
  }
});

// Custom renderer
const renderer = new marked.Renderer();
renderer.link = function(href, title, text) {
  // Custom link rendering
};
```

## Dependencies

### External Libraries

**For PDF Rendering:**
- **PDF.js** (v5.4.296) - Core PDF rendering
  - Bundled in `bundle.min.js`
  - Worker: `pdf.worker.min.mjs`

**For Markdown Rendering:**
- **Marked.js** (v16.4.0) - Markdown parsing
- **Highlight.js** (v11.11.1) - Syntax highlighting
- **marked-gfm-heading-id** (v4.1.2) - Heading IDs
- **marked-highlight** (v2.2.2) - Highlight.js integration
  - All bundled in `bundle.min.js`

### Styling Dependencies

**PDF Viewer:**
- `styles/pdf-viewer.css` - PDF viewer styles

**Markdown:**
- `styles/markdown.css` - GitHub markdown styles

## Integration

### HTML Structure

**For PDF Viewer:**
```html
<div id="pdf-viewer">
  <div class="pdf-controls">
    <button id="prev-page">Previous</button>
    <span id="page-info">Page <span id="page-num">1</span> of <span id="page-count">1</span></span>
    <button id="next-page">Next</button>
    <button id="zoom-in">Zoom In</button>
    <button id="zoom-out">Zoom Out</button>
  </div>
  <canvas id="pdf-canvas"></canvas>
</div>

<script type="module">
  import { initPDFRenderer } from './render/pdfRenderer.js';
  initPDFRenderer(
    document.getElementById('pdf-viewer'),
    '/path/to/file.pdf'
  );
</script>
```

**For Markdown Viewer:**
```html
<div id="markdown-container"></div>

<script type="module">
  import { initMarkdownRenderer } from './render/markdownRenderer.js';
  initMarkdownRenderer(
    document.getElementById('markdown-container'),
    '/path/to/file.md'
  );
</script>
```

## Browser Support

### PDF Rendering
- ✅ Chrome 60+ (full support)
- ✅ Firefox 60+ (full support)
- ✅ Safari 12+ (full support)
- ✅ Edge 79+ (full support)
- ⚠️ iOS Safari (limited zoom controls)
- ⚠️ Android browsers (performance varies)

### Markdown Rendering
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers
- ✅ IE 11 with polyfills

## Performance

### PDF Rendering (v2.0.0 with Lazy Loading)
- **Initial load:** 2-3 seconds for large PDF (first page only)
- **Page render:** 100-200ms per page (on-demand)
- **Memory:** ~30MB for 10MB PDF (only 5 pages rendered)
- **Memory savings:** ~80% compared to v1.0.0
- **Optimization:** Worker thread + lazy loading prevents UI blocking
- **Large files:** Supports PDFs up to 500KB+ without auto-refresh

### Markdown Rendering
- **Parsing:** < 50ms for typical note
- **Rendering:** < 100ms for typical note
- **Memory:** Minimal (< 5MB)
- **Optimization:** Lazy load images

## Error Handling

### PDF Errors

```javascript
try {
  await loadPDF(url);
} catch (error) {
  if (error.name === 'PasswordException') {
    // PDF is password protected
    showPasswordPrompt();
  } else if (error.name === 'MissingPDFException') {
    // PDF file not found
    showError('PDF not found');
  } else {
    // Other error
    showError('Failed to load PDF');
  }
}
```

### Markdown Errors

```javascript
try {
  const markdown = await loadMarkdown(url);
  renderMarkdown(markdown);
} catch (error) {
  if (error.response?.status === 404) {
    showError('Markdown file not found');
  } else if (error.response?.status === 403) {
    showError('Access denied');
  } else {
    showError('Failed to load markdown');
  }
}
```

## Customization

### PDF Viewer Customization

```javascript
// Custom controls
const customControls = {
  showPageNumber: true,
  showZoom: true,
  showDownload: false,
  showPrint: false
};

// Custom styling
const viewerStyle = {
  backgroundColor: '#0a0e27',
  buttonColor: '#00ff88',
  textColor: '#e0e0e0'
};
```

### Markdown Renderer Customization

```javascript
// Custom marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
  sanitize: false,  // Be careful with user content
  smartLists: true,
  smartypants: true
});

// Custom heading renderer
renderer.heading = function(text, level) {
  const id = text.toLowerCase().replace(/\s+/g, '-');
  return `<h${level} id="${id}">${text}</h${level}>`;
};
```

## Testing

### Unit Tests
```javascript
// Test PDF loading
test('loads PDF successfully', async () => {
  const pdf = await loadPDF('test.pdf');
  expect(pdf.numPages).toBeGreaterThan(0);
});

// Test markdown parsing
test('parses markdown correctly', () => {
  const html = renderMarkdown('# Heading\n\nParagraph');
  expect(html).toContain('<h1>Heading</h1>');
  expect(html).toContain('<p>Paragraph</p>');
});
```

### Integration Tests
- Load actual PDF files
- Render actual markdown notes
- Test on various devices
- Verify styling consistency

## Troubleshooting

### PDF Not Loading
1. Check PDF file exists and is accessible
2. Verify PDF.js worker path is correct (`pdf.worker.min.mjs`)
3. Check browser console for errors
4. Test with simple/small PDF first
5. Check CORS settings if hosted externally
6. Ensure lazy loading is enabled for large files

### PDF Auto-Refresh Issue (Resolved in v2.0.0)
**Problem:** PDFs larger than 4KB caused page auto-refresh after 5-10 seconds  
**Solution:** Implemented lazy loading and memory management
- Enable `lazyLoad: true` in configuration
- Adjust `maxRenderedPages` if issues persist
- Check browser console for memory warnings
- Use Chrome DevTools Memory profiler to verify cleanup

### Performance Issues with Large PDFs
1. **Enable lazy loading** (`lazyLoad: true`)
2. **Reduce concurrent pages** (`maxRenderedPages: 3`)
3. **Increase buffer cautiously** (`renderBuffer: 1`)
4. **Check memory usage** in browser DevTools
5. **Clear browser cache** if issues persist
6. **Reduce initial scale** for faster first page load

### Markdown Not Rendering
1. Verify markdown file path
2. Check markdown syntax is valid
3. Verify marked.js is loaded
4. Check browser console for errors
5. Test with simple markdown first

### Performance Issues
1. Reduce PDF page size
2. Optimize images in markdown
3. Limit markdown file size
4. Use lazy loading
5. Implement pagination for long content

## Related Documentation

- [JavaScript Files](../js/README.md)
- [Stylesheets](../styles/README.md)
- [Source Files](../src/README.md)
- [Developer Guide](../../../.github/docs/README-DEV.md)

---

**Last Updated:** October 2025  
**File Count:** 2  
**Purpose:** Content rendering for PDFs and Markdown
