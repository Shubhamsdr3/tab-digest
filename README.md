# Tab Digest

A Chrome extension that automatically archives and closes tabs you haven't used in the last 24 hours, keeping your browser clean without losing anything.

## Features

- **Daily cleanup** — Detects tabs unused for 24+ hours and archives them to local storage before closing
- **Manual or automatic** — Trigger a cleanup manually from the popup, or enable daily auto-cleanup
- **Protected sites** — Add URLs (e.g. `github.com`, `slack`) that should never be closed
- **Rich digest page** — Browse archived tabs with favicon, domain, open duration, and last-used time
- **Expand / collapse** — Digests are grouped by date with collapsible sections
- **Card actions** — Click a card to reopen the tab, copy its URL, or remove it from the archive
- **Delete digests** — Remove an entire digest when you no longer need it
- **Export to Google Sheets** — One-click export of all archived tabs to a Google Sheet for browsing, filtering, and searching from any device

## Installation

1. Clone or download this repository
2. Copy `manifest.template.json` to `manifest.json`:
   ```bash
   cp manifest.template.json manifest.json
   ```
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` in `manifest.json` with your actual OAuth2 client ID (see [Google Sheets Export](#google-sheets-export-optional) below)
4. Open `chrome://extensions` in Chrome
5. Enable **Developer mode** (top-right toggle)
6. Click **Load unpacked** and select the project folder
7. The Tab Digest icon appears in your toolbar

> **Note:** `manifest.json` is gitignored to keep your client ID private. Only `manifest.template.json` is tracked.

## Usage

### Popup

Click the extension icon to open the popup:

- **Unused tabs count** — Shows how many tabs have been inactive for 24+ hours
- **Archive & Close Now** — Saves stale tabs to the digest and closes them
- **View Past Digests** — Opens the digest page with all archived tabs
- **Daily auto-cleanup** — Toggle to let the extension run cleanup automatically once a day
- **Protected Sites** — Add domain patterns that should never be auto-closed

### Digest page

The digest page shows all archived tabs grouped by date:

- Click a **card** to reopen the original URL
- Use the **copy button** to copy a tab's URL to clipboard
- Use the **remove button** to delete a single tab from the archive
- **Collapse / expand** digest sections by clicking the header
- **Delete** an entire digest with the trash button
- **Export to Google Sheets** to sync your archive to the cloud

## Google Sheets Export (optional)

To enable the "Export to Google Sheets" button:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a project
2. Enable the **Google Sheets API** (APIs & Services > Library)
3. Go to **APIs & Services > OAuth consent screen**
   - Set publishing status to **Testing**
   - Add your Google email as a test user
4. Go to **APIs & Services > Credentials**
   - Create an **OAuth client ID** with application type **Chrome extension**
   - Enter your extension ID (visible at `chrome://extensions`)
5. Copy the client ID and paste it into `manifest.json` in the `oauth2.client_id` field
6. Reload the extension

On first export, Chrome will prompt you to authorize. After that, each click of "Export to Google Sheets" appends all archived tabs as rows in a spreadsheet called **Tab Digest Archive**.

## File structure

```
├── manifest.template.json # Tracked template (placeholder client ID)
├── manifest.json          # Your local copy with real client ID (gitignored)
├── background.js          # Service worker (tab tracking, archiving, alarms)
├── popup.html / .css / .js  # Extension popup UI
├── digest.html / .js      # Archived tabs viewer
├── sheets-export.js       # Google Sheets API integration
└── icons/                 # Extension icons (16, 48, 128)
```

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Query open tabs and close stale ones |
| `storage` | Store archived digests and settings |
| `alarms` | Schedule daily auto-cleanup |
| `identity` | OAuth2 token for Google Sheets export |

## License

MIT
