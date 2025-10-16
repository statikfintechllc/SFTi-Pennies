# Modal Debugging Guide

This document explains how to use the comprehensive error logging added to `notes.html` and `books.html` to diagnose modal rendering issues.

## What Was Added

Both `notes.html` and `books.html` now include detailed console logging that tracks every step of the content loading process.

### Features

1. **Path Resolution Logging**: Shows how file paths are cleaned and resolved
2. **Multiple Path Attempts**: Tries 4 different path variations and logs each attempt
3. **HTTP Response Details**: Logs response status, headers, and content info
4. **Processing Steps**: Tracks markdown parsing, YAML stripping, and rendering
5. **Enhanced Error Messages**: Shows exact error type, message, and helpful instructions
6. **Visibility Forcing**: Explicitly sets CSS properties to ensure modals are visible

## How to Use

### Testing Notes (notes.html)

1. Open `index.directory/notes.html` in a browser
2. Open browser console (F12)
3. Click any "📖 Read Note" button
4. Observe console output

**Expected Console Output (Success):**
```
=== ATTEMPTING TO LOAD NOTE ===
Original filepath: index.directory/SFTi.Notez/7.Step.Frame.md
Cleaned path: SFTi.Notez/7.Step.Frame.md
Full fetch URL: ./SFTi.Notez/7.Step.Frame.md
Attempting fetch...
Trying path: ./SFTi.Notez/7.Step.Frame.md
  Response status: 200, ok: true
  SUCCESS with path: ./SFTi.Notez/7.Step.Frame.md
Response status: 200
Response ok: true
Response headers: [...]
Markdown loaded, length: 8336
First 100 chars: **The 7-Step Penny-Stocking Framework**...
After YAML strip, length: 8336
Rendering with marked.js...
HTML rendered, length: 9247
=== NOTE LOADED SUCCESSFULLY ===
Image 0 original src: ../assets/sfti.notez.assets/7.step.framework.assets/Step.1.png
Image 0 final src: ./assets/sfti.notez.assets/7.step.framework.assets/Step.1.png
```

**Expected Console Output (Failure):**
```
=== ATTEMPTING TO LOAD NOTE ===
Original filepath: index.directory/SFTi.Notez/7.Step.Frame.md
Cleaned path: SFTi.Notez/7.Step.Frame.md
Full fetch URL: ./SFTi.Notez/7.Step.Frame.md
Attempting fetch...
Trying path: ./SFTi.Notez/7.Step.Frame.md
  Response status: 200, ok: true
  SUCCESS with path: ./SFTi.Notez/7.Step.Frame.md
Response status: 200
Response ok: true
Markdown loaded, length: 8336
First 100 chars: **The 7-Step Penny-Stocking Framework**...
After YAML strip, length: 8336
Rendering with marked.js...
=== NOTE LOAD FAILED ===
Error type: ReferenceError
Error message: marked is not defined
Full error: ReferenceError: marked is not defined at openNote...
```

### Testing Books (books.html)

1. Open `index.directory/books.html` in a browser
2. Open browser console (F12)
3. Click any "📄 Open PDF" button
4. Observe console output

**Expected Console Output (Success):**
```
=== ATTEMPTING TO LOAD PDF ===
Original filepath: index.directory/Informational.Bookz/10_Patterns.pdf
Cleaned path: Informational.Bookz/10_Patterns.pdf
Full fetch URL: ./Informational.Bookz/10_Patterns.pdf
Attempting PDF.js getDocument...
Trying path: ./Informational.Bookz/10_Patterns.pdf
  SUCCESS with path: ./Informational.Bookz/10_Patterns.pdf
  PDF loaded, pages: 157
PDF loaded successfully
Total pages: 157
Rendering first page...
Rendering page 1 of 157...
Got page object for page 1
Viewport size: 1062x1375
Page 1 rendered successfully
=== PDF LOADED SUCCESSFULLY ===
```

**Expected Console Output (Failure):**
```
=== ATTEMPTING TO LOAD PDF ===
Original filepath: index.directory/Informational.Bookz/10_Patterns.pdf
Cleaned path: Informational.Bookz/10_Patterns.pdf
Full fetch URL: ./Informational.Bookz/10_Patterns.pdf
Attempting PDF.js getDocument...
Trying path: ./Informational.Bookz/10_Patterns.pdf
  Failed with path: ./Informational.Bookz/10_Patterns.pdf pdfjsLib is not defined
Trying path: ../Informational.Bookz/10_Patterns.pdf
  Failed with path: ../Informational.Bookz/10_Patterns.pdf pdfjsLib is not defined
Trying path: /Informational.Bookz/10_Patterns.pdf
  Failed with path: /Informational.Bookz/10_Patterns.pdf pdfjsLib is not defined
Trying path: Informational.Bookz/10_Patterns.pdf
  Failed with path: Informational.Bookz/10_Patterns.pdf pdfjsLib is not defined
=== PDF LOAD FAILED ===
Error type: Error
Error message: All path variations failed. Tried: ./Informational.Bookz/10_Patterns.pdf, ...
```

## Common Issues and Diagnostics

### Issue: "marked is not defined" (Notes)

**Cause**: The marked.js library failed to load from CDN

**Solutions**:
1. Check if CDN URL is accessible: `https://cdn.jsdelivr.net/npm/marked@11.0.0/marked.min.js`
2. Check Content Security Policy (CSP) headers
3. Check for ad blockers or browser extensions blocking CDN
4. Consider self-hosting marked.js library

### Issue: "pdfjsLib is not defined" (Books)

**Cause**: The PDF.js library failed to load from CDN

**Solutions**:
1. Check if CDN URL is accessible: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
2. Check Content Security Policy (CSP) headers
3. Check for ad blockers or browser extensions blocking CDN
4. Consider self-hosting PDF.js library

### Issue: "Response status: 404" or "Failed to load"

**Cause**: The file path is incorrect or file doesn't exist

**Diagnosis**: Look at which path variations were tried:
- `./path` - Relative to current directory
- `../path` - Relative to parent directory
- `/path` - Absolute from root
- `path` - Direct path without prefix

**Solutions**:
1. Verify file exists at the expected location
2. Check file permissions
3. Verify `notes-index.json` or `books-index.json` has correct paths
4. Check web server configuration

### Issue: Fetch succeeds but content doesn't render

**Cause**: Content loaded but processing failed

**Diagnosis**: Check the console logs to see where it failed:
- "Markdown loaded, length: X" → Fetch succeeded
- "After YAML strip, length: X" → YAML processing succeeded
- "Rendering with marked.js..." → About to render
- If it stops here, marked.js is the issue

## Path Resolution Logic

Both pages use the same path resolution algorithm:

1. Remove leading slashes from filepath
2. Strip `index.directory/` prefix if present
3. Try multiple path variations in order:
   - `./path` (recommended - relative to current directory)
   - `../path` (parent directory)
   - `/path` (absolute from root)
   - `path` (no prefix)
4. Use the first successful path

## Testing Locally

To test the modal functionality locally:

```bash
cd index.directory
python3 -m http.server 8080
# Open http://localhost:8080/notes.html or http://localhost:8080/books.html
```

## GitHub Pages Considerations

When deployed to GitHub Pages:

1. CDN resources must be allowed by CSP
2. File paths must be relative to `index.directory/`
3. CORS must allow loading markdown and PDF files
4. Check browser console for any blocked resources

## Success Criteria

✅ Console shows "=== NOTE LOADED SUCCESSFULLY ===" or "=== PDF LOADED SUCCESSFULLY ==="
✅ Modal displays rendered content (not error message)
✅ No error messages in modal body
✅ Images display in note modals
✅ PDF pages display in book modals
✅ Navigation works (for PDFs)

## Reporting Issues

When reporting modal issues, include:

1. Full console output (copy/paste from browser console)
2. Browser name and version
3. Operating system
4. Whether testing locally or on GitHub Pages
5. Screenshot of modal showing error
6. Network tab showing any failed requests
