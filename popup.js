const archiveBtn = document.getElementById("archive-btn");
const viewDigestBtn = document.getElementById("view-digest");
const autoToggle = document.getElementById("auto-toggle");
const staleCountEl = document.getElementById("stale-count");
const totalCountEl = document.getElementById("total-count");
const siteInput = document.getElementById("site-input");
const addSiteBtn = document.getElementById("add-site");
const siteListEl = document.getElementById("site-list");

document.addEventListener("DOMContentLoaded", async () => {
  const res = await chrome.runtime.sendMessage({ action: "getAutoCleanup" });
  autoToggle.checked = res?.enabled !== false;

  await renderProtectedSites();
  await refreshStats();
});

// --- Auto-cleanup toggle ---

autoToggle.addEventListener("change", async () => {
  await chrome.runtime.sendMessage({
    action: "setAutoCleanup",
    enabled: autoToggle.checked,
  });
});

// --- Archive & close ---

archiveBtn.addEventListener("click", async () => {
  archiveBtn.disabled = true;
  archiveBtn.textContent = "Saving & closing...";

  const response = await chrome.runtime.sendMessage({ action: "archiveAndCloseStaleTabs" });

  if (response?.ok) {
    chrome.tabs.create({ url: chrome.runtime.getURL("digest.html") });
  } else {
    archiveBtn.textContent = "No unused tabs found";
    setTimeout(() => {
      archiveBtn.textContent = "Archive & Close Unused Tabs";
      refreshStats();
    }, 2000);
  }
});

viewDigestBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("digest.html") });
});

// --- Protected sites ---

addSiteBtn.addEventListener("click", addSite);
siteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addSite();
});

async function addSite() {
  const raw = siteInput.value.trim().toLowerCase();
  if (!raw) return;

  // Strip protocol and trailing slashes for cleaner matching
  const site = raw.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!site) return;

  const { protectedSites = [] } = await chrome.storage.local.get("protectedSites");

  if (protectedSites.includes(site)) {
    siteInput.value = "";
    return;
  }

  protectedSites.push(site);
  await chrome.storage.local.set({ protectedSites });

  siteInput.value = "";
  await renderProtectedSites();
  await refreshStats();
}

async function removeSite(site) {
  const { protectedSites = [] } = await chrome.storage.local.get("protectedSites");
  const updated = protectedSites.filter((s) => s !== site);
  await chrome.storage.local.set({ protectedSites: updated });

  await renderProtectedSites();
  await refreshStats();
}

async function renderProtectedSites() {
  const { protectedSites = [] } = await chrome.storage.local.get("protectedSites");
  siteListEl.innerHTML = "";

  if (protectedSites.length === 0) {
    siteListEl.innerHTML = `<li class="empty-msg">No protected sites yet</li>`;
    return;
  }

  for (const site of protectedSites) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="site-name">${escapeHtml(site)}</span>
      <button class="remove-btn" title="Remove">&times;</button>
    `;
    li.querySelector(".remove-btn").addEventListener("click", () => removeSite(site));
    siteListEl.appendChild(li);
  }
}

// --- Stats ---

async function refreshStats() {
  const allTabs = await chrome.tabs.query({});
  totalCountEl.textContent = allTabs.length;

  const response = await chrome.runtime.sendMessage({ action: "getStaleTabs" });
  const staleTabs = response?.tabs || [];
  staleCountEl.textContent = staleTabs.length;

  archiveBtn.disabled = staleTabs.length === 0;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
