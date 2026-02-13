// URL Tracker Content Script
let currentUrl = window.location.href;
let lastTimestamp = Date.now();

// Function to save URL change
function trackUrlChange(newUrl) {
  const now = Date.now();
  const elapsed = now - lastTimestamp;

  // Send to background script which has access to tab ID
  chrome.runtime.sendMessage({
    type: 'URL_CHANGE',
    url: newUrl,
    timestamp: now,
    elapsedMs: elapsed
  });

  lastTimestamp = now;
  currentUrl = newUrl;
}

// Initialize first URL
trackUrlChange(window.location.href);

// Method 1: Listen to popstate events (back/forward buttons)
window.addEventListener('popstate', function() {
  if (window.location.href !== currentUrl) {
    trackUrlChange(window.location.href);
  }
});

// Method 2: Override pushState and replaceState for SPA navigation
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function() {
  originalPushState.apply(history, arguments);
  if (window.location.href !== currentUrl) {
    trackUrlChange(window.location.href);
  }
};

history.replaceState = function() {
  originalReplaceState.apply(history, arguments);
  if (window.location.href !== currentUrl) {
    trackUrlChange(window.location.href);
  }
};

// Method 3: Listen to hash changes
window.addEventListener('hashchange', function() {
  if (window.location.href !== currentUrl) {
    trackUrlChange(window.location.href);
  }
});

// Method 4: Periodic check as fallback (every 500ms)
setInterval(function() {
  if (window.location.href !== currentUrl) {
    trackUrlChange(window.location.href);
  }
}, 500);
