/*
Copyright 2026 Expedia, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Panel script to display URL history in DevTools

function displayUrlHistory() {
  // Get the current tab ID from DevTools
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.storage.local.get(['tabHistory'], function(result) {
    const urlList = document.getElementById('urlList');
    const tabHistory = result.tabHistory || {};
    const history = tabHistory[tabId] || [];

    if (history.length === 0) {
      urlList.innerHTML = '<p class="empty-message">No URLs tracked yet for this tab...</p>';
      return;
    }

    let html = '';
    // Reverse the array to show newest first
    const reversedHistory = [...history].reverse();

    reversedHistory.forEach((entry, reversedIndex) => {
      // Calculate the original index in the non-reversed array
      const originalIndex = history.length - 1 - reversedIndex;

      // Get previous URL for comparison (originalIndex - 1 in the original array)
      const previousUrl = originalIndex > 0 ? history[originalIndex - 1].url : null;
      const formattedUrl = formatUrlWithDiff(entry.url, previousUrl);

      html += `
        <div class="url-entry">
          <div class="url-header">
            <div class="url-header-left">
              <span class="url-index">#${originalIndex + 1}</span>
              <span class="url-time">${formatTimestamp(entry.timestamp)}</span>
              <span class="url-elapsed">(+${formatTime(entry.elapsedMs)})</span>
            </div>
            <div class="url-header-right">
              <button class="copy-btn" data-url="${entry.url}" title="Copy URL">${ICON_COPY}</button>
              <button class="navigate-btn" data-url="${entry.url}" title="Navigate to URL">${ICON_NAVIGATE}</button>
              <button class="new-tab-btn" data-url="${entry.url}" title="Open in new tab">${ICON_NEW_TAB}</button>
              <button class="delete-btn" data-index="${originalIndex}" title="Remove this URL">×</button>
            </div>
          </div>
          <div class="url-text">${formattedUrl}</div>
        </div>
      `;
    });

    urlList.innerHTML = html;

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        deleteUrlEntry(index);
      });
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        navigator.clipboard.writeText(this.getAttribute('data-url'));
      });
    });

    document.querySelectorAll('.navigate-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        chrome.tabs.update(tabId, { url: this.getAttribute('data-url') });
      });
    });

    document.querySelectorAll('.new-tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        chrome.tabs.create({ url: this.getAttribute('data-url') });
      });
    });
  });
}

function deleteUrlEntry(index) {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.storage.local.get(['tabHistory'], function(result) {
    const tabHistory = result.tabHistory || {};
    let history = tabHistory[tabId] || [];
    history.splice(index, 1);
    tabHistory[tabId] = history;
    chrome.storage.local.set({ tabHistory: tabHistory }, function() {
      displayUrlHistory();
    });
  });
}

// Clear history button
document.getElementById('clearBtn').addEventListener('click', function() {
  if (confirm('Are you sure you want to clear URL history for this tab?')) {
    const tabId = chrome.devtools.inspectedWindow.tabId;

    chrome.storage.local.get(['tabHistory'], function(result) {
      const tabHistory = result.tabHistory || {};
      tabHistory[tabId] = [];
      chrome.storage.local.set({ tabHistory: tabHistory }, function() {
        displayUrlHistory();
      });
    });
  }
});

// Export button
document.getElementById('exportBtn').addEventListener('click', function() {
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.storage.local.get(['tabHistory'], function(result) {
    const tabHistory = result.tabHistory || {};
    const history = tabHistory[tabId] || [];
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `url-history-tab-${tabId}-${Date.now()}.json`;
    link.click();
  });
});

// Load history on panel open
displayUrlHistory();

// Update display every second while panel is open
setInterval(displayUrlHistory, 1000);
