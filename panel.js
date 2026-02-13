// Panel script to display URL history in DevTools

function formatTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function parseUrlComponents(urlString) {
  try {
    const url = new URL(urlString);
    const params = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return {
      protocol: url.protocol,
      host: url.host,
      pathname: url.pathname,
      params: params,
      hash: url.hash
    };
  } catch (e) {
    return null;
  }
}

function highlightPathDifferences(currentPath, previousPath) {
  if (currentPath === previousPath) {
    return currentPath;
  }

  // Split paths into segments
  const currentSegments = currentPath.split('/');
  const previousSegments = previousPath.split('/');

  let result = '';
  const maxLength = Math.max(currentSegments.length, previousSegments.length);

  for (let i = 0; i < maxLength; i++) {
    const currentSeg = currentSegments[i] || '';
    const previousSeg = previousSegments[i] || '';

    if (i > 0) result += '/';

    if (currentSeg !== previousSeg) {
      result += `<span class="diff-path">${currentSeg}</span>`;
    } else {
      result += currentSeg;
    }
  }

  return result;
}

function highlightQueryDifferences(currentParams, previousParams) {
  if (Object.keys(currentParams).length === 0 && Object.keys(previousParams).length === 0) {
    return '';
  }

  const allKeys = new Set([...Object.keys(currentParams), ...Object.keys(previousParams)]);
  const parts = [];

  allKeys.forEach(key => {
    const currentValue = currentParams[key];
    const previousValue = previousParams[key];

    if (currentValue !== undefined && previousValue === undefined) {
      // New parameter - green
      parts.push(`<span class="diff-new">${key}=${currentValue}</span>`);
    } else if (currentValue === undefined && previousValue !== undefined) {
      // Removed parameter - red strikethrough
      parts.push(`<span class="diff-removed">${key}=${previousValue}</span>`);
    } else if (currentValue !== previousValue) {
      // Updated parameter - yellow
      parts.push(`<span class="diff-updated">${key}=${currentValue}</span>`);
    } else {
      // Unchanged
      parts.push(`${key}=${currentValue}`);
    }
  });

  return parts.length > 0 ? '?' + parts.join('&') : '';
}

function formatUrlWithDiff(currentUrl, previousUrl) {
  const current = parseUrlComponents(currentUrl);
  const previous = previousUrl ? parseUrlComponents(previousUrl) : null;

  if (!current) {
    return currentUrl;
  }

  // If no previous URL or different domain, show URL without highlighting
  if (!previous || current.host !== previous.host) {
    return currentUrl;
  }

  // Same domain - highlight differences
  let result = `${current.protocol}//${current.host}`;

  // Highlight path differences
  result += highlightPathDifferences(current.pathname, previous.pathname);

  // Highlight query parameter differences
  result += highlightQueryDifferences(current.params, previous.params);

  // Add hash if present
  if (current.hash) {
    result += current.hash;
  }

  return result;
}

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
              <button class="open-btn" data-url="${entry.url}" title="Open in new tab">→</button>
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

    // Add event listeners to open buttons
    document.querySelectorAll('.open-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        window.open(url, '_blank');
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
