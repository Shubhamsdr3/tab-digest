const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const STORAGE_KEY = "sheetsExportMeta";

const HEADER_ROW = [
  "Title",
  "URL",
  "Domain",
  "Opened",
  "Last Used",
  "Archived",
  "Open Duration",
  "Digest Date",
];

function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

async function sheetsRequest(path, token, options = {}) {
  const url = `${SHEETS_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  return res.json();
}

async function createSpreadsheet(token) {
  const data = await sheetsRequest("", token, {
    method: "POST",
    body: JSON.stringify({
      properties: {
        title: "Tab Digest Archive",
      },
      sheets: [
        {
          properties: { title: "Archived Tabs" },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: HEADER_ROW.map((h) => ({
                    userEnteredValue: { stringValue: h },
                    userEnteredFormat: { textFormat: { bold: true } },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  return data.spreadsheetId;
}

async function getExistingSpreadsheetId() {
  const { [STORAGE_KEY]: meta } = await chrome.storage.local.get(STORAGE_KEY);
  return meta?.spreadsheetId || null;
}

async function saveSpreadsheetId(spreadsheetId) {
  await chrome.storage.local.set({
    [STORAGE_KEY]: { spreadsheetId, lastExport: Date.now() },
  });
}

function tabToRow(tab, digestDate) {
  const domain = getDomainFromUrl(tab.url);
  const opened = tab.createdAt ? new Date(tab.createdAt).toLocaleString() : "";
  const lastUsed = tab.lastAccessed
    ? new Date(tab.lastAccessed).toLocaleString()
    : "";
  const archived = tab.archivedAt
    ? new Date(tab.archivedAt).toLocaleString()
    : "";
  const duration = tab.createdAt && tab.archivedAt
    ? formatDurationShort(tab.archivedAt - tab.createdAt)
    : "";
  const digestDateStr = new Date(digestDate).toLocaleString();

  return [
    tab.title || "",
    tab.url || "",
    domain,
    opened,
    lastUsed,
    archived,
    duration,
    digestDateStr,
  ];
}

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function formatDurationShort(ms) {
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

async function appendRows(token, spreadsheetId, rows) {
  const range = "Archived Tabs!A:H";
  await sheetsRequest(
    `/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: "POST",
      body: JSON.stringify({ values: rows }),
    }
  );
}

/**
 * Main export function. Call from digest page.
 * Returns { spreadsheetId, tabCount, isNew } on success.
 */
async function exportToSheets(digests) {
  const token = await getAuthToken(true);

  let spreadsheetId = await getExistingSpreadsheetId();
  let isNew = false;

  if (spreadsheetId) {
    try {
      await sheetsRequest(`/${spreadsheetId}`, token);
    } catch {
      spreadsheetId = null;
    }
  }

  if (!spreadsheetId) {
    spreadsheetId = await createSpreadsheet(token);
    isNew = true;
  }

  const rows = [];
  for (const digest of digests) {
    for (const tab of digest.tabs) {
      rows.push(tabToRow(tab, digest.date));
    }
  }

  if (rows.length > 0) {
    await appendRows(token, spreadsheetId, rows);
  }

  await saveSpreadsheetId(spreadsheetId);

  return {
    spreadsheetId,
    tabCount: rows.length,
    isNew,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  };
}
