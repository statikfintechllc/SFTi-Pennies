# Testing Checklist for Notes and Books Fix

## Pre-Deployment Verification ✓

- [x] index.directory/_config.yml updated with merged configuration from root and index.directory
- [x] Root _config.yml removed for cleanliness
- [x] GitHub Actions workflow updated to use index.directory/_config.yml
- [x] manifest.json copied to index.directory/
- [x] Duplicate openPDF function removed from books.html
- [x] All changes committed and pushed
- [x] Documentation created

## Post-Deployment Testing (After GitHub Pages deployment)

### Notes Page Testing
- [ ] Navigate to https://statikfintechllc.github.io/SFTi-Pennies/index.directory/notes.html
- [ ] Verify notes grid displays 4 note cards
- [ ] Click "The 7-Step Penny-Stocking Framework" note
- [ ] Verify modal opens with rendered markdown
- [ ] Verify images display correctly in the note
- [ ] Check browser console for success message: `=== NOTE LOADED SUCCESSFULLY ===`
- [ ] Verify no 404 errors in Network tab
- [ ] Click close button to close modal
- [ ] Test other notes similarly

### Books Page Testing
- [ ] Navigate to https://statikfintechllc.github.io/SFTi-Pennies/index.directory/books.html
- [ ] Verify books grid displays 6 book cards
- [ ] Click "10 Patterns" book
- [ ] Verify modal opens with PDF viewer
- [ ] Verify PDF content displays
- [ ] Check browser console for success message: `=== PDF LOADED SUCCESSFULLY ===`
- [ ] Verify no 404 errors in Network tab
- [ ] Verify PDF scrolling works
- [ ] Click close button to close modal
- [ ] Test other books similarly

### Console Checks
- [ ] No 404 errors for manifest.json
- [ ] No 404 errors for markdown files (.md)
- [ ] No 404 errors for PDF files (.pdf)
- [ ] No JavaScript errors
- [ ] Path resolution logs show clean paths (without 404s)

### Navigation Testing
- [ ] Click "Home" link - navigates to main page
- [ ] Click "Books" link - navigates to books page
- [ ] Click "Notes" link - navigates to notes page
- [ ] All navigation links work correctly

## Expected Console Output

### Successful Note Load
```
=== ATTEMPTING TO LOAD NOTE ===
Original filepath: index.directory/SFTi.Notez/7.Step.Frame.md
Cleaned path: SFTi.Notez/7.Step.Frame.md
Fetching from: ./SFTi.Notez/7.Step.Frame.md
Response status: 200
Markdown loaded, length: 8462
Initializing MarkdownRenderer...
Rendering markdown with GFM and GitHub callouts...
HTML rendered, length: XXXX
=== NOTE LOADED SUCCESSFULLY ===
Image paths fixed
```

### Successful PDF Load
```
=== ATTEMPTING TO LOAD PDF ===
Original filepath: index.directory/Informational.Bookz/10_Patterns.pdf
Cleaned path: Informational.Bookz/10_Patterns.pdf
Loading PDF from: ./Informational.Bookz/10_Patterns.pdf
Initializing PDFRenderer...
=== PDF LOADED SUCCESSFULLY ===
PDF rendered with scrollable viewer
```

## Troubleshooting

If issues persist after deployment:

1. **Clear browser cache**: Hard refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Wait for Jekyll build**: GitHub Pages may take a few minutes to rebuild
3. **Check GitHub Actions**: Verify the pages-build-deployment workflow succeeded
4. **Verify files deployed**: Check that markdown and PDF files are accessible directly via URL

## Success Criteria

✅ All notes open and display correctly
✅ All books open and display correctly
✅ No 404 errors in console
✅ No JavaScript errors
✅ Navigation works correctly
✅ Modals open and close smoothly
✅ Content renders properly (markdown and PDFs)
