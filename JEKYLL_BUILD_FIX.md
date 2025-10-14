# Jekyll Build Fix - Summary

## Problem

The GitHub Pages Jekyll build was failing with the error:
```
Addressable::URI::InvalidURIError: Invalid scheme format: '**'
```

This occurred because Jekyll's `addressable` gem was attempting to parse a filename containing special characters (colons and asterisks) as a URL scheme.

## Root Cause

A template file located at `index.directory/SFTi.Tradez/template/**:**:****.*.md` contained:
- Multiple asterisks (`**`)
- Multiple colons (`:`)

These characters caused Jekyll's URL parser to interpret the filename as a malformed URL scheme when the `jekyll-readme-index` plugin tried to generate URLs for all files in the repository.

## Solution

### 1. Renamed Problematic File
- **Old name**: `**:**:****.*.md`
- **New name**: `trade-template.md`
- **Location**: `index.directory/SFTi.Tradez/template/`

The file was a template reference file that wasn't actually used by the application code. The filename pattern `**:**:****.*.md` was meant to represent the naming convention `MM:DD:YYYY.N.md` used for actual trade entries.

### 2. Created Root-Level Jekyll Configuration
Created `_config.yml` in the repository root with:
- Explicit exclusion of directories that should not be processed by Jekyll
- Pattern-based exclusions for files with problematic characters
- Proper include directives for necessary assets and JSON files

Key exclusion patterns added:
```yaml
exclude:
  - index.directory/Informational.Bookz/
  - index.directory/SFTi.Notez/
  - index.directory/SFTi.Tradez/
  - "**/*:*"
  - "**/**:**:****.*.md"
```

### 3. Added Workflow Sanitization Check
Added a pre-build step to the GitHub Actions workflow (`trade_pipeline.yml`) that:
- Scans for files with problematic characters (colons, asterisks)
- Reports any such files found
- Helps prevent future occurrences of this issue

### 4. Updated Documentation
Updated `index.directory/SFTi.Tradez/template/README.md` to:
- Explain the purpose of the template file
- Document the filename change
- Clarify that the template is a reference, not used directly by code

## Impact

### Fixed
- ✅ Jekyll build will now complete successfully
- ✅ GitHub Pages deployment will work
- ✅ No impact on existing functionality (template wasn't referenced in code)

### No Breaking Changes
- ✅ JavaScript code in `app.js` generates trade files dynamically and doesn't reference the template
- ✅ Python scripts don't use the template file
- ✅ Trade naming convention `MM:DD:YYYY.N.md` is still used for actual trades (in week directories)

## Files Changed

1. `index.directory/SFTi.Tradez/template/**:**:****.*.md` → **DELETED**
2. `index.directory/SFTi.Tradez/template/trade-template.md` → **CREATED** (renamed from above)
3. `index.directory/SFTi.Tradez/template/README.md` → **UPDATED**
4. `_config.yml` → **CREATED** (new root-level Jekyll configuration)
5. `.github/workflows/trade_pipeline.yml` → **UPDATED** (added sanitization check)

## Verification

To verify the fix works:
1. The renamed template file uses only Jekyll-safe characters
2. The entire `index.directory/SFTi.Tradez/` directory is excluded from Jekyll processing
3. Pattern-based exclusions catch any similar problematic filenames
4. Workflow will report if any new problematic files are added

## Prevention

Future problematic filenames will be caught by:
1. The sanitization check in the workflow (reports files with colons)
2. Jekyll's exclude patterns in `_config.yml`
3. Directory-level exclusions preventing processing of trade directories

## References

- Issue: Jekyll build failure with `Invalid scheme format: '**'`
- Jekyll Documentation: https://jekyllrb.com/docs/configuration/
- Addressable Gem: Used by Jekyll for URL parsing
