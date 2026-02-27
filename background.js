const TESTING = false; // flip to false for production

const STALE_MS = TESTING ? 5 * 1000 : 24 * 60 * 60 * 1000;
const ALARM_NAME = "dailyTabDigest";

// --- Installation ---

chrome.runtime.onInstalled.addListener(async () => {
  await snapshotExistingTabs();

  // Default auto-cleanup to ON for new installs
  const { autoCleanup } = await chrome.storage.sync.get("autoCleanup");
  if (autoCleanup === undefined) {
    await chrome.storage.sync.set({ autoCleanup: true });
  }

  await syncAlarm();
  console.log("[Tab Digest] Installed. TESTING =", TESTING);
});

// Re-sync alarm on browser startup (service worker may have been killed)
chrome.runtime.onStartup.addListener(syncAlarm);

// Re-sync alarm when settings change from another machine
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.autoCleanup) {
    syncAlarm();
  }
});

async function syncAlarm() {
  const { autoCleanup = true } = await chrome.storage.sync.get("autoCleanup");

  if (autoCleanup) {
    const existing = await chrome.alarms.get(ALARM_NAME);
    if (!existing) {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: TESTING ? 0.5 : 60,
        periodInMinutes: TESTING ? 1 : 60 * 24, // daily (1 min in test)
      });
      console.log("[Tab Digest] Alarm created");
    }
  } else {
    await chrome.alarms.clear(ALARM_NAME);
    console.log("[Tab Digest] Alarm cleared (auto-cleanup off)");
  }
}

// --- Tab tracking ---

async function snapshotExistingTabs() {
  const tabs = await chrome.tabs.query({});
  const { tabCreatedAt = {} } = await chrome.storage.local.get("tabCreatedAt");
  const now = Date.now();

  for (const tab of tabs) {
    if (!tabCreatedAt[tab.id]) {
      tabCreatedAt[tab.id] = now;
    }
  }

  await chrome.storage.local.set({ tabCreatedAt });
}

chrome.tabs.onCreated.addListener(async (tab) => {
  const { tabCreatedAt = {} } = await chrome.storage.local.get("tabCreatedAt");
  tabCreatedAt[tab.id] = Date.now();
  await chrome.storage.local.set({ tabCreatedAt });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { tabCreatedAt = {} } = await chrome.storage.local.get("tabCreatedAt");
  delete tabCreatedAt[tabId];
  await chrome.storage.local.set({ tabCreatedAt });
});

// --- Core logic ---

function isProtected(url, protectedSites) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return protectedSites.some((site) => lower.includes(site.toLowerCase()));
}

async function getStaleTabs() {
  const allTabs = await chrome.tabs.query({});
  const { protectedSites = [] } = await chrome.storage.sync.get("protectedSites");
  const now = Date.now();

  return allTabs.filter((tab) => {
    if (!tab.lastAccessed) return false;
    if (isProtected(tab.url, protectedSites)) return false;
    return now - tab.lastAccessed > STALE_MS;
  });
}

async function archiveAndClose() {
  const tabs = await getStaleTabs();
  if (tabs.length === 0) return { ok: false, count: 0 };

  const { tabCreatedAt = {} } = await chrome.storage.local.get("tabCreatedAt");
  const now = Date.now();

  const archived = tabs.map((t) => ({
    title: t.title || "(no title)",
    url: t.url || "",
    favIconUrl: t.favIconUrl || "",
    lastAccessed: t.lastAccessed || 0,
    createdAt: tabCreatedAt[t.id] || 0,
    archivedAt: now,
  }));

  const { archivedDigests = [] } = await chrome.storage.local.get("archivedDigests");
  archivedDigests.unshift({ date: now, tabs: archived, auto: true });
  if (archivedDigests.length > 30) archivedDigests.length = 30;

  await chrome.storage.local.set({ archivedDigests });
  console.log(`[Digest] Archived ${archived.length} tabs`);

  const tabIds = tabs.map((t) => t.id);
  await chrome.tabs.remove(tabIds);
  console.log(`[Digest] Closed ${tabIds.length} tabs`);

  return { ok: true, count: archived.length };
}

// --- Daily alarm handler ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  console.log("[Digest] Auto-cleanup alarm fired");
  const result = await archiveAndClose();
  if (result.ok) {
    console.log(`[Digest] Auto-archived ${result.count} tabs`);
  } else {
    console.log("[Digest] No stale tabs to archive");
  }
});

// --- Message handler for popup & digest page ---

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "getStaleTabs") {
    (async () => {
      const tabs = await getStaleTabs();
      const { tabCreatedAt = {} } = await chrome.storage.local.get("tabCreatedAt");
      const data = tabs.map((t) => ({
        id: t.id,
        title: t.title || "(no title)",
        url: t.url || "",
        favIconUrl: t.favIconUrl || "",
        lastAccessed: t.lastAccessed || 0,
        createdAt: tabCreatedAt[t.id] || 0,
      }));
      sendResponse({ tabs: data });
    })();
    return true;
  }

  if (msg.action === "archiveAndCloseStaleTabs") {
    archiveAndClose().then(sendResponse);
    return true;
  }

  if (msg.action === "setAutoCleanup") {
    (async () => {
      await chrome.storage.sync.set({ autoCleanup: msg.enabled });
      await syncAlarm();
      sendResponse({ ok: true });
    })();
    return true;
  }

  if (msg.action === "getAutoCleanup") {
    chrome.storage.sync.get("autoCleanup", (data) => {
      sendResponse({ enabled: data.autoCleanup !== false });
    });
    return true;
  }
});
