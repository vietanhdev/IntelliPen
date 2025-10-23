# Theme System

IntelliPen now supports dark mode, light mode, and automatic theme switching based on system preferences.

## Features

- **Three Theme Modes**:
  - **Auto**: Follows system preference (default)
  - **Light**: Always use light theme
  - **Dark**: Always use dark theme

- **Persistent**: Theme preference is saved in Chrome storage and synced across all extension pages
- **Smooth Transitions**: Theme changes animate smoothly with icon transitions
- **System Integration**: Respects `prefers-color-scheme` media query when in auto mode

## Usage

### Toggle Theme

Click the sun/moon icon button in:
- **Popup menu**: Footer area (bottom right)
- **Sidepanel**: Header area (top right)

The theme cycles through: Auto → Light → Dark → Auto

### Theme Variables

All colors are defined using CSS custom properties in `styles/design-system.css`:

**Light Mode** (default):
- Surface colors: White to light gray
- Text colors: Dark gray to black
- Primary colors: Chrome blue palette

**Dark Mode**:
- Surface colors: Black to dark gray
- Text colors: Light gray to white
- Primary colors: Lighter blue shades for better contrast

### Implementation Details

#### CSS Structure

```css
/* Default light mode */
:root {
  --surface-1: #ffffff;
  --color-neutral-900: #202124;
  /* ... */
}

/* Explicit dark mode */
[data-theme="dark"] {
  --surface-1: #1a1a1a;
  --color-neutral-900: #f5f5f5;
  /* ... */
}

/* Auto dark mode (system preference) */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Same as explicit dark mode */
  }
}
```

#### JavaScript API

```javascript
// Load saved theme
await loadTheme();

// Apply theme
applyTheme('dark'); // 'light', 'dark', or 'auto'

// Toggle theme
await toggleTheme();
```

#### Storage

Theme preference is stored in Chrome local storage:
```javascript
chrome.storage.local.set({ theme: 'dark' });
```

#### Message Passing

Theme changes are broadcast to all extension pages:
```javascript
chrome.runtime.sendMessage({ 
  type: 'themeChanged', 
  theme: 'dark' 
});
```

## Design Tokens

### Surface Colors
- `--surface-1` to `--surface-5`: Background layers
- Light mode: #ffffff → #dadce0
- Dark mode: #1a1a1a → #5a5a5a

### Text Colors
- `--color-neutral-0` to `--color-neutral-900`: Text hierarchy
- Light mode: #ffffff → #202124
- Dark mode: #000000 → #f5f5f5

### Semantic Colors
- Success, Warning, Error, Info colors
- Adjusted for both light and dark backgrounds
- Maintains WCAG AA contrast ratios

### Elevation Shadows
- `--elevation-1` to `--elevation-5`: Material Design shadows
- Dark mode uses stronger shadows for better depth perception

## Browser Support

- Chrome 138+ (required for Chrome AI APIs)
- Supports `prefers-color-scheme` media query
- CSS custom properties (CSS variables)
- `data-theme` attribute for explicit theme control

## Accessibility

- Maintains WCAG AA contrast ratios in both themes
- Smooth transitions don't trigger motion sensitivity
- System preference respected by default
- Clear visual feedback for theme toggle button
