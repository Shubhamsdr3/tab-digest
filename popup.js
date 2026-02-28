const archiveBtn = document.getElementById("archive-btn");
const viewDigestBtn = document.getElementById("view-digest");
const autoToggle = document.getElementById("auto-toggle");
const staleCountEl = document.getElementById("stale-count");
const totalCountEl = document.getElementById("total-count");
const siteInput = document.getElementById("site-input");
const addSiteBtn = document.getElementById("add-site");
const siteListEl = document.getElementById("site-list");
const spacesListEl = document.getElementById("spaces-list");
const spaceNameInput = document.getElementById("space-name-input");
const spaceColorInput = document.getElementById("space-color-input");
const addSpaceBtn = document.getElementById("add-space");

document.addEventListener("DOMContentLoaded", async () => {
  const res = await chrome.runtime.sendMessage({ action: "getAutoCleanup" });
  autoToggle.checked = res?.enabled !== false;

  await renderSpaces();
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

// --- Spaces ---

addSpaceBtn.addEventListener("click", addSpace);
spaceNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addSpace();
});

async function addSpace() {
  const name = spaceNameInput.value.trim();
  if (!name) return;

  const color = spaceColorInput.value;
  const { spaces = [] } = await chrome.storage.sync.get("spaces");

  if (spaces.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    spaceNameInput.value = "";
    return;
  }

  spaces.push({ name, color, patterns: [] });
  await chrome.storage.sync.set({ spaces });

  spaceNameInput.value = "";
  await renderSpaces();
}

async function removeSpace(index) {
  const { spaces = [] } = await chrome.storage.sync.get("spaces");
  spaces.splice(index, 1);
  await chrome.storage.sync.set({ spaces });
  await renderSpaces();
}

async function updatePatterns(index, patternsStr) {
  const { spaces = [] } = await chrome.storage.sync.get("spaces");
  if (!spaces[index]) return;

  spaces[index].patterns = patternsStr
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  await chrome.storage.sync.set({ spaces });
}

async function renderSpaces() {
  const { spaces = [] } = await chrome.storage.sync.get("spaces");
  spacesListEl.innerHTML = "";

  if (spaces.length === 0) {
    spacesListEl.innerHTML = `<div class="spaces-empty">No spaces yet</div>`;
    return;
  }

  spaces.forEach((space, i) => {
    const card = document.createElement("div");
    card.className = "space-card";
    card.innerHTML = `
      <div class="space-card-header">
        <span class="space-dot" style="background:${escapeHtml(space.color)}"></span>
        <span class="space-card-name">${escapeHtml(space.name)}</span>
        <button class="space-remove-btn" title="Remove">&times;</button>
      </div>
      <div class="space-patterns">
        <input
          class="space-patterns-input"
          type="text"
          placeholder="URL patterns (comma-separated)"
          value="${escapeHtml(space.patterns.join(", "))}"
          spellcheck="false"
        />
      </div>
    `;

    card.querySelector(".space-remove-btn").addEventListener("click", () => removeSpace(i));

    let debounce;
    card.querySelector(".space-patterns-input").addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => updatePatterns(i, e.target.value), 500);
    });

    spacesListEl.appendChild(card);
  });
}

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

  const { protectedSites = [] } = await chrome.storage.sync.get("protectedSites");

  if (protectedSites.includes(site)) {
    siteInput.value = "";
    return;
  }

  protectedSites.push(site);
  await chrome.storage.sync.set({ protectedSites });

  siteInput.value = "";
  await renderProtectedSites();
  await refreshStats();
}

async function removeSite(site) {
  const { protectedSites = [] } = await chrome.storage.sync.get("protectedSites");
  const updated = protectedSites.filter((s) => s !== site);
  await chrome.storage.sync.set({ protectedSites: updated });

  await renderProtectedSites();
  await refreshStats();
}

async function renderProtectedSites() {
  const { protectedSites = [] } = await chrome.storage.sync.get("protectedSites");
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
