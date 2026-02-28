const ICONS = {
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM8.75 4a.75.75 0 0 0-1.5 0v4c0 .28.16.53.4.66l2.5 1.5a.75.75 0 1 0 .78-1.28L8.75 7.6V4Z"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 1a.75.75 0 0 0-.75.75V3H2.25A1.25 1.25 0 0 0 1 4.25v9.5C1 14.44 1.56 15 2.25 15h11.5c.69 0 1.25-.56 1.25-1.25v-9.5C15 3.56 14.44 3 13.75 3H12.25V1.75a.75.75 0 0 0-1.5 0V3h-5.5V1.75A.75.75 0 0 0 4.5 1ZM2.5 7h11v6.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25V7Z"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C4.36 3 1.26 5.28.15 7.7a.75.75 0 0 0 0 .6C1.26 10.72 4.36 13 8 13s6.74-2.28 7.85-4.7a.75.75 0 0 0 0-.6C14.74 5.28 11.64 3 8 3Zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>`,
  cross: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>`,
  trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25ZM4.104 5.168a.75.75 0 1 0-1.49.164l.798 7.246A1.75 1.75 0 0 0 5.152 14h5.696a1.75 1.75 0 0 0 1.74-1.422l.798-7.246a.75.75 0 1 0-1.49-.164l-.798 7.245a.25.25 0 0 1-.249.203H5.152a.25.25 0 0 1-.25-.203Z"/></svg>`,
};

let activeSpaceFilter = null;
let spacesMap = {};

document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl = document.getElementById("loading");
  const emptyEl = document.getElementById("empty-state");
  const digestsEl = document.getElementById("digests");
  const subtitleEl = document.getElementById("subtitle");
  const exportBar = document.getElementById("export-bar");
  const exportBtn = document.getElementById("export-btn");
  const exportStatus = document.getElementById("export-status");
  const syncBtn = document.getElementById("sync-btn");
  const filterBar = document.getElementById("filter-bar");

  const SYNC_ICON = syncBtn ? syncBtn.querySelector("svg")?.outerHTML : "";
  const EXPORT_ICON = exportBtn.querySelector("svg").outerHTML;

  const spaceView = document.getElementById("space-view");
  const viewToggle = document.getElementById("view-toggle");
  let currentView = "space";

  const { spaces = [] } = await chrome.storage.sync.get("spaces");
  spacesMap = {};
  for (const s of spaces) {
    spacesMap[s.name] = s.color;
  }

  let archivedDigests;

  function renderAll(digests) {
    archivedDigests = digests;
    digestsEl.innerHTML = "";
    spaceView.innerHTML = "";
    activeSpaceFilter = null;

    if (archivedDigests.length === 0) {
      emptyEl.style.display = "block";
      exportBar.style.display = "none";
      filterBar.style.display = "none";
      viewToggle.style.display = "none";
      subtitleEl.textContent = "";
      return;
    }

    emptyEl.style.display = "none";
    const totalTabs = archivedDigests.reduce((sum, d) => sum + d.tabs.length, 0);
    subtitleEl.textContent = `${archivedDigests.length} digest(s), ${totalTabs} tab(s) archived`;
    exportBar.style.display = "flex";
    viewToggle.style.display = "flex";

    renderBySpace(spaceView, archivedDigests);

    buildFilterBar(filterBar, archivedDigests);
    for (let i = 0; i < archivedDigests.length; i++) {
      renderDigestSection(digestsEl, archivedDigests[i], i, i === 0);
    }

    applyView();
  }

  function applyView() {
    if (currentView === "space") {
      spaceView.style.display = "";
      digestsEl.style.display = "none";
      filterBar.style.display = "none";
    } else {
      spaceView.style.display = "none";
      digestsEl.style.display = "";
      buildFilterBar(filterBar, archivedDigests);
    }
  }

  viewToggle.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-toggle-btn");
    if (!btn) return;
    currentView = btn.dataset.view;
    viewToggle.querySelectorAll(".view-toggle-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyView();
  });

  const { archivedDigests: localDigests = [] } = await chrome.storage.local.get("archivedDigests");
  loadingEl.style.display = "none";
  renderAll(localDigests);

  const { sheetsExportMeta } = await chrome.storage.local.get("sheetsExportMeta");
  if (sheetsExportMeta?.spreadsheetId) {
    exportStatus.innerHTML = `Last export: ${new Date(sheetsExportMeta.lastExport).toLocaleDateString()} · <a href="https://docs.google.com/spreadsheets/d/${sheetsExportMeta.spreadsheetId}" target="_blank">Open Sheet</a>`;
  }

  // --- Sync button ---
  if (syncBtn) {
    syncBtn.addEventListener("click", async () => {
      syncBtn.disabled = true;
      syncBtn.classList.add("syncing");
      syncBtn.innerHTML = `${SYNC_ICON} Syncing…`;
      exportStatus.textContent = "";
      exportStatus.className = "export-status";

      try {
        const result = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ action: "syncFromCloud" }, (res) => {
            if (res?.ok) resolve(res);
            else reject(new Error(res?.error || "Sync failed"));
          });
        });

        exportStatus.textContent = `Synced: ${result.mergedCount} digest(s) (${result.localCount} local, ${result.cloudCount} cloud)`;

        const { archivedDigests: fresh = [] } = await chrome.storage.local.get("archivedDigests");
        renderAll(fresh);

        syncBtn.innerHTML = `${SYNC_ICON} Synced!`;
        setTimeout(() => {
          syncBtn.innerHTML = `${SYNC_ICON} Sync`;
          syncBtn.disabled = false;
          syncBtn.classList.remove("syncing");
        }, 2000);
      } catch (err) {
        exportStatus.textContent = err.message;
        exportStatus.className = "export-status error";
        syncBtn.innerHTML = `${SYNC_ICON} Sync`;
        syncBtn.disabled = false;
        syncBtn.classList.remove("syncing");
      }
    });
  }

  // --- Export button ---
  exportBtn.addEventListener("click", async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = "Exporting…";
    exportStatus.textContent = "";
    exportStatus.className = "export-status";

    try {
      const result = await exportToSheets(archivedDigests);
      exportStatus.innerHTML = `Exported ${result.tabCount} tab(s) · <a href="${result.url}" target="_blank">Open Sheet</a>`;
      exportBtn.textContent = "Exported!";
      setTimeout(() => {
        exportBtn.innerHTML = `${EXPORT_ICON} Export to Sheets`;
        exportBtn.disabled = false;
      }, 2000);
    } catch (err) {
      exportStatus.textContent = err.message;
      exportStatus.className = "export-status error";
      exportBtn.innerHTML = `${EXPORT_ICON} Export to Sheets`;
      exportBtn.disabled = false;
    }
  });
});

// --- Space filter bar ---

function buildFilterBar(container, digests) {
  const allTabs = digests.flatMap((d) => d.tabs);
  const counts = {};
  for (const t of allTabs) {
    const s = t.space || "Uncategorized";
    counts[s] = (counts[s] || 0) + 1;
  }

  const spaceNames = Object.keys(counts).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  if (spaceNames.length <= 1) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  container.innerHTML = "";

  const allChip = document.createElement("button");
  allChip.className = "filter-chip active";
  allChip.style.borderColor = "#6366f1";
  allChip.style.background = "#6366f1";
  allChip.style.color = "#fff";
  allChip.innerHTML = `All <span class="chip-count">${allTabs.length}</span>`;
  allChip.addEventListener("click", () => setFilter(container, null));
  container.appendChild(allChip);

  for (const name of spaceNames) {
    const color = spacesMap[name] || "#94a3b8";
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.dataset.space = name;
    chip.innerHTML = `<span class="chip-dot" style="background:${color}"></span> ${escapeHtml(name)} <span class="chip-count">${counts[name]}</span>`;
    chip.addEventListener("click", () => setFilter(container, name));
    container.appendChild(chip);
  }
}

function setFilter(container, spaceName) {
  activeSpaceFilter = spaceName;

  container.querySelectorAll(".filter-chip").forEach((chip) => {
    const isAll = !chip.dataset.space;
    const isMatch = isAll ? spaceName === null : chip.dataset.space === spaceName;

    if (isMatch) {
      chip.classList.add("active");
      const color = isAll ? "#6366f1" : (spacesMap[spaceName] || "#94a3b8");
      chip.style.borderColor = color;
      chip.style.background = color;
      chip.style.color = "#fff";
    } else {
      chip.classList.remove("active");
      chip.style.borderColor = "";
      chip.style.background = "";
      chip.style.color = "";
    }
  });

  document.querySelectorAll(".card[data-space]").forEach((card) => {
    if (spaceName === null || card.dataset.space === spaceName) {
      card.classList.remove("space-hidden");
    } else {
      card.classList.add("space-hidden");
    }
  });
}

// --- By-space view ---

function renderBySpace(container, digests) {
  const grouped = {};
  const tabDigestIndex = new Map();

  for (let di = 0; di < digests.length; di++) {
    for (const tab of digests[di].tabs) {
      const space = tab.space || "Uncategorized";
      if (!grouped[space]) grouped[space] = [];
      grouped[space].push(tab);
      tabDigestIndex.set(tab, di);
    }
  }

  const { spaces: spaceOrder = [] } = spacesMap;
  const names = Object.keys(grouped).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  for (let si = 0; si < names.length; si++) {
    const name = names[si];
    const tabs = grouped[name];
    const color = spacesMap[name] || "#94a3b8";

    const section = document.createElement("div");
    section.className = "space-section" + (si === 0 ? " expanded" : "");

    const header = document.createElement("div");
    header.className = "space-section-header";
    header.innerHTML = `
      <span class="space-section-dot" style="background:${color}"></span>
      <span class="space-section-name">${escapeHtml(name)}</span>
      <span class="space-section-count">${tabs.length} tab(s)</span>
      <span class="space-section-chevron">${ICONS.chevron}</span>
    `;

    const body = document.createElement("div");
    body.className = "space-section-body";
    let rendered = false;

    header.addEventListener("click", () => {
      section.classList.toggle("expanded");
      if (!rendered) {
        renderSpaceTabs(body, tabs, tabDigestIndex);
        rendered = true;
      }
    });

    if (si === 0) {
      renderSpaceTabs(body, tabs, tabDigestIndex);
      rendered = true;
    }

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
  }
}

function renderSpaceTabs(container, tabs, tabDigestIndex) {
  const sorted = [...tabs].sort((a, b) => b.archivedAt - a.archivedAt);

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const digestIndex = tabDigestIndex.get(t);
    const card = document.createElement("div");
    card.className = "card";

    const domain = getDomain(t.url);
    const age = t.createdAt ? formatDuration(t.archivedAt - t.createdAt) : "unknown";
    const opened = t.createdAt ? formatDate(t.createdAt) : "unknown";
    const lastSeen = t.lastAccessed ? formatRelative(t.archivedAt - t.lastAccessed) : "unknown";
    const archivedDate = formatDate(t.archivedAt);

    const favicon = t.favIconUrl
      ? `<img class="card-favicon" src="${escapeHtml(t.favIconUrl)}" alt="" />`
      : `<div class="card-favicon-placeholder"></div>`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-num">${i + 1}</div>
        ${favicon}
        <div class="card-body">
          <div class="card-title">${escapeHtml(t.title)}</div>
          <div class="card-domain">${escapeHtml(domain)}</div>
          <span class="card-url">${escapeHtml(t.url)}</span>
          <div class="card-meta">
            <span class="badge badge-age">${ICONS.clock} Open for ${age}</span>
            <span class="badge badge-opened">${ICONS.calendar} Archived ${archivedDate}</span>
            <span class="badge badge-accessed">${ICONS.eye} Last used ${lastSeen}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="card-action-btn copy-btn" title="Copy URL">${ICONS.copy}</button>
          <button class="card-action-btn remove-btn" title="Remove from archive">${ICONS.cross}</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-actions")) return;
      window.open(t.url, "_blank");
    });

    card.querySelector(".copy-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      await navigator.clipboard.writeText(t.url);
      btn.innerHTML = ICONS.check;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = ICONS.copy;
        btn.classList.remove("copied");
      }, 1500);
    });

    card.querySelector(".remove-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      card.style.maxHeight = card.offsetHeight + "px";
      requestAnimationFrame(() => card.classList.add("removing"));

      const { archivedDigests = [] } = await chrome.storage.local.get("archivedDigests");
      if (archivedDigests[digestIndex]) {
        archivedDigests[digestIndex].tabs = archivedDigests[digestIndex].tabs.filter(
          (tab) => tab.url !== t.url || tab.archivedAt !== t.archivedAt
        );
        if (archivedDigests[digestIndex].tabs.length === 0) {
          archivedDigests.splice(digestIndex, 1);
        }
        await chrome.storage.local.set({ archivedDigests });
      }

      setTimeout(() => card.remove(), 350);
    });

    container.appendChild(card);
  }
}

// --- By-date view (digest sections) ---

function renderDigestSection(container, digest, digestIndex, expandByDefault) {
  const section = document.createElement("div");
  section.className = "digest-section" + (expandByDefault ? " expanded" : "");

  const header = document.createElement("div");
  header.className = "digest-header";
  header.innerHTML = `
    <span class="digest-chevron">${ICONS.chevron}</span>
    <div class="digest-info">
      <div class="digest-title">${digestIndex === 0 ? "Latest Digest" : "Digest"}</div>
      <div class="digest-date">${formatDate(digest.date)}</div>
    </div>
    <span class="digest-count">${digest.tabs.length} tab(s)</span>
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "digest-delete-btn";
  deleteBtn.title = "Delete this digest";
  deleteBtn.innerHTML = ICONS.trash;
  header.appendChild(deleteBtn);

  const body = document.createElement("div");
  body.className = "digest-body";
  let rendered = false;

  header.addEventListener("click", (e) => {
    if (e.target.closest(".digest-delete-btn")) return;
    section.classList.toggle("expanded");
    if (!rendered) {
      renderTabs(body, digest.tabs, digestIndex);
      rendered = true;
    }
  });

  if (expandByDefault) {
    renderTabs(body, digest.tabs, digestIndex);
    rendered = true;
  }

  deleteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    section.style.maxHeight = section.offsetHeight + "px";
    requestAnimationFrame(() => section.classList.add("removing"));

    const { archivedDigests = [] } = await chrome.storage.local.get("archivedDigests");
    archivedDigests.splice(digestIndex, 1);
    await chrome.storage.local.set({ archivedDigests });

    setTimeout(() => {
      section.remove();
      if (container.children.length === 0) {
        document.getElementById("empty-state").style.display = "block";
        document.getElementById("subtitle").textContent = "";
      }
    }, 400);
  });

  section.appendChild(header);
  section.appendChild(body);
  container.appendChild(section);
}

function renderTabs(container, tabs, digestIndex) {
  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    const card = document.createElement("div");
    const space = t.space || "Uncategorized";
    card.className = "card";
    card.dataset.space = space;

    if (activeSpaceFilter && activeSpaceFilter !== space) {
      card.classList.add("space-hidden");
    }

    const domain = getDomain(t.url);
    const age = t.createdAt ? formatDuration(t.archivedAt - t.createdAt) : "unknown";
    const opened = t.createdAt ? formatDate(t.createdAt) : "unknown";
    const lastSeen = t.lastAccessed ? formatRelative(t.archivedAt - t.lastAccessed) : "unknown";

    const favicon = t.favIconUrl
      ? `<img class="card-favicon" src="${escapeHtml(t.favIconUrl)}" alt="" />`
      : `<div class="card-favicon-placeholder"></div>`;

    const spaceColor = spacesMap[space] || "#94a3b8";
    const spaceBadge = `<span class="badge badge-space" style="background:${spaceColor}">${escapeHtml(space)}</span>`;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-num">${i + 1}</div>
        ${favicon}
        <div class="card-body">
          <div class="card-title">${escapeHtml(t.title)}</div>
          <div class="card-domain">${escapeHtml(domain)}</div>
          <span class="card-url">${escapeHtml(t.url)}</span>
          <div class="card-meta">
            ${spaceBadge}
            <span class="badge badge-age">${ICONS.clock} Open for ${age}</span>
            <span class="badge badge-opened">${ICONS.calendar} Opened ${opened}</span>
            <span class="badge badge-accessed">${ICONS.eye} Last used ${lastSeen}</span>
          </div>
        </div>
        <div class="card-actions">
          <button class="card-action-btn copy-btn" title="Copy URL">${ICONS.copy}</button>
          <button class="card-action-btn remove-btn" title="Remove from archive">${ICONS.cross}</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-actions")) return;
      window.open(t.url, "_blank");
    });

    card.querySelector(".copy-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      await navigator.clipboard.writeText(t.url);
      btn.innerHTML = ICONS.check;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = ICONS.copy;
        btn.classList.remove("copied");
      }, 1500);
    });

    card.querySelector(".remove-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      card.style.maxHeight = card.offsetHeight + "px";
      requestAnimationFrame(() => card.classList.add("removing"));

      const { archivedDigests = [] } = await chrome.storage.local.get("archivedDigests");
      if (archivedDigests[digestIndex]) {
        archivedDigests[digestIndex].tabs = archivedDigests[digestIndex].tabs.filter(
          (tab) => tab.url !== t.url || tab.archivedAt !== t.archivedAt
        );
        if (archivedDigests[digestIndex].tabs.length === 0) {
          archivedDigests.splice(digestIndex, 1);
        }
        await chrome.storage.local.set({ archivedDigests });
      }

      setTimeout(() => card.remove(), 350);
    });

    container.appendChild(card);
  }
}

// --- Helpers ---

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return "< 1 min";
  if (totalMin < 60) return `${totalMin} min`;

  const hours = Math.floor(totalMin / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;

  const weeks = Math.floor(days / 7);
  const remDays = days % 7;
  if (remDays === 0) return `${weeks}w`;
  return `${weeks}w ${remDays}d`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return "just now";
  if (totalMin < 60) return `${totalMin}m ago`;

  const hours = Math.floor(totalMin / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
