# Browser Extension UI Kit

A standalone Chrome Manifest V3 demonstration of a floating launcher, side panel, per-item progress, and persisted background-job state. The demo processes 25 local items and has no backend.

## Features

- Toolbar action opens the side panel and injects a floating launcher into the active tab.
- Closing/reopening the panel restores saved progress from `chrome.storage.local`.
- The job does not depend on the current tab and stores progress after each item.
- A recovery alarm resumes a running job if the service worker is restarted.
- Per-item statuses and real completed/total counts are shown.

## Installation

Use Chrome 116 or newer. Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select this directory. No package installation or build is needed.

## Quick start and expected output

Click the extension icon on a normal web tab. The panel opens and a floating **Open job panel** button is injected into that tab. Choose **Process 25 demo items**. The count advances to 25/25; close the panel or tab while it runs and reopen the panel to see the persisted state.

## Configuration

The extension requests only `activeTab`, `scripting`, `sidePanel`, `storage`, and `alarms`. It has no host permissions, tokens, API URLs, scanning logic, or user account settings.

## Architecture

`service-worker.js` owns job lifecycle and storage. `lib/job-state.mjs` is a pure serializable state transition helper. `content/launcher.js` adds the user-triggered panel launcher. `sidepanel/` renders progress and reconnects to stored state when reopened.

## Development and testing

```sh
npm test
node --check service-worker.js
node --check sidepanel/panel.js
node --check content/launcher.js
node -e 'JSON.parse(require("node:fs").readFileSync("manifest.json", "utf8"))'
```

The state unit tests run in Node. Loading and exercising the unpacked extension in Chrome is still required before a READY release; that browser-runtime check has not yet been performed in this staging session.

## Security

The demo stores only synthetic progress locally. It injects the launcher only into the active tab after a toolbar click and does not request `<all_urls>` access.

## Licence

Apache-2.0. See `LICENSE`.