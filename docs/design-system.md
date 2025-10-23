# IntelliPen Design System

## Overview

IntelliPen uses a modern, Chrome-inspired design system based on Material Design 3 principles. This document outlines the design tokens, components, and patterns used throughout the extension.

## Design Philosophy

- **Chrome-Native**: Follows Google Chrome's design language for seamless integration
- **Material Design 3**: Implements the latest Material Design principles
- **Accessibility First**: WCAG 2.1 AA compliant with proper contrast ratios
- **Performance**: Optimized animations and transitions
- **Consistency**: Unified design tokens across all components

## Design Tokens

### Color Palette

#### Primary Colors (Chrome Blue)
```css
--color-primary-50: #e8f0fe;   /* Lightest */
--color-primary-600: #4285f4;  /* Main brand color */
--color-primary-700: #1967d2;  /* Hover states */
```

#### Neutral Colors (Chrome Gray Scale)
```css
--color-neutral-0: #ffffff;    /* Pure white */
--color-neutral-50: #f8f9fa;   /* Backgrounds */
--color-neutral-200: #e8eaed;  /* Borders */
--color-neutral-700: #5f6368;  /* Body text */
--color-neutral-900: #202124;  /* Headings */
```

#### Semantic Colors
```css
--color-success: #1e8e3e;      /* Success states */
--color-warning: #f9ab00;      /* Warning states */
--color-error: #d93025;        /* Error states */
--color-info: #1967d2;         /* Info states */
```

### Typography

#### Font Family
```css
--font-family: 'Google Sans', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
--font-family-mono: 'Google Sans Mono', 'Roboto Mono', 'Courier New', monospace;
```

#### Font Sizes
```css
--text-xs: 11px;    /* Small labels */
--text-sm: 12px;    /* Secondary text */
--text-base: 13px;  /* Body text */
--text-md: 14px;    /* Primary text */
--text-lg: 16px;    /* Subheadings */
--text-xl: 18px;    /* Headings */
```

#### Font Weights
```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale

Based on 4px increments:
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### Border Radius
```css
--radius-sm: 4px;    /* Small elements */
--radius-md: 8px;    /* Cards, inputs */
--radius-lg: 12px;   /* Large cards */
--radius-full: 9999px; /* Pills, buttons */
```

### Elevation (Shadows)

Chrome-style shadows for depth:
```css
--elevation-1: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
--elevation-2: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 2px 6px 2px rgba(60, 64, 67, 0.15);
--elevation-3: 0 4px 8px 3px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.3);
```

### Transitions
```css
--transition-fast: 100ms cubic-bezier(0.4, 0.0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0.0, 0.2, 1);
```

## Components

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">
  Primary Action
</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">
  Secondary Action
</button>
```

#### Text Button
```html
<button class="btn btn-text">
  Text Action
</button>
```

#### Icon Button
```html
<button class="btn-icon">
  <svg>...</svg>
</button>
```

### Inputs

#### Text Input
```html
<input type="text" class="input" placeholder="Enter text...">
```

#### Select
```html
<select class="select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Textarea
```html
<textarea class="textarea" placeholder="Enter text..."></textarea>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn btn-text">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>
```

### Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

### Toast Notifications

```html
<div class="toast success">
  <span class="toast-icon">✓</span>
  <div class="toast-content">
    <div class="toast-title">Success</div>
    <div class="toast-message">Your changes have been saved.</div>
  </div>
</div>
```

## Icons

IntelliPen uses a custom icon library based on Material Symbols. All icons follow these principles:

- **ViewBox**: 0 0 24 24 (consistent)
- **Stroke Width**: 2px (primary), 1.5px (secondary)
- **Stroke Linecap**: round
- **Stroke Linejoin**: round
- **Fill**: currentColor (inherits text color)

### Using Icons

```javascript
import { createIcon, getIconHTML } from './src/icons/icon-library.js';

// Create icon element
const icon = createIcon('pen', { size: 20, color: '#4285f4' });

// Get icon HTML
const html = getIconHTML('sparkle', { size: 24 });
```

### Available Icons

- `pen` - Edit/Write
- `sparkle` - AI/Magic
- `grammar` - Grammar check
- `rewrite` - Improve writing
- `translate` - Translation
- `summarize` - Summarization
- `microphone` - Recording
- `speaker` - Audio output
- `document` - File
- `folder` - Folder
- `save` - Save
- `delete` - Delete
- `copy` - Copy
- `check` - Success
- `close` - Close
- `settings` - Settings
- `info` - Information
- `warning` - Warning
- `lock` - Privacy
- `language` - Language
- `refresh` - Refresh
- `export` - Export
- `play` - Play
- `stop` - Stop
- `record` - Record
- `undo` - Undo
- `redo` - Redo
- `menu` - Menu
- `search` - Search
- `sidebar` - Sidebar
- `tab` - Tab

## Layout Patterns

### Popup Menu

```html
<div class="menu-container">
  <div class="menu-header">
    <!-- Logo and branding -->
  </div>
  <div class="menu-items">
    <!-- Menu items -->
  </div>
  <div class="menu-footer">
    <!-- Status and settings -->
  </div>
</div>
```

### Sidepanel

```html
<div class="sidepanel-container">
  <header class="sidepanel-header">
    <!-- Title and controls -->
  </header>
  <nav class="navigation-tabs">
    <!-- Tab navigation -->
  </nav>
  <div class="screen">
    <!-- Screen content -->
  </div>
</div>
```

### Toolbar

```html
<div class="toolbar">
  <div class="toolbar-group">
    <button class="toolbar-btn">...</button>
    <button class="toolbar-btn">...</button>
  </div>
  <div class="toolbar-divider"></div>
  <div class="toolbar-group">
    <button class="toolbar-btn">...</button>
  </div>
</div>
```

## Utility Classes

### Display
```css
.flex, .inline-flex, .grid, .hidden
```

### Flexbox
```css
.items-center, .items-start, .items-end
.justify-center, .justify-between, .justify-end
.flex-col, .flex-wrap, .flex-1
```

### Spacing
```css
.gap-1, .gap-2, .gap-3, .gap-4
```

### Typography
```css
.text-xs, .text-sm, .text-base, .text-md, .text-lg
.font-medium, .font-semibold, .font-bold
.text-primary, .text-secondary, .text-muted
```

### Border Radius
```css
.rounded-sm, .rounded-md, .rounded-lg, .rounded-full
```

### Shadows
```css
.shadow-1, .shadow-2, .shadow-3
```

## Animations

### Predefined Animations

```css
.animate-fadeIn    /* Fade in */
.animate-slideUp   /* Slide up */
.animate-slideDown /* Slide down */
.animate-scaleIn   /* Scale in */
```

### Custom Animations

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Accessibility

### Focus States

All interactive elements have visible focus indicators:
```css
.btn:focus-visible {
  outline: 2px solid var(--color-primary-600);
  outline-offset: 2px;
}
```

### Color Contrast

All text meets WCAG 2.1 AA standards:
- Body text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation

All components support keyboard navigation:
- Tab: Navigate between elements
- Enter/Space: Activate buttons
- Escape: Close modals/dialogs
- Arrow keys: Navigate lists/menus

## Best Practices

### Do's
✓ Use design tokens for consistency
✓ Follow spacing scale (4px increments)
✓ Use semantic color names
✓ Implement proper focus states
✓ Test with keyboard navigation
✓ Ensure proper color contrast

### Don'ts
✗ Don't use arbitrary values
✗ Don't skip focus indicators
✗ Don't use low-contrast colors
✗ Don't create custom animations without purpose
✗ Don't ignore accessibility guidelines

## Migration Guide

### From Old to New Design System

1. **Update CSS imports**:
   ```html
   <!-- Old -->
   <link rel="stylesheet" href="menu.css">
   
   <!-- New -->
   <link rel="stylesheet" href="menu-modern.css">
   ```

2. **Update class names**:
   ```html
   <!-- Old -->
   <button class="intellipen-btn intellipen-btn-primary">
   
   <!-- New -->
   <button class="btn btn-primary">
   ```

3. **Use design tokens**:
   ```css
   /* Old */
   color: #667eea;
   
   /* New */
   color: var(--color-primary-600);
   ```

4. **Update icons**:
   ```javascript
   // Old
   <span>✨</span>
   
   // New
   import { createIcon } from './src/icons/icon-library.js';
   const icon = createIcon('sparkle');
   ```

## Resources

- [Material Design 3](https://m3.material.io/)
- [Chrome UI Guidelines](https://www.chromium.org/developers/design-documents/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Chrome Extension Best Practices](https://developer.chrome.com/docs/extensions/mv3/user_interface/)
