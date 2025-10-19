# IntelliPen Icon System

A comprehensive, consistent icon library for the IntelliPen extension using inline SVG icons.

## Design System

All icons follow a unified design language with these principles:

### Core Standards
- **ViewBox**: `0 0 24 24` (consistent across all icons)
- **Stroke Width**: `2px` (primary elements), `1.5px` (secondary details)
- **Stroke Linecap**: `round` (smooth edges)
- **Stroke Linejoin**: `round` (smooth corners)
- **Fill**: `currentColor` (for solid shapes)
- **Opacity**: `0.5` (for secondary/decorative elements)
- **Padding**: 2-3px from viewBox edges for visual balance

### Design Principles
- **Geometric Consistency**: Icons use consistent spacing and proportions
- **Optical Balance**: Visual weight is balanced within the 24x24 grid
- **Scalability**: Icons remain clear at 14px-32px sizes
- **Simplicity**: Minimal paths for better performance and clarity

## Features

- **Consistent Design**: All icons follow the same visual language
- **Lightweight**: Inline SVG, no external dependencies
- **Customizable**: Easy to change size, color, and styling
- **Accessible**: Proper semantic markup
- **Modern**: Clean, minimal design that scales perfectly

## Usage

### Import the Icon Library

```javascript
import { createIcon, getIconHTML, icons } from '../src/icons/icon-library.js';
```

### Create an Icon Element

```javascript
// Basic usage
const icon = createIcon('pen');

// With options
const icon = createIcon('sparkle', {
  size: 24,
  color: '#667eea',
  className: 'my-custom-class'
});

// Append to DOM
document.body.appendChild(icon);
```

### Get Icon as HTML String

```javascript
const html = getIconHTML('grammar', {
  size: 20,
  className: 'intellipen-icon-primary'
});

element.innerHTML = html;
```

## Available Icons

### Core Icons
- `pen` - Main app icon, writing
- `sparkle` - AI features, magic
- `grammar` - Grammar checking
- `rewrite` - Text rewriting
- `translate` - Translation
- `summarize` - Summarization

### UI Icons
- `settings` - Settings/configuration
- `close` - Close/dismiss
- `check` - Success/confirmation
- `copy` - Copy to clipboard
- `more` - More options menu
- `info` - Information
- `warning` - Warning/alert
- `download` - Download/sync

### Feature Icons
- `microphone` - Meeting/audio recording
- `lock` - Privacy/security
- `toneCasual` - Casual tone
- `toneFormal` - Formal tone
- `lengthShort` - Short length
- `lengthLong` - Long length

## Icon Styling

### Size Classes
```html
<span class="intellipen-icon intellipen-icon-xs">...</span>  <!-- 14px -->
<span class="intellipen-icon intellipen-icon-sm">...</span>  <!-- 16px -->
<span class="intellipen-icon intellipen-icon-md">...</span>  <!-- 20px -->
<span class="intellipen-icon intellipen-icon-lg">...</span>  <!-- 24px -->
<span class="intellipen-icon intellipen-icon-xl">...</span>  <!-- 32px -->
```

### Color Classes
```html
<span class="intellipen-icon intellipen-icon-primary">...</span>    <!-- Purple -->
<span class="intellipen-icon intellipen-icon-secondary">...</span>  <!-- Dark purple -->
<span class="intellipen-icon intellipen-icon-success">...</span>    <!-- Green -->
<span class="intellipen-icon intellipen-icon-warning">...</span>    <!-- Orange -->
<span class="intellipen-icon intellipen-icon-error">...</span>      <!-- Red -->
<span class="intellipen-icon intellipen-icon-muted">...</span>      <!-- Gray -->
```

### Interactive Icons
```html
<!-- Clickable icon button -->
<span class="intellipen-icon intellipen-icon-button">...</span>

<!-- Spinning animation -->
<span class="intellipen-icon intellipen-icon-spin">...</span>

<!-- Pulsing animation -->
<span class="intellipen-icon intellipen-icon-pulse">...</span>

<!-- With badge indicator -->
<span class="intellipen-icon intellipen-icon-badge">...</span>
```

### Gradient Icon
```html
<span class="intellipen-icon intellipen-icon-gradient">...</span>
```

## Adding New Icons

Follow these steps to maintain design consistency:

### 1. Create the SVG Structure

```javascript
export const icons = {
  // ... existing icons
  
  myNewIcon: `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Primary elements: stroke-width="2" -->
      <path d="..." stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Secondary elements: stroke-width="1.5" or opacity="0.5" -->
      <path d="..." stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      
      <!-- Solid shapes: fill="currentColor" -->
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  `,
};
```

### 2. Design Checklist

- [ ] ViewBox is `0 0 24 24`
- [ ] Primary strokes use `stroke-width="2"`
- [ ] All strokes have `stroke-linecap="round"` and `stroke-linejoin="round"`
- [ ] Colors use `currentColor` (never hardcoded colors except for special cases)
- [ ] Icon has 2-3px padding from viewBox edges
- [ ] Secondary elements use `opacity="0.5"` or `stroke-width="1.5"`
- [ ] Tested at 16px, 20px, and 24px sizes
- [ ] Visually balanced and centered

### 3. Special Cases

**Icons with checkmarks or badges** (like grammar icon):
```svg
<!-- Use CSS variable for inner color with fallback -->
<path stroke="var(--icon-check-color, #fff)" stroke-width="2"/>
```

**Icons with decorative elements**:
```svg
<!-- Use opacity for visual hierarchy -->
<path stroke="currentColor" stroke-width="2" opacity="0.5"/>
```

## Design Guidelines

### Visual Consistency
- **Stroke Weight**: Primary elements (2px), secondary details (1.5px)
- **Corner Radius**: Use `rx` attribute for rounded rectangles (typically 2-3px)
- **Spacing**: Maintain consistent gaps between elements (typically 2-4px)
- **Alignment**: Center icons optically, not just mathematically

### Color Usage
- **Dynamic Theming**: Always use `currentColor` for fills and strokes
- **CSS Variables**: Use for special cases like `var(--icon-check-color, #fff)`
- **Opacity**: Use `0.5` for secondary elements instead of lighter colors
- **Class-based Colors**: Apply colors via CSS classes (`.intellipen-icon-primary`, etc.)

### Accessibility
- Icons should be supplemented with text labels or `aria-label`
- Ensure sufficient color contrast (4.5:1 minimum)
- Test with screen readers
- Provide alternative text for icon-only buttons

## Examples

### Button with Icon
```javascript
import { createButton } from '../components/ui-components.js';

const button = createButton({
  text: 'Check Grammar',
  icon: 'grammar',
  variant: 'primary'
});
```

### Menu Item with Icon
```javascript
import { createMenuItem } from '../components/ui-components.js';

const menuItem = createMenuItem({
  text: 'Translate',
  icon: 'translate',
  onClick: () => console.log('Translate clicked')
});
```

### Status Indicator
```javascript
const statusIcon = createIcon('check', {
  size: 16,
  className: 'intellipen-icon-success'
});
```

## Preview

Open `docs/icon-showcase.html` in your browser to see all icons and components in action.
