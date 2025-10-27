# Chat Components

This directory contains reusable, portable chat components for the SFTi-Pennies application.

## 📁 Contents

### `chat-tailwind.html`

A self-contained Tailwind-based chat component designed for mobile-first usage with proper keyboard handling.

**Features:**
- 🎨 Built entirely with Tailwind utility classes (no custom CSS required)
- 📱 Mobile keyboard support (input moves up, header stays fixed)
- 📜 Independently scrollable messages container
- 🔧 Portable - can be integrated into any page
- ♿ Accessible with proper ARIA labels

**Structure:**
```
#chat-root          → Root container (fixed, full screen)
├─ #chat-header     → Fixed header at top
├─ #chat-messages   → Scrollable messages container
└─ #chat-input      → Input area (moves with keyboard)
   └─ #chat-input-field → Textarea for user input
```

**Usage:**
1. Include Tailwind CSS in your page
2. Copy the component HTML where needed
3. Include `mobile-keyboard-tailwind.js`
4. The script will auto-initialize

**Example Integration:**
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <!-- Paste chat-tailwind.html content here -->
  
  <script src="/assets/js/mobile-keyboard-tailwind.js"></script>
</body>
</html>
```

## 📖 Documentation

See [`docs/CHAT_TAILWIND_INTEGRATION.md`](../docs/CHAT_TAILWIND_INTEGRATION.md) for:
- Detailed integration steps
- Customization guide
- Mobile testing procedures (iOS Safari, Android Chrome)
- Troubleshooting tips

## 🎯 Demo

View a working example at [`index.directory/chat-tailwind-example.html`](../index.directory/chat-tailwind-example.html)

This demo includes:
- Complete chat layout
- Basic send/receive functionality
- Mobile keyboard handling
- Auto-scrolling and textarea resize

## 🔄 Comparison with Existing Chat

| Feature | Current (`copilot-page.css`) | New Component (`chat-tailwind.html`) |
|---------|------------------------------|--------------------------------------|
| CSS Approach | Custom CSS classes | Tailwind utility classes |
| Dependencies | main.css, glass-effects.css, copilot-page.css | Tailwind CSS only |
| Keyboard Handling | Global CSS variables | Inline styles (component-isolated) |
| Portability | Tied to specific page | Self-contained, reusable |
| Mobile Support | Good | Enhanced with iOS fixes |

## 🚀 Next Steps

1. **Test**: Open `index.directory/chat-tailwind-example.html` on mobile devices
2. **Integrate**: Use the component in your chat pages
3. **Customize**: Adjust Tailwind classes to match your brand
4. **Enhance**: Add real chat functionality (WebSocket, API, etc.)

## 🤝 Contributing

When adding new components:
1. Follow the same pattern (self-contained, Tailwind-based)
2. Include proper documentation
3. Add a working example
4. Test on mobile devices

---

**Last Updated:** 2025-10-27  
**Component Version:** 1.0.0
