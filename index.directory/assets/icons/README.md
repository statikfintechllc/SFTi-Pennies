# Application Icons

**📁 Location:** `/index.directory/assets/icons`

## Overview

This directory contains icon files for the SFTi-Pennies trading journal Progressive Web App (PWA). These icons enable the app to be installed on mobile devices and display properly on home screens.

## Files

### Icon Inventory

**Standard PWA Icons:**
- `icon-192.png` - 192×192px - Small icon for Android/Chrome
- `icon-512.png` - 512×512px - Large icon for high-res displays

## Icon Specifications

### `icon-192.png`
**Size:** 192×192 pixels  
**Format:** PNG with transparency  
**Purpose:** 
- Android home screen
- Chrome app drawer
- Small PWA icon
- Favicon fallback

**Usage in manifest.json:**
```json
{
  "src": "/index.directory/assets/icons/icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any maskable"
}
```

### `icon-512.png`
**Size:** 512×512 pixels  
**Format:** PNG with transparency  
**Purpose:**
- High-resolution displays
- App splash screens
- iOS home screen (resized)
- Large icon requirements

**Usage in manifest.json:**
```json
{
  "src": "/index.directory/assets/icons/icon-512.png",
  "sizes": "512x512",
  "type": "image/png",
  "purpose": "any maskable"
}
```

## Design Guidelines

### Current Design
The icons should represent the trading journal concept:
- **Theme:** Terminal/trading aesthetic
- **Colors:** Dark background with green accent (#00ff88)
- **Style:** Modern, professional
- **Elements:** Chart, stock ticker, or trading symbol

### Creating New Icons

#### Requirements
1. **Square format:** Always 1:1 aspect ratio
2. **Safe zone:** Keep important content within 80% of the icon
3. **Transparency:** Use PNG with alpha channel
4. **High contrast:** Visible on various backgrounds
5. **Scalability:** Design should work at all sizes

#### Recommended Sizes
While only 192×192 and 512×512 are currently used, consider creating:
- 72×72 (Android legacy)
- 96×96 (Android legacy)
- 128×128 (Chrome Web Store)
- 144×144 (Windows tile)
- 152×152 (iOS touch icon)
- 180×180 (iOS retina)
- 192×192 (Standard PWA)
- 384×384 (Optional mid-size)
- 512×512 (Standard PWA large)

#### Design Tools
- **Figma** - Web-based design
- **Adobe Illustrator** - Vector design
- **Inkscape** - Free vector editor
- **GIMP** - Free raster editor
- **Sketch** - Mac design tool

#### Export Settings
```
Format: PNG
Color: RGB
Bit depth: 24-bit + alpha
Compression: Maximum (lossless)
Background: Transparent
```

## PWA Integration

### manifest.json Configuration

The icons are referenced in `/manifest.json`:

```json
{
  "name": "SFTi-Pennies Trading Journal",
  "short_name": "SFTi Pennies",
  "icons": [
    {
      "src": "/index.directory/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/index.directory/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0a0e27",
  "background_color": "#0a0e27"
}
```

### HTML Meta Tags

Icons should also be referenced in HTML:

```html
<!-- Standard favicon -->
<link rel="icon" type="image/png" sizes="192x192" 
      href="/index.directory/assets/icons/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" 
      href="/index.directory/assets/icons/icon-512.png">

<!-- Apple touch icon -->
<link rel="apple-touch-icon" sizes="180x180" 
      href="/index.directory/assets/icons/icon-192.png">

<!-- Android/Chrome -->
<link rel="icon" type="image/png" sizes="192x192" 
      href="/index.directory/assets/icons/icon-192.png">
```

## Platform-Specific Requirements

### iOS (Safari)
- Prefers 180×180 icon
- Will resize 192×192 if needed
- Rounded corners applied automatically
- Add to home screen uses icon

### Android (Chrome)
- Uses 192×192 for home screen
- Uses 512×512 for splash screen
- Supports maskable icons
- Adaptive icon support optional

### Desktop (Chrome/Edge/Firefox)
- Uses favicon or 192×192
- PWA installation uses largest available
- Tab icon from smallest size

### Windows
- Can use 144×144 tile
- Supports dynamic tile (optional)
- Pin to taskbar uses largest icon

## Testing Icons

### Browser Testing
1. **Chrome DevTools:**
   ```
   F12 → Application → Manifest → View icons
   ```

2. **Firefox DevTools:**
   ```
   F12 → Application → Manifest → Icons
   ```

3. **Safari Web Inspector:**
   ```
   Develop → Show Web Inspector → Storage → App Cache
   ```

### PWA Installation Test
1. Open site in Chrome/Edge
2. Click install icon in address bar
3. Verify icon appears correctly
4. Check home screen icon
5. Verify splash screen icon

### Online Tools
- [Favicon Checker](https://realfavicongenerator.net/favicon_checker)
- [PWA Builder](https://www.pwabuilder.com/)
- [Manifest Validator](https://manifest-validator.appspot.com/)

## Updating Icons

### Steps to Update Icons

1. **Create new icon designs** following guidelines above

2. **Export at required sizes:**
   ```bash
   # Example with ImageMagick
   convert original.png -resize 192x192 icon-192.png
   convert original.png -resize 512x512 icon-512.png
   ```

3. **Optimize file size:**
   ```bash
   # Using optipng
   optipng -o7 icon-192.png
   optipng -o7 icon-512.png
   
   # Using pngquant (lossy but smaller)
   pngquant --quality=80-95 icon-192.png
   pngquant --quality=80-95 icon-512.png
   ```

4. **Replace files** in this directory

5. **Clear cache:**
   - Browser cache
   - Service worker cache (if implemented)
   - CDN cache (if used)

6. **Test installation:**
   - Uninstall PWA
   - Clear browser cache
   - Reinstall PWA
   - Verify new icons appear

## File Size Guidelines

### Recommended Sizes
- `icon-192.png`: < 10KB (typically 3-8KB)
- `icon-512.png`: < 30KB (typically 10-25KB)

### Optimization
```bash
# Optimize with optipng (lossless)
optipng -o7 icon-*.png

# Optimize with pngquant (lossy, better compression)
pngquant --quality=85-95 icon-*.png --ext .png --force

# Check file size
ls -lh icon-*.png
```

## Accessibility

### Icon Design for Accessibility
- **High contrast:** Ensure visibility on various backgrounds
- **Simple design:** Avoid complex details that don't scale
- **Meaningful:** Icon should represent the app's purpose
- **Color blind friendly:** Don't rely solely on color

### Alternative Text
In HTML, provide alt text:
```html
<link rel="icon" href="icon-192.png" alt="SFTi-Pennies Trading Journal">
```

## Troubleshooting

### Icon Not Showing
1. Check file path in manifest.json
2. Verify file exists and is accessible
3. Clear browser cache
4. Check browser console for errors
5. Validate manifest.json syntax

### Wrong Size Displayed
1. Ensure sizes match in manifest
2. Check if browser scales appropriately
3. Provide all recommended sizes
4. Test on actual device

### Blurry Icon
1. Provide higher resolution source
2. Export at exact required sizes
3. Avoid upscaling small images
4. Use vector source when possible

## Best Practices

### Do's ✅
- Use transparent backgrounds
- Design for 512×512, scale down
- Test on actual devices
- Optimize file sizes
- Use consistent branding
- Follow platform guidelines
- Provide multiple sizes

### Don'ts ❌
- Don't use text that's too small
- Don't use complex gradients
- Don't rely on thin lines
- Don't use low contrast
- Don't exceed 100KB per icon
- Don't forget to optimize
- Don't use JPEG (use PNG)

## Related Documentation

- [PWA Manifest](/manifest.json)
- [CSS Styles](../css/README.md)
- [Assets Overview](../README.md)
- [Developer Guide](../../../.github/docs/README-DEV.md)

## External Resources

- [PWA Icon Guidelines](https://web.dev/add-manifest/)
- [Apple Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Favicon Generator](https://realfavicongenerator.net/)

---

**Last Updated:** October 2025  
**Icon Count:** 2  
**Purpose:** PWA installation and home screen icons
