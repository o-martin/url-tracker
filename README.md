# URL Tracker Chrome Extension

A Chrome extension that tracks all URL changes on the current page, logs the time elapsed from the last URL change, and displays the history in both a DevTools panel and a popup dialog.

## Features

- **Per-Tab Tracking** - Each tab has its own independent URL history
- Tracks URL changes in real-time (including SPA navigation)
- Records timestamp for each URL change
- Calculates and displays time elapsed between URL changes
- **Visual Diff Highlighting** - Shows what changed between URLs:
  - Blue highlighting for path changes
  - Green for new query parameters
  - Yellow for updated parameters
  - Red strikethrough for removed parameters
- **DevTools Panel** - Full-screen view integrated into Chrome DevTools
- **Toolbar Popup** - Quick access from extension icon
- Individual URL deletion with × button
- Export URL history to JSON (per tab)
- Clear history functionality (per tab)
- Automatic cleanup when tabs are closed

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `url-tracker` folder
5. The extension icon will appear in your Chrome toolbar


## Usage

### Option 1: DevTools Panel (Recommended)
1. Browse any website
2. Open Chrome DevTools (F12 or Right-click > Inspect)
3. Find the "URL Tracker" tab in DevTools
4. Navigate between pages and see real-time URL tracking
5. **Each tab tracks its own history** - switch tabs to see different histories
6. Click × on any URL to remove it individually
7. Use "Clear History" to reset tracking for the current tab
8. Use "Export" to download history as JSON for the current tab

### Option 2: Toolbar Popup
1. Browse any website
2. Navigate between pages (normal navigation or SPA routing)
3. Click the extension icon to view URL history in a popup
4. **Shows history only for the active tab**
5. Same functionality as DevTools panel in a compact view

### Per-Tab Tracking
- Each browser tab maintains its own independent URL history
- Switch between tabs to see different URL histories
- Histories are automatically cleaned up when tabs are closed
- Export and clear operations only affect the current tab

## Permissions

- `storage`: To persist URL history across sessions
- `tabs`: To access tab information
- `<all_urls>`: To track URLs on all websites

## License
MIT