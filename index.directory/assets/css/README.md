# CSS Stylesheets

**📁 Location:** `/index.directory/assets/css`

## Overview

This directory contains the CSS stylesheets for the SFTi-Pennies trading journal web interface. The styles implement a dark terminal trading theme with responsive design optimized for both desktop and mobile devices.

## Files

### `main.css`
**Primary stylesheet for the trading journal interface**

**Size:** ~14KB  
**Lines:** ~718

#### Purpose
Provides all visual styling for the trading journal website, including:
- Dark terminal color scheme
- Responsive layout system
- Trading-specific UI components
- Mobile-first design
- Animations and transitions
- Form styling
- Chart containers
- Navigation components

#### Key Features

**1. Color Scheme**
Dark terminal trading theme with strategic accent colors:
```css
:root {
  --bg-primary: #0a0e27;        /* Deep navy background */
  --bg-secondary: #151b3d;      /* Secondary panels */
  --accent-green: #00ff88;      /* Profit/success color */
  --accent-red: #ff4757;        /* Loss/danger color */
  --text-primary: #e0e0e0;      /* Main text */
  --text-secondary: #a0a0a0;    /* Secondary text */
  --border-color: #2a3f5f;      /* Borders and dividers */
}
```

**2. Typography**
Professional trading terminal fonts:
```css
font-family: 'JetBrains Mono', monospace;  /* Code/numbers */
font-family: 'Inter', sans-serif;          /* General text */
```

**3. Responsive Breakpoints**
Mobile-first design with specific breakpoints:
- Mobile: `< 768px`
- iPhone SE: `375px` (13px base font)
- iPhone 14: `390px - 430px` (15px base font)
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

**4. Component Styles**

**Trade Cards:**
- Hover animations
- Profit/loss color coding
- Shadow effects
- Responsive sizing

**Forms:**
- Large touch targets for mobile
- Clear validation states
- Custom styled inputs
- Accessible labels

**Navigation:**
- Hamburger menu for mobile
- Smooth transitions
- Active state indicators
- Dropdown support

**Charts:**
- Responsive containers
- Dark theme colors
- Proper aspect ratios
- Mobile optimization

**5. Animations**
Smooth, professional animations:
```css
.fade-in { animation: fadeIn 0.3s ease-in; }
.slide-up { animation: slideUp 0.4s ease-out; }
.pulse { animation: pulse 2s infinite; }
```

**6. Utilities**
Helpful utility classes:
- Spacing: `.mt-4`, `.p-2`, `.gap-4`
- Display: `.flex`, `.grid`, `.hidden`
- Colors: `.text-green`, `.bg-red`, `.border-gray`
- Typography: `.text-sm`, `.font-bold`, `.uppercase`

#### CSS Structure

```css
/* 1. CSS Variables */
:root { ... }

/* 2. Base Styles */
*, html, body { ... }

/* 3. Layout */
.container, .grid, .flex { ... }

/* 4. Typography */
h1, h2, h3, p { ... }

/* 5. Components */
.nav, .card, .form, .button { ... }

/* 6. Utilities */
.mt-4, .text-center, .hidden { ... }

/* 7. Responsive */
@media (max-width: 768px) { ... }
@media (min-width: 768px) { ... }

/* 8. Animations */
@keyframes fadeIn { ... }
```

## Usage

### Including in HTML

```html
<link rel="stylesheet" href="/index.directory/assets/css/main.css">
```

### Customizing Colors

Edit the CSS variables in `main.css`:

```css
:root {
  --accent-green: #00ff88;  /* Change profit color */
  --accent-red: #ff4757;    /* Change loss color */
  --bg-primary: #0a0e27;    /* Change background */
}
```

### Adding Custom Styles

Add new styles to `main.css` following the existing structure:

```css
/* New Component */
.my-component {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .my-component {
    padding: 0.5rem;
  }
}
```

## Design System

### Spacing Scale
Based on 4px increments:
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.2);
```

### Z-Index Scale
```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 1000;
--z-tooltip: 2000;
```

## Mobile Optimization

### Touch Targets
Minimum 44px × 44px for all interactive elements:
```css
.button, .nav-link, input {
  min-height: 44px;
  min-width: 44px;
}
```

### Viewport Meta
Required in HTML:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Font Sizes
Optimized for mobile readability:
```css
/* iPhone SE */
@media (max-width: 375px) {
  html { font-size: 13px; }
}

/* iPhone 14 */
@media (min-width: 390px) and (max-width: 430px) {
  html { font-size: 15px; }
}
```

## Performance

### Optimization
- No external dependencies (except fonts)
- Minimal use of animations
- Efficient selectors
- No unused styles
- Compressed for production

### File Size
- Original: ~14KB
- Minified: ~10KB (estimated)
- Gzipped: ~3KB (estimated)

### Load Time
- First paint: < 100ms
- Interactive: < 200ms
- Font load: 200-400ms (Google Fonts)

## Browser Support

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Mobile
- ✅ Samsung Internet

### CSS Features Used
- CSS Variables (custom properties)
- Flexbox
- CSS Grid
- Animations/Transitions
- Media queries
- calc()
- rgba()

### Fallbacks
Graceful degradation for older browsers:
```css
/* Fallback for no CSS variables support */
background: #0a0e27;
background: var(--bg-primary, #0a0e27);
```

## Maintenance

### Adding Styles
1. Identify component or utility needed
2. Add to appropriate section
3. Follow naming conventions
4. Test on mobile and desktop
5. Document in this README if significant

### Naming Conventions
- Use kebab-case: `.trade-card`
- BEM-style for components: `.card__header--active`
- Utility classes: `.mt-4` (margin-top 4 units)
- State classes: `.is-active`, `.has-error`

### Best Practices
- Mobile-first responsive design
- Use CSS variables for theming
- Keep specificity low
- Avoid !important
- Use semantic class names
- Group related styles
- Comment complex sections
- Test across devices

## Related Files

- [JavaScript](../js/README.md) - Client-side functionality
- [Icons](../icons/README.md) - App icons
- [Main Stylesheet Guide](../../../.github/docs/README-DEV.md) - Customization guide

## External Dependencies

### Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CDN (Optional)
Tailwind CSS CDN used for additional utilities:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

## Troubleshooting

### Styles Not Applying
1. Check file path in HTML
2. Clear browser cache
3. Verify CSS file loads (Network tab)
4. Check for syntax errors
5. Verify selector specificity

### Mobile Issues
1. Check viewport meta tag
2. Test on actual device
3. Use browser dev tools mobile view
4. Verify media query breakpoints
5. Check touch target sizes

### Color Issues
1. Verify CSS variables are defined
2. Check fallback colors
3. Test in light/dark mode
4. Verify contrast ratios
5. Use browser color picker

---

**Last Updated:** October 2025  
**File Count:** 1  
**Purpose:** Visual styling and responsive design
