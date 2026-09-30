# Browser Extension UI Kit

A standalone Chrome Manifest V3 demo of a floating launcher, native side panel, per-item progress, and recoverable background-job state.

## Features

- Toolbar action opens the Chrome side panel.
- The toolbar action also injects a floating launcher into the active page when Chrome allows script injection.
- The launcher can reopen the side panel from a page-level user gesture.
- Background progress is persisted in `chrome.storage.local`.
- A recovery alarm is recreated after startup/service-worker recovery and resumes unfinished work.
- Closing the panel or tab does not discard the saved job.
- Per-item progress uses real completed/total counts.
- Runtime failures are surfaced in the panel instead of failing silently.
- Reset control clears demo state and recovery alarms.

## Installation

Chrome 120+ is required.

1. Clone/download this repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this repo folder.
5. Open a normal `http://` or `https://` page.
6. Click the extension icon.

The side panel should open immediately. On ordinary pages a floating **Open job panel** button is also injected. Chrome internal pages such as `chrome://extensions` intentionally reject content-script injection; the side panel itself can still open from the toolbar.

## Demo

Choose **Process 25 demo items**. Progress is stored after every item. Close the panel while it runs, then reopen it: the state is restored and recovery logic resumes an unfinished job if the service worker has restarted.

## Architecture

- `service-worker.js`: lifecycle, storage, alarms, side-panel opening
- `lib/job-state.mjs`: pure serializable job transitions
- `content/launcher.js`: floating page launcher
- `sidepanel/`: UI and storage-change rendering

There is no backend, account system, host permission, scanner, or proprietary API.

## Development

```sh
npm test
npm run check
node -e 'JSON.parse(require("node:fs").readFileSync("manifest.json","utf8"))'
```

Unit tests cover job-state transitions. CI checks JavaScript syntax and the manifest. Chrome runtime behavior still depends on browser APIs, so contributors should also load the unpacked extension before release.

## Security

The demo stores only synthetic local progress. It requests no host permissions and only injects into the active tab after a toolbar user gesture.

## License

Apache-2.0. See `LICENSE`.
