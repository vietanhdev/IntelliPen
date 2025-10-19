# IntelliPen Extension Icons

This directory contains the extension icons in the required sizes for Chrome extensions:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon32.png` - 32x32 pixels (Windows computers often use this size)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store and installation)
- `icon.svg` - Source SVG file for all icon sizes

## Icon Design

The IntelliPen icon features:
- **Pen symbol** - Represents writing and editing capabilities
- **Purple gradient** - Brand colors (#667eea to #764ba2) for the pen
- **AI sparkles** - Golden sparkles indicating AI-powered intelligence
- **Writing lines** - Subtle curved lines suggesting text and writing
- **Flat design** - Modern, clean aesthetic that scales well

## Regenerating Icons

To regenerate PNG icons from the SVG source:

```bash
npm run generate-icons
```

This script uses the `sharp` library to convert `icon.svg` to all required PNG sizes with optimal quality.

## Design Guidelines

The IntelliPen icons:
- Use flat colors for clarity at all sizes
- Maintain consistent branding with the purple gradient theme
- Include AI indicators (sparkles) to communicate intelligent features
- Follow Chrome extension icon best practices
- Ensure good contrast and readability at small sizes (16x16)

## Customization

To modify the icon design:
1. Edit `icon.svg` with any SVG editor
2. Run `npm run generate-icons` to regenerate all PNG sizes
3. Test the icons at all sizes, especially 16x16 for toolbar visibility