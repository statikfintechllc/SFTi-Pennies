# Console Output Examples - Modal Debugging

This document shows real console output examples from testing the modal logging functionality.

## Notes Modal - Successful Load (Local Testing)

When CDN libraries load successfully:

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
Response headers: [
  ["server", "SimpleHTTP/0.6 Python/3.12.3"],
  ["date", "Thu, 16 Oct 2025 15:50:56 GMT"],
  ["content-type", "text/markdown"],
  ["content-length", "8462"]
]
Markdown loaded, length: 8336
First 100 chars: **The 7-Step Penny-Stocking Framework**

**Step #1**: The Pre-Pump or Promotion

<div align="center">

<img width="2048" height="1679" alt="image" src="../assets/sfti.notez.assets/7.step.framework.assets/Step.1.png" />
After YAML strip, length: 8336
Rendering with marked.js...
HTML rendered, length: 9247
=== NOTE LOADED SUCCESSFULLY ===
Image 0 original src: ../assets/sfti.notez.assets/7.step.framework.assets/Step.1.png
Image 0 final src: ./assets/sfti.notez.assets/7.step.framework.assets/Step.1.png
Image 1 original src: ../assets/sfti.notez.assets/7.step.framework.assets/Step.2.png
Image 1 final src: ./assets/sfti.notez.assets/7.step.framework.assets/Step.2.png
...
```

## Notes Modal - Failed Load (CDN Blocked)

When marked.js library fails to load:

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
Response headers: Array(5)
Markdown loaded, length: 8336
First 100 chars: **The 7-Step Penny-Stocking Framework**

**Step #1**: The Pre-Pump or Promoti...
After YAML strip, length: 8336
Rendering with marked.js...
=== NOTE LOAD FAILED ===
Error type: ReferenceError
Error message: marked is not defined
Full error: ReferenceError: marked is not defined
    at openNote (http://localhost:8080/notes.html:362:20)
```

**Diagnosis**: File loaded successfully (200 OK, 8336 bytes), but marked.js library is not available.

**Solution**: Check if marked.js CDN is blocked, verify CSP headers, or self-host the library.

## Books Modal - Successful Load (Local Testing)

When PDF.js library loads successfully:

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

## Books Modal - Failed Load (CDN Blocked)

When PDF.js library fails to load:

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
Error message: All path variations failed. Tried: ./Informational.Bookz/10_Patterns.pdf, ../Informational.Bookz/10_Patterns.pdf, /Informational.Bookz/10_Patterns.pdf, Informational.Bookz/10_Patterns.pdf
Full error: Error: All path variations failed. Tried: ./Informational.Bookz/10_Patterns.pdf, ../Informational.Bookz/10_Patterns.pdf, /Informational.Bookz/10_Patterns.pdf, Informational.Bookz/10_Patterns.pdf
```

**Diagnosis**: PDF.js library is not available, so every path attempt fails immediately.

**Solution**: Check if PDF.js CDN is blocked, verify CSP headers, or self-host the library.

## Notes Modal - File Not Found

When the markdown file doesn't exist:

```
=== ATTEMPTING TO LOAD NOTE ===
Original filepath: index.directory/SFTi.Notez/nonexistent.md
Cleaned path: SFTi.Notez/nonexistent.md
Full fetch URL: ./SFTi.Notez/nonexistent.md
Attempting fetch...
Trying path: ./SFTi.Notez/nonexistent.md
  Response status: 404, ok: false
Trying path: ../SFTi.Notez/nonexistent.md
  Response status: 404, ok: false
Trying path: /SFTi.Notez/nonexistent.md
  Response status: 404, ok: false
Trying path: SFTi.Notez/nonexistent.md
  Response status: 404, ok: false
=== NOTE LOAD FAILED ===
Error type: Error
Error message: All path variations failed. Tried: ./SFTi.Notez/nonexistent.md, ../SFTi.Notez/nonexistent.md, /SFTi.Notez/nonexistent.md, SFTi.Notez/nonexistent.md
```

**Diagnosis**: File doesn't exist at any of the attempted paths.

**Solution**: Verify file exists, check file path in index JSON, verify case sensitivity.

## How to Interpret the Logs

### 1. **Path Resolution Success**
Look for: `SUCCESS with path: [path]`
- If you see this, the file was found
- The path shown is the one that worked
- Usually it's the first path tried (`./ + cleanPath`)

### 2. **Fetch Success vs Rendering Failure**
- `Markdown loaded, length: X` → File loaded OK
- `=== NOTE LOAD FAILED ===` after this → Problem is in rendering, not fetching
- This indicates a CDN library issue, not a path issue

### 3. **All Paths Failed**
- If all 4 path variations return 404
- File doesn't exist or web server can't find it
- Check file system, permissions, and index JSON

### 4. **Immediate Failure on All Paths**
- If all paths fail with same error (e.g., "pdfjsLib is not defined")
- Library dependency is missing
- Check CDN availability and CSP headers

## Testing Checklist

When deploying to GitHub Pages, verify:

- [ ] Console shows attempt to load note/book
- [ ] At least one path returns status 200
- [ ] Markdown/PDF content length is > 0
- [ ] No "is not defined" errors for marked or pdfjsLib
- [ ] Images process successfully (notes only)
- [ ] Canvas renders successfully (books only)
- [ ] See "=== LOADED SUCCESSFULLY ===" message

If any step fails, the console output will show exactly where and why.
