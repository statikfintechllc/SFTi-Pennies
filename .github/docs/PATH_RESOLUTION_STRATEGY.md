# Path Resolution Strategy & Edge Cases

## Overview
This document explains the path resolution logic used in `notes.html` and `books.html`, and addresses edge cases for potential future changes.

## Current Implementation

### Directory Structure
```
/
├── index.html (root)
└── index.directory/
    ├── notes.html          ← We are here
    ├── books.html          ← We are here
    ├── notes-index.json
    ├── books-index.json
    ├── SFTi.Notez/
    │   └── *.md
    ├── Informational.Bookz/
    │   └── *.pdf
    └── assets/
        └── sfti.notez.assets/
            └── **/*.png
```

### Path Resolution Logic

**For Notes & Books:**
```javascript
let cleanPath = filepath.replace(/^\/+/, '');           // Remove leading slashes
if (cleanPath.startsWith('index.directory/')) {
  cleanPath = cleanPath.substring('index.directory/'.length);  // Strip prefix
}
const finalPath = './' + cleanPath;                     // Make relative
```

**For Images:**
```javascript
let cleanSrc = img.getAttribute('src').replace(/^\/+/, '');  // Remove leading slashes
if (cleanSrc.startsWith('../')) {
  cleanSrc = cleanSrc.substring(3);                      // Strip '../'
}
img.src = './' + cleanSrc;                               // Make relative
```

## Edge Cases & Future Considerations

### 1. Directory Rename: `index.directory/` → `content/`

**Impact:** High - Requires code changes
**Required Updates:**
1. Update path stripping logic in both HTML files:
   ```javascript
   // Change from:
   if (cleanPath.startsWith('index.directory/')) {
     cleanPath = cleanPath.substring('index.directory/'.length);
   }
   
   // To:
   if (cleanPath.startsWith('content/')) {
     cleanPath = cleanPath.substring('content/'.length);
   }
   ```

2. Update JSON generation scripts to use new prefix
3. Re-run indexing to regenerate JSON files
4. Update navigation links across the site

**Mitigation Strategy:**
- Consider using a configuration constant at the top of each file:
  ```javascript
  const DIRECTORY_PREFIX = 'index.directory/';
  if (cleanPath.startsWith(DIRECTORY_PREFIX)) {
    cleanPath = cleanPath.substring(DIRECTORY_PREFIX.length);
  }
  ```

### 2. Moving HTML Files to Root: `index.directory/notes.html` → `notes.html`

**Impact:** Medium - Requires path adjustments
**Required Updates:**
1. **No changes needed to stripping logic** - it would still work correctly
2. Update fetch paths to include the directory:
   ```javascript
   // Change from:
   fetch('./notes-index.json')
   
   // To:
   fetch('./index.directory/notes-index.json')
   ```

3. Update relative paths for resources:
   ```javascript
   // Files would be in index.directory/, so:
   fetch('./index.directory/' + cleanPath)
   ```

### 3. Nested Directory Structure: `index.directory/sections/notes/`

**Impact:** High - Significant restructuring needed
**Required Updates:**
1. Adjust prefix stripping to handle nested structure
2. Update JSON paths to include full nested path
3. Consider implementing recursive path resolution
4. Update all navigation links

**Recommended Approach:**
```javascript
// More flexible path resolution
function resolveRelativePath(filepath, currentDir) {
  const cleanPath = filepath.replace(/^\/+/, '');
  const prefixes = ['index.directory/', 'index.directory/sections/', 'sections/notes/'];
  
  for (const prefix of prefixes) {
    if (cleanPath.startsWith(prefix)) {
      return './' + cleanPath.substring(prefix.length);
    }
  }
  return './' + cleanPath;
}
```

### 4. Multiple Prefixes: Different sections with different paths

**Impact:** Medium - Requires configurable logic
**Solution:** Use a configuration map:
```javascript
const PATH_CONFIG = {
  'notes': 'index.directory/',
  'books': 'index.directory/',
  'trades': 'index.directory/SFTi.Tradez/'
};

function cleanPath(filepath, section) {
  let cleaned = filepath.replace(/^\/+/, '');
  const prefix = PATH_CONFIG[section];
  if (prefix && cleaned.startsWith(prefix)) {
    cleaned = cleaned.substring(prefix.length);
  }
  return './' + cleaned;
}
```

### 5. External Asset CDN: Moving images to CDN

**Impact:** Low - Easy to handle
**Solution:** Check for absolute URLs:
```javascript
if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
  img.src = cleanSrc;  // Use as-is for CDN URLs
} else {
  // Apply path resolution logic
}
```

## Testing Strategy

### Automated Tests
Run the automated test suite to verify path resolution:
```bash
node .github/scripts/test_path_resolution.js
```

This tests:
- ✅ Paths with `index.directory/` prefix
- ✅ Paths without prefix
- ✅ Paths with leading slashes
- ✅ Image paths with `../` prefix
- ✅ Edge cases (empty paths, double nested, etc.)

### Manual Testing
1. Test notes modal with various markdown files
2. Test books modal with various PDF files
3. Verify image loading in different contexts
4. Test on different deployment environments (GitHub Pages, local, custom domain)

## Deployment Considerations

### GitHub Pages
- Current implementation works correctly with GitHub Pages
- Relative paths avoid issues with repository name in URL
- No special configuration needed

### Custom Domain
- Works identically to GitHub Pages
- Base path logic removed to support any domain
- Paths are always relative to current location

### Local Development
- Use a local web server (e.g., `python -m http.server` or `live-server`)
- Do not open HTML files directly (file:// protocol won't work)
- Server must be started from repository root

## Backward Compatibility

The current implementation maintains backward compatibility by:
1. **Defensive checking:** Only strips prefix if present
2. **Fallback behavior:** Works with or without prefix
3. **No breaking changes:** Existing JSON files continue to work

## Future-Proofing Recommendations

1. **Use configuration constants** for directory names
2. **Centralize path logic** in a shared JavaScript module
3. **Add CI/CD tests** to catch path resolution issues
4. **Document path format** in JSON schema
5. **Consider a path resolution service** if structure becomes more complex

## Summary

The path resolution logic is designed to be:
- ✅ **Simple**: Easy to understand and maintain
- ✅ **Robust**: Handles edge cases gracefully
- ✅ **Flexible**: Can adapt to minor structural changes
- ✅ **Tested**: Automated tests verify correctness

For major structural changes (directory rename, moving files), review this document and update the path resolution logic accordingly.
