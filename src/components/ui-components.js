/**
 * IntelliPen UI Components
 * Reusable UI components with consistent styling and icons
 */

import { createIcon } from '../icons/icon-library.js';

/**
 * Create a button with icon
 */
export function createButton(options = {}) {
  const {
    text = '',
    icon = null,
    variant = 'primary', // primary, secondary, ghost, danger
    size = 'md', // sm, md, lg
    onClick = null,
    disabled = false,
    className = '',
  } = options;

  const button = document.createElement('button');
  button.className = `intellipen-btn intellipen-btn-${variant} intellipen-btn-${size} ${className}`;
  button.disabled = disabled;

  if (icon) {
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
    button.appendChild(createIcon(icon, { size: iconSize }));
  }

  if (text) {
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    button.appendChild(textSpan);
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Create a menu item
 */
export function createMenuItem(options = {}) {
  const {
    text = '',
    icon = null,
    onClick = null,
    disabled = false,
    className = '',
  } = options;

  const item = document.createElement('div');
  item.className = `intellipen-menu-item ${disabled ? 'disabled' : ''} ${className}`;

  if (icon) {
    const iconEl = createIcon(icon, { size: 18, className: 'intellipen-menu-icon' });
    item.appendChild(iconEl);
  }

  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  item.appendChild(textSpan);

  if (onClick && !disabled) {
    item.addEventListener('click', onClick);
  }

  return item;
}

/**
 * Create a context menu
 */
export function createContextMenu(items = [], position = { x: 0, y: 0 }) {
  const menu = document.createElement('div');
  menu.className = 'intellipen-context-menu';
  menu.style.left = `${position.x}px`;
  menu.style.top = `${position.y}px`;

  items.forEach(item => {
    if (item.separator) {
      const separator = document.createElement('div');
      separator.className = 'intellipen-menu-separator';
      menu.appendChild(separator);
    } else {
      menu.appendChild(createMenuItem(item));
    }
  });

  // Close menu when clicking outside
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };

  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 0);

  return menu;
}

/**
 * Create a Material Design 3 toast notification (snackbar)
 */
export function createToast(options = {}) {
  const {
    message = '',
    title = '',
    type = 'info', // info, success, warning, error
    duration = 4000,
    icon = null,
    action = null, // { text: 'Action', onClick: () => {} }
    dismissible = true,
  } = options;

  // Get or create toast container
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  // Add icon
  const iconName = icon || {
    info: 'info',
    success: 'check',
    warning: 'warning',
    error: 'close',
  }[type];

  const iconEl = document.createElement('div');
  iconEl.className = 'toast-icon';
  iconEl.appendChild(createIcon(iconName, { size: 20 }));
  toast.appendChild(iconEl);

  // Add content
  const content = document.createElement('div');
  content.className = 'toast-content';

  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;
    content.appendChild(titleEl);
  }

  if (message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    content.appendChild(messageEl);
  }

  toast.appendChild(content);

  // Add action button if provided
  if (action) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'toast-action';
    actionBtn.textContent = action.text || 'Action';
    actionBtn.addEventListener('click', () => {
      if (action.onClick) action.onClick();
      dismissToast(toast);
    });
    toast.appendChild(actionBtn);
  }

  // Add close button if dismissible
  if (dismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.appendChild(createIcon('close', { size: 18 }));
    closeBtn.addEventListener('click', () => dismissToast(toast));
    toast.appendChild(closeBtn);
  }

  // Add progress bar for auto-dismiss
  if (duration > 0) {
    const progress = document.createElement('div');
    progress.className = 'toast-progress';
    progress.style.animationDuration = `${duration}ms`;
    toast.appendChild(progress);
  }

  // Add to container
  container.appendChild(toast);

  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(toast);
    }, duration);
  }

  return toast;
}

/**
 * Dismiss a toast with animation
 */
function dismissToast(toast) {
  if (!toast || toast.classList.contains('dismissing')) return;
  
  toast.classList.add('dismissing');
  toast.addEventListener('animationend', () => {
    toast.remove();
    
    // Remove container if empty
    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, { once: true });
}

/**
 * Show a success toast
 */
export function showSuccessToast(message, options = {}) {
  return createToast({
    message,
    type: 'success',
    ...options,
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(message, options = {}) {
  return createToast({
    message,
    type: 'error',
    duration: 5000, // Errors stay longer
    ...options,
  });
}

/**
 * Show a warning toast
 */
export function showWarningToast(message, options = {}) {
  return createToast({
    message,
    type: 'warning',
    ...options,
  });
}

/**
 * Show an info toast
 */
export function showInfoToast(message, options = {}) {
  return createToast({
    message,
    type: 'info',
    ...options,
  });
}

/**
 * Create a badge
 */
export function createBadge(options = {}) {
  const {
    text = '',
    variant = 'default', // default, primary, success, warning, error
    icon = null,
    className = '',
  } = options;

  const badge = document.createElement('span');
  badge.className = `intellipen-badge intellipen-badge-${variant} ${className}`;

  if (icon) {
    badge.appendChild(createIcon(icon, { size: 12 }));
  }

  if (text) {
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    badge.appendChild(textSpan);
  }

  return badge;
}

/**
 * Create a loading spinner
 */
export function createSpinner(options = {}) {
  const {
    size = 20,
    className = '',
  } = options;

  const spinner = createIcon('sparkle', { 
    size, 
    className: `intellipen-icon-spin ${className}` 
  });

  return spinner;
}

/**
 * Create a card
 */
export function createCard(options = {}) {
  const {
    title = '',
    icon = null,
    content = '',
    actions = [],
    className = '',
  } = options;

  const card = document.createElement('div');
  card.className = `intellipen-card ${className}`;

  if (title || icon) {
    const header = document.createElement('div');
    header.className = 'intellipen-card-header';

    if (icon) {
      header.appendChild(createIcon(icon, { size: 20, className: 'intellipen-icon-primary' }));
    }

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      header.appendChild(titleEl);
    }

    card.appendChild(header);
  }

  if (content) {
    const body = document.createElement('div');
    body.className = 'intellipen-card-body';
    if (typeof content === 'string') {
      body.textContent = content;
    } else {
      body.appendChild(content);
    }
    card.appendChild(body);
  }

  if (actions.length > 0) {
    const footer = document.createElement('div');
    footer.className = 'intellipen-card-footer';
    actions.forEach(action => {
      footer.appendChild(createButton(action));
    });
    card.appendChild(footer);
  }

  return card;
}

/**
 * Create a toggle switch
 */
export function createToggle(options = {}) {
  const {
    checked = false,
    onChange = null,
    disabled = false,
    className = '',
  } = options;

  const wrapper = document.createElement('label');
  wrapper.className = `intellipen-toggle ${disabled ? 'disabled' : ''} ${className}`;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.disabled = disabled;

  if (onChange) {
    input.addEventListener('change', (e) => onChange(e.target.checked));
  }

  const slider = document.createElement('span');
  slider.className = 'intellipen-toggle-slider';

  wrapper.appendChild(input);
  wrapper.appendChild(slider);

  return wrapper;
}
