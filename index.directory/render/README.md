# Rendering Modules

**📁 Location:** `/index.directory/render`

## Overview

This directory contains JavaScript modules responsible for rendering PDF and Markdown content in the trading journal interface. These modules handle the display of trading books (PDFs) and trading notes (Markdown) with proper styling and interactivity.

## Files

### 1. `pdfRenderer.js`
**PDF document rendering module**

**Size:** ~7KB  
**Lines:** ~202

#### Purpose
Renders PDF files (trading books) in the browser using PDF.js library:
- Display PDFs in embedded viewer
- Page navigation controls
- Zoom and pan functionality
- Mobile-optimized rendering
- Loading indicators
- Error handling

#### Key Functions

```javascript
// Initialize PDF renderer
initPDFRenderer(container, pdfUrl)

// Load and render PDF
async function loadPDF(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  return pdf;
}

// Render specific page
async function renderPage(pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: currentScale });
  // Canvas rendering...
}

// Navigation controls
function nextPage()
function previousPage()
function goToPage(pageNum)

// Zoom controls
function zoomIn()
function zoomOut()
function resetZoom()
```

#### Features

**PDF Display:**
- Canvas-based rendering
- High-quality text rendering
- Image preservation
- Responsive sizing

**Navigation:**
- Next/Previous buttons
- Page number input
- Jump to specific page
- Keyboard shortcuts (Arrow keys, Page Up/Down)

**Zoom Controls:**
- Zoom in/out buttons
- Fit to width
- Fit to page
- Custom zoom levels
- Pinch to zoom (mobile)

**Performance:**
- Lazy page loading
- Canvas caching
- Worker thread for processing
- Optimized rendering

#### Usage

```javascript
// In books.html or similar
import { initPDFRenderer } from './render/pdfRenderer.js';

// Initialize with container and PDF URL
const container = document.getElementById('pdf-container');
const pdfUrl = '/index.directory/Informational.Bookz/book.pdf';
initPDFRenderer(container, pdfUrl);
```

#### Configuration

```javascript
const config = {
  scale: 1.5,              // Default zoom level
  maxScale: 3.0,           // Maximum zoom
  minScale: 0.5,           // Minimum zoom
  scaleStep: 0.25,         // Zoom increment
  canvasClass: 'pdf-canvas',
  containerClass: 'pdf-viewer'
};
```

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

### PDF Rendering
- **Initial load:** 1-2 seconds for medium PDF
- **Page render:** 100-300ms per page
- **Memory:** ~10-50MB depending on PDF size
- **Optimization:** Worker thread prevents UI blocking

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
2. Verify PDF.js worker path is correct
3. Check browser console for errors
4. Try different PDF file
5. Check CORS settings if hosted externally

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
