// Background service worker for URL Tracker

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'URL_CHANGE' && sender.tab) {
    const tabId = sender.tab.id;

    const entry = {
      url: message.url,
      timestamp: message.timestamp,
      elapsedMs: message.elapsedMs
    };

    // Get existing tab history
    chrome.storage.local.get(['tabHistory'], function(result) {
      const tabHistory = result.tabHistory || {};

      // Initialize array for this tab if it doesn't exist
      if (!tabHistory[tabId]) {
        tabHistory[tabId] = [];
      }

      // Add the new URL entry to this tab's history
      tabHistory[tabId].push(entry);

      // Save back to storage
      chrome.storage.local.set({ tabHistory: tabHistory });
    });
  }
});

// Clean up when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(['tabHistory'], function(result) {
    const tabHistory = result.tabHistory || {};

    // Remove the closed tab's history
    delete tabHistory[tabId];

    chrome.storage.local.set({ tabHistory: tabHistory });
  });
});
