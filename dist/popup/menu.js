/**
 * IntelliPen Icon Menu
 * Handles the popup menu when clicking the extension icon
 */

document.addEventListener('DOMContentLoaded', () => {
  const openSidebarBtn = document.getElementById('openSidebar');
  const openTabBtn = document.getElementById('openTab');

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
