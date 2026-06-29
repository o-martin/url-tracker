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

const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const ICON_NAVIGATE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>`;
const ICON_NEW_TAB = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

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
      if (key in params) {
        params[key] = [].concat(params[key], value);
      } else {
        params[key] = value;
      }
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
    const currentStr = JSON.stringify(currentValue);
    const previousStr = JSON.stringify(previousValue);

    const renderValues = (value, cssClass) => {
      [].concat(value).forEach(v => {
        const entry = `${key}=${v}`;
        parts.push(cssClass ? `<span class="${cssClass}">${entry}</span>` : entry);
      });
    };

    if (currentValue !== undefined && previousValue === undefined) {
      renderValues(currentValue, 'diff-new');
    } else if (currentValue === undefined && previousValue !== undefined) {
      renderValues(previousValue, 'diff-removed');
    } else if (currentStr !== previousStr) {
      renderValues(currentValue, 'diff-updated');
    } else {
      renderValues(currentValue, null);
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

  if (!previous || current.host !== previous.host) {
    return currentUrl;
  }

  let result = `${current.protocol}//${current.host}`;
  result += highlightPathDifferences(current.pathname, previous.pathname);
  result += highlightQueryDifferences(current.params, previous.params);

  if (current.hash) {
    result += current.hash;
  }

  return result;
}
