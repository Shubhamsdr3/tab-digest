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
- **Cloud sync via Firebase** — Sync archived digests across machines using Firestore (push on archive, manual pull via Sync button)

## Installation

1. Clone or download this repository
2. Copy `manifest.template.json` to `manifest.json`:
   ```bash
   cp manifest.template.json manifest.json
   ```
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` in `manifest.json` with your actual OAuth2 client ID (see [Google Cloud Setup](#google-cloud-setup) below)
4. Copy `firebase-config.template.js` to `firebase-config.js` and fill in your project ID:
   ```bash
   cp firebase-config.template.js firebase-config.js
   ```
5. Open `chrome://extensions` in Chrome
6. Enable **Developer mode** (top-right toggle)
7. Click **Load unpacked** and select the project folder
8. The Tab Digest icon appears in your toolbar

> **Note:** `manifest.json` and `firebase-config.js` are gitignored to keep your credentials private. Only the `.template` versions are tracked.

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
- **Export to Google Sheets** to export your archive to a spreadsheet
- **Sync** to pull digests from Firestore and merge with local data

## Google Cloud Setup

Both Google Sheets export and Firebase cloud sync use the same Google Cloud project. Set it up once:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a project
2. Enable these APIs (APIs & Services > Library):
   - **Google Sheets API** (for spreadsheet export)
   - **Cloud Firestore API** (for cloud sync)
3. Go to **APIs & Services > OAuth consent screen**
   - Set publishing status to **Testing**
   - Add your Google email as a test user
4. Go to **APIs & Services > Credentials**
   - Create an **OAuth client ID** with application type **Chrome extension**
   - Enter your extension ID (visible at `chrome://extensions`)
5. Copy the client ID and paste it into `manifest.json` in the `oauth2.client_id` field

### Firestore database setup

1. In the same Google Cloud project, go to **Firestore** (or [Firebase Console](https://console.firebase.google.com) > your project > Firestore Database)
2. Create a database in **Native mode**
3. Choose a region close to you
4. Set security rules to allow only authenticated users:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /digests/{digestId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Copy your **project ID** (visible in the Firebase console URL or Google Cloud dashboard) into `firebase-config.js`
6. Reload the extension

### How sync works

- **Auto-push:** Every time the extension archives tabs, it automatically pushes the data to Firestore
- **Manual sync:** Click the "Sync" button on the digest page to pull digests from Firestore and merge with local data
- **Merge logic:** Digests are matched by date; tabs are deduplicated by URL + archive timestamp

On first use, Chrome will prompt you to authorize. The same authorization covers both Sheets export and Firestore sync.

## File structure

```
├── manifest.template.json        # Tracked template (placeholder client ID)
├── manifest.json                 # Your local copy with real client ID (gitignored)
├── firebase-config.template.js   # Tracked template (placeholder project ID)
├── firebase-config.js            # Your local copy with real project ID (gitignored)
├── firebase-sync.js              # Firestore REST API integration (cloud sync)
├── sheets-export.js              # Google Sheets API integration (export)
├── background.js                 # Service worker (tab tracking, archiving, alarms)
├── popup.html / .css / .js       # Extension popup UI
├── digest.html / .js             # Archived tabs viewer
└── icons/                        # Extension icons (16, 48, 128)
```

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Query open tabs and close stale ones |
| `storage` | Store archived digests and settings |
| `alarms` | Schedule daily auto-cleanup |
| `identity` | OAuth2 token for Sheets export and Firestore sync |

## License

MIT
