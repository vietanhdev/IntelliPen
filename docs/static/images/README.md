# IntelliPen Logo and Icons

This directory contains the IntelliPen branding assets used throughout the documentation site.

## Files

- **logo.svg**: Main logo used in navbar and footer (128x128)
- **icon.svg**: Alternative icon reference
- **icon16.png**: Favicon 16x16
- **icon32.png**: Favicon 32x32
- **icon48.png**: Medium icon 48x48
- **icon128.png**: Large icon and Apple touch icon 128x128

## Logo Design

The IntelliPen logo features:
- **Gradient background**: Purple gradient (#667eea to #764ba2)
- **Modern pen icon**: Simplified geometric pen with rounded edges
- **AI sparkle**: Golden star burst indicating AI capabilities
- **Writing line**: Subtle curved line suggesting writing motion

## Usage in Hugo

The logo is configured in `hugo.toml`:

```toml
[params.logos]
navbar = "/images/logo.svg"
footer = "/images/logo.svg"

[params.favicons]
icon16 = "/images/icon16.png"
icon32 = "/images/icon32.png"
```

## Brand Colors

- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Deep Purple)
- **Accent**: #60a5fa (Blue)
- **Sparkle**: #fbbf24 (Golden)

These colors are defined in `assets/scss/_custom.scss` and used throughout the site.

## Source

Original SVG source: `../../images/icon.svg` (project root)
