# Chrome Web Store Promotional Images

This directory contains all the promotional images required for the Chrome Web Store listing.

## Generated Images

### Screenshots (1280x800)
Required format: 1280x800 or 640x400, JPEG or 24-bit PNG (no alpha)

- `editor-1280x800.png` - IntelliPen Editor interface
- `meeting-1280x800.png` - Meeting Dashboard with transcription
- `translator-1280x800.png` - Translator interface

### Alternative Screenshots (640x400)
- `editor-640x400.png` - IntelliPen Editor interface (smaller)
- `meeting-640x400.png` - Meeting Dashboard (smaller)
- `translator-640x400.png` - Translator interface (smaller)

### Small Promo Tile (440x280)
Required format: 440x280, JPEG or 24-bit PNG (no alpha)

- `small-promo-440x280.png` - Promotional tile with IntelliPen branding

### Marquee Promo Tile (1400x560)
Required format: 1400x560, JPEG or 24-bit PNG (no alpha)

- `marquee-promo-1400x560.png` - Large promotional banner with three screenshots

## Technical Details

All images are:
- 24-bit PNG format (RGB, no alpha channel)
- White background padding (no cropping)
- Optimized for Chrome Web Store requirements

## Regenerating Images

To regenerate all promotional images:

```bash
npm run generate-store-images
```

This will process the source screenshots from `docs/screenshots/` and create all required promotional images with proper dimensions and formatting.
