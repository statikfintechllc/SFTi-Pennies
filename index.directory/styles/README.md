# Stylesheets

**📁 Location:** `/index.directory/styles`

## Overview

This directory contains specialized CSS stylesheets for content rendering in the SFTi-Pennies trading journal. These styles specifically handle the presentation of PDF documents and GitHub-flavored Markdown content.

## Files

### 1. `pdf-viewer.css`
**Styles for PDF document viewer**

**Size:** ~5KB  
**Lines:** ~143

#### Purpose
Provides styling for the PDF.js-based PDF viewer component:
- PDF canvas container
- Navigation controls
- Zoom controls
- Page indicator
- Loading states
- Responsive layout
- Dark theme integration

#### Key Sections

**Container Styling:**
```css
.pdf-viewer {
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**PDF Canvas:**
```css
.pdf-canvas {
  max-width: 100%;
  height: auto;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  margin: 0 auto;
}
```

**Control Bar:**
```css
.pdf-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}
```

**Navigation Buttons:**
```css
.pdf-button {
  padding: 0.5rem 1rem;
  background: var(--accent-green);
  color: var(--bg-primary);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}

.pdf-button:hover {
  background: var(--accent-green-light);
  transform: translateY(-1px);
}

.pdf-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Page Indicator:**
```css
.page-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}
```

**Loading Spinner:**
```css
.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--accent-green);
  font-size: 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pdf-loading::after {
  content: '⟳';
  animation: spin 1s linear infinite;
}
```

**Responsive Design:**
```css
@media (max-width: 768px) {
  .pdf-controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .pdf-canvas {
    max-width: 95%;
  }
}
```

#### Features

- **Dark Theme:** Integrated with main app color scheme
- **Responsive:** Works on desktop, tablet, and mobile
- **Touch-Friendly:** Large touch targets for mobile
- **Loading States:** Visual feedback during PDF loading
- **Zoom Controls:** Styled zoom in/out buttons
- **Page Navigation:** Previous/next with visual states
- **Keyboard Support:** Styles for keyboard navigation indicators

#### Usage

```html
<link rel="stylesheet" href="/index.directory/styles/pdf-viewer.css">

<div class="pdf-viewer">
  <div class="pdf-controls">
    <button class="pdf-button" id="prev-page">← Previous</button>
    <div class="page-info">
      Page <span id="page-num">1</span> of <span id="page-count">1</span>
    </div>
    <button class="pdf-button" id="next-page">Next →</button>
    <button class="pdf-button" id="zoom-out">-</button>
    <button class="pdf-button" id="zoom-in">+</button>
  </div>
  <div class="pdf-container">
    <canvas class="pdf-canvas" id="pdf-canvas"></canvas>
    <div class="pdf-loading">Loading...</div>
  </div>
</div>
```

### 2. `markdown.css`
**GitHub-style Markdown rendering**

**Size:** ~7.5KB  
**Lines:** ~218

#### Purpose
Provides GitHub-flavored Markdown styling with dark theme adaptation:
- Typography hierarchy
- Code block styling
- Table formatting
- List styling
- Blockquote styling
- Link styling
- Image handling
- Task list checkboxes
- Dark theme colors

#### Key Sections

**Base Typography:**
```css
.markdown-body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
}
```

**Headings:**
```css
.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}
```

**Code Blocks:**
```css
.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background: var(--bg-secondary);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.markdown-body pre code {
  display: inline;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: transparent;
  border: 0;
}
```

**Tables:**
```css
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin: 16px 0;
}

.markdown-body table th,
.markdown-body table td {
  padding: 8px 13px;
  border: 1px solid var(--border-color);
}

.markdown-body table th {
  font-weight: 600;
  background: var(--bg-secondary);
}

.markdown-body table tr:nth-child(2n) {
  background: rgba(255,255,255,0.02);
}
```

**Lists:**
```css
.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin: 16px 0;
}

.markdown-body li {
  margin: 0.25em 0;
}

.markdown-body li > p {
  margin: 16px 0;
}
```

**Task Lists:**
```css
.markdown-body input[type="checkbox"] {
  margin-right: 0.5em;
  cursor: pointer;
}

.markdown-body .task-list-item {
  list-style-type: none;
  margin-left: -1.5em;
}
```

**Blockquotes:**
```css
.markdown-body blockquote {
  padding: 0 1em;
  color: var(--text-secondary);
  border-left: 4px solid var(--accent-green);
  margin: 16px 0;
}

.markdown-body blockquote > :first-child {
  margin-top: 0;
}

.markdown-body blockquote > :last-child {
  margin-bottom: 0;
}
```

**Links:**
```css
.markdown-body a {
  color: var(--accent-green);
  text-decoration: none;
  transition: color 0.2s;
}

.markdown-body a:hover {
  color: var(--accent-green-light);
  text-decoration: underline;
}
```

**Images:**
```css
.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
```

**Responsive Design:**
```css
@media (max-width: 768px) {
  .markdown-body {
    font-size: 14px;
  }
  
  .markdown-body pre {
    font-size: 12px;
  }
  
  .markdown-body table {
    display: block;
    overflow-x: auto;
  }
}
```

#### Features

- **GitHub Styling:** Matches GitHub's markdown rendering
- **Dark Theme:** Adapted for dark terminal theme
- **Syntax Highlighting:** Compatible with Highlight.js
- **Responsive Tables:** Horizontal scroll on mobile
- **Task Lists:** Styled checkboxes
- **Code Formatting:** Inline and block code styling
- **Link Styling:** Consistent with app theme
- **Image Handling:** Responsive with shadows

#### Usage

```html
<link rel="stylesheet" href="/index.directory/styles/markdown.css">

<div class="markdown-body">
  <!-- Rendered markdown HTML goes here -->
  <h1>Heading</h1>
  <p>Paragraph with <code>inline code</code></p>
  <pre><code>code block</code></pre>
</div>
```

## Integration with Main Styles

### CSS Variables
Both stylesheets use CSS variables defined in `/index.directory/assets/css/main.css`:

```css
:root {
  --bg-primary: #0a0e27;
  --bg-secondary: #151b3d;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #2a3f5f;
  --accent-green: #00ff88;
  --accent-green-light: #33ffaa;
}
```

### Loading Styles

```html
<!-- Order matters -->
<link rel="stylesheet" href="/index.directory/assets/css/main.css">
<link rel="stylesheet" href="/index.directory/styles/pdf-viewer.css">
<link rel="stylesheet" href="/index.directory/styles/markdown.css">
```

## Customization

### Changing PDF Viewer Theme

```css
/* Override in custom CSS */
.pdf-viewer {
  background: #000;  /* Darker background */
}

.pdf-button {
  background: #0066cc;  /* Blue buttons */
}
```

### Changing Markdown Styling

```css
/* Override in custom CSS */
.markdown-body {
  font-size: 18px;  /* Larger text */
  max-width: 800px;
  margin: 0 auto;
}

.markdown-body h1 {
  color: #00ff88;  /* Green headings */
}
```

## Performance

### File Sizes
- `pdf-viewer.css`: ~5KB (raw), ~3KB (minified)
- `markdown.css`: ~7.5KB (raw), ~4KB (minified)
- Combined: ~12.5KB (raw), ~7KB (minified)

### Optimization
```bash
# Minify CSS
npx cssnano pdf-viewer.css pdf-viewer.min.css
npx cssnano markdown.css markdown.min.css

# Or use PostCSS
npx postcss styles/*.css --use autoprefixer cssnano -d dist/
```

## Browser Support

Both stylesheets support:
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Chrome Mobile

### Features Used
- CSS Variables (custom properties)
- Flexbox
- CSS Grid (in tables)
- Transitions
- Media Queries
- Pseudo-elements

## Troubleshooting

### PDF Viewer Issues

**Controls not visible:**
1. Check if pdf-viewer.css is loaded
2. Verify CSS variable definitions
3. Check z-index conflicts
4. Inspect browser console

**Canvas not displaying:**
1. Verify canvas element exists
2. Check JavaScript is rendering
3. Verify background colors aren't hiding canvas
4. Check viewport/container dimensions

### Markdown Issues

**Styling not applied:**
1. Ensure `.markdown-body` class on container
2. Check if markdown.css is loaded
3. Verify CSS specificity isn't overridden
4. Check browser console for errors

**Tables overflow:**
1. Verify responsive table CSS is applied
2. Check mobile media queries
3. Ensure overflow-x: auto is set
4. Test on actual device

## Related Documentation

- [Main CSS](../assets/css/README.md)
- [Rendering Modules](../render/README.md)
- [JavaScript Assets](../assets/js/README.md)
- [Developer Guide](../../../.github/docs/README-DEV.md)

---

**Last Updated:** October 2025  
**File Count:** 2  
**Purpose:** Specialized content rendering styles
