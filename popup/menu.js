/**
 * IntelliPen Icon Menu
 * Handles the popup menu when clicking the extension icon
 */

// Theme management
async function loadTheme() {
  try {
    const result = await chrome.storage.local.get(['theme']);
    const theme = result.theme || 'auto';
    applyTheme(theme);
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    // Auto mode - remove attribute to use system preference
    root.removeAttribute('data-theme');
  }
}

async function toggleTheme() {
  try {
    const result = await chrome.storage.local.get(['theme']);
    const currentTheme = result.theme || 'auto';
    
    // Cycle through: auto -> light -> dark -> auto
    let newTheme;
    if (currentTheme === 'auto') {
      newTheme = 'light';
    } else if (currentTheme === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'auto';
    }
    
    await chrome.storage.local.set({ theme: newTheme });
    applyTheme(newTheme);
    
    // Notify other pages about theme change
    chrome.runtime.sendMessage({ type: 'themeChanged', theme: newTheme });
    
    console.log('Theme changed to:', newTheme);
  } catch (error) {
    console.error('Failed to toggle theme:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const openSidebarBtn = document.getElementById('openSidebar');
  const openTabBtn = document.getElementById('openTab');
  const themeToggleBtn = document.getElementById('themeToggle');

  // Load theme on startup
  loadTheme();

  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Open in Sidebar
  openSidebarBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab?.id) {
        await chrome.sidePanel.open({ tabId: tab.id });
        console.log('IntelliPen: Sidebar opened');
      }
      
      // Close the popup
      window.close();
    } catch (error) {
      console.error('IntelliPen: Failed to open sidebar:', error);
      
      // Fallback: open as new tab if sidebar fails
      try {
        await chrome.tabs.create({
          url: chrome.runtime.getURL('sidepanel/index.html')
        });
        window.close();
      } catch (fallbackError) {
        console.error('IntelliPen: Failed to open as tab:', fallbackError);
      }
    }
  });

  // Open in a Tab
  openTabBtn.addEventListener('click', async () => {
    try {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('sidepanel/index.html')
      });
      
      console.log('IntelliPen: Opened in new tab');
      
      // Close the popup
      window.close();
    } catch (error) {
      console.error('IntelliPen: Failed to open in tab:', error);
    }
  });
});
