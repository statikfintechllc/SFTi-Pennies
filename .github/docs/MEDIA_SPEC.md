# Media Storage Specification

This document describes how screenshots, charts, and other media should be stored and referenced in the SFTi-Pennies trading journal.

## Directory Structure

```
index.directory/assets/
├── trade-media/              # Trade-specific media files
│   ├── {trade-id}/          # Directory per trade
│   │   ├── entry.png        # Entry chart screenshot
│   │   ├── exit.png         # Exit chart screenshot
│   │   ├── setup.png        # Pre-trade setup
│   │   └── notes.png        # Additional annotations
│   └── README.md
├── charts/                   # Generated analytics charts
│   ├── equity-curve.png
│   ├── trade-distribution.png
│   └── ...
└── sfti.tradez.assets/      # Weekly trade assets
    └── week.{XXXX}/
        └── ...
```

## File Naming Conventions

### Trade Media Files

Trade-specific media should be stored in subdirectories named after the trade identifier:

- **Directory name**: `{trade-number}` or `{date}-{ticker}-{direction}`
  - Examples: `001`, `2025-01-15-AAPL-long`

- **File names**:
  - `entry.png` - Chart at entry point
  - `exit.png` - Chart at exit point
  - `setup.png` - Pre-trade analysis/setup
  - `intraday-{N}.png` - Intraday progression (N = 1, 2, 3, ...)
  - `notes.png` - Annotated chart with notes
  - `screenshot-{timestamp}.png` - Generic screenshot with timestamp

### Supported Formats

- **Images**: PNG (preferred), JPG, GIF
- **Maximum size**: 2MB per file (will be optimized by workflow)
- **Recommended dimensions**: 1920x1080 or smaller

## Referencing Media in Markdown

### In Trade Markdown Files

Use relative paths to reference media:

```markdown
---
trade_number: 1
ticker: AAPL
images:
  - path: /index.directory/assets/trade-media/001/entry.png
    caption: Entry setup with resistance break
  - path: /index.directory/assets/trade-media/001/exit.png
    caption: Exit at target
---

## Trade Setup

Entry chart showing the breakout:

![Entry Setup](../assets/trade-media/001/entry.png)

## Exit

Target reached as shown:

![Exit](../assets/trade-media/001/exit.png)
```

### In trades-index.json

Images can be referenced in the JSON schema:

```json
{
  "trade_number": 1,
  "ticker": "AAPL",
  "images": [
    {
      "path": "/index.directory/assets/trade-media/001/entry.png",
      "type": "entry",
      "caption": "Entry setup with resistance break"
    },
    {
      "path": "/index.directory/assets/trade-media/001/exit.png",
      "type": "exit",
      "caption": "Exit at target"
    }
  ]
}
```

## Upload Methods

### Method 1: Manual Commit (Current)

1. Add images to the appropriate directory
2. Commit and push to repository
3. Workflow will optimize images automatically

### Method 2: Via Add Trade Form

The add-trade.html form supports image upload:

1. Select image files in the form
2. Images are uploaded to `.github/assets/` initially
3. Workflow moves them to `index.directory/assets/trade-media/`
4. Images are optimized and resized

### Method 3: CSV Import with Media References (Future)

CSV can include media URLs or local paths:

```csv
Symbol,Entry Date,Exit Date,...,Media
AAPL,2025-01-15,2025-01-16,...,entry.png;exit.png
```

## Image Optimization

All images are automatically optimized by the GitHub Actions workflow:

- **PNG files**: Optimized with `optipng`
- **JPG files**: Optimized with `jpegoptim`
- **Max dimensions**: Resized to 1920x1080 if larger
- **Quality**: PNG lossless, JPG 85%

## Best Practices

### File Organization

1. **One directory per trade**: Keep all media for a trade together
2. **Descriptive names**: Use standard names (entry.png, exit.png) for consistency
3. **Include captions**: Add meaningful captions to images
4. **Limit file size**: Keep individual files under 2MB before optimization

### Screenshot Guidelines

1. **Chart screenshots**:
   - Include full chart with price, volume, and indicators
   - Mark entry/exit points clearly
   - Use annotations to highlight key levels

2. **Setup screenshots**:
   - Show the pre-trade analysis
   - Include watchlist or scanner results
   - Highlight the trigger for entry

3. **Exit screenshots**:
   - Show why you exited (target hit, stop hit, etc.)
   - Include final P&L if available

### Privacy & Security

1. **Remove sensitive data**: Blur or remove account numbers, balances, personal info
2. **No credentials**: Never include API keys, passwords, or tokens
3. **Public repository**: Remember this is a public journal

## Future Enhancements

- **Cloud storage integration**: Support for S3, Cloudinary, or similar
- **Video support**: Allow MP4 files for trade replays
- **Lightbox gallery**: Interactive image viewer in trade.html
- **Image annotations**: Built-in annotation tool
- **Mobile upload**: Direct upload from mobile devices
- **Drag-and-drop**: Easier upload via web interface

## Technical Details

### Image Processing Pipeline

1. **Upload** → `.github/assets/` (temporary)
2. **Workflow triggers** → `optimize_images.sh` runs
3. **Optimization** → `optipng` or `jpegoptim` applied
4. **Move** → Optimized images moved to final location
5. **Index update** → trades-index.json updated with paths
6. **Deploy** → Changes pushed to GitHub Pages

### Storage Limits

- **Repository size**: GitHub recommends <1GB total
- **Individual file**: Max 100MB (GitHub limit)
- **Practical limit**: Keep repository under 500MB for performance

## Examples

### Example 1: Simple Trade with Entry/Exit

```
index.directory/assets/trade-media/001/
├── entry.png     (245 KB)
└── exit.png      (198 KB)
```

### Example 2: Detailed Swing Trade

```
index.directory/assets/trade-media/015/
├── setup.png           (412 KB) - Pre-market analysis
├── entry.png           (328 KB) - Entry point
├── intraday-1.png      (301 KB) - Day 1 progress
├── intraday-2.png      (289 KB) - Day 2 progress
├── exit.png            (334 KB) - Exit point
└── notes.png           (445 KB) - Lessons learned
```

### Example 3: Multiple Entries/Exits

```
index.directory/assets/trade-media/023/
├── entry-1.png    - First entry
├── entry-2.png    - Add to position
├── exit-1.png     - Partial exit
└── exit-2.png     - Full exit
```

## Support

For questions or issues:
- Check `.github/docs/IMPLEMENTATION.md`
- Review `.github/scripts/optimize_images.sh`
- Open an issue on GitHub
