const ICONS = {
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11ZM8.75 4a.75.75 0 0 0-1.5 0v4c0 .28.16.53.4.66l2.5 1.5a.75.75 0 1 0 .78-1.28L8.75 7.6V4Z"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 1a.75.75 0 0 0-.75.75V3H2.25A1.25 1.25 0 0 0 1 4.25v9.5C1 14.44 1.56 15 2.25 15h11.5c.69 0 1.25-.56 1.25-1.25v-9.5C15 3.56 14.44 3 13.75 3H12.25V1.75a.75.75 0 0 0-1.5 0V3h-5.5V1.75A.75.75 0 0 0 4.5 1ZM2.5 7h11v6.25a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25V7Z"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 3C4.36 3 1.26 5.28.15 7.7a.75.75 0 0 0 0 .6C1.26 10.72 4.36 13 8 13s6.74-2.28 7.85-4.7a.75.75 0 0 0 0-.6C14.74 5.28 11.64 3 8 3Zm0 8.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>`,
  cross: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>`,
};

document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl = document.getElementById("loading");
  const emptyEl = document.getElementById("empty-state");
  const listEl = document.getElementById("tab-list");
  const subtitleEl = document.getElementById("subtitle");

  const { archivedDigests = [] } = await chrome.storage.local.get("archivedDigests");

  loadingEl.style.display = "none";

  if (archivedDigests.length === 0) {
    emptyEl.style.display = "block";
    return;
  }

  const latest = archivedDigests[0];
  const tabs = latest.tabs;

  subtitleEl.textContent =
    `${tabs.length} unused tab(s) archived on ${formatDate(latest.date)}`;

  renderTabs(listEl, tabs, 0);

  if (archivedDigests.length > 1) {
    renderPastDigests(archivedDigests.slice(1));
  }
});

function renderTabs(container, tabs, digestIndex) {
  for (let i = 0; i < tabs.length; i++) {
    const t = tabs[i];
    const card = document.createElement("div");
    card.className = "card";

    const domain = getDomain(t.url);
    const age = t.createdAt ? formatDuration(t.archivedAt - t.createdAt) : "unknown";
    const opened = t.createdAt ? formatDate(t.createdAt) : "unknown";
    const lastSeen = t.lastAccessed ? formatRelative(t.archivedAt - t.lastAccessed) : "unknown";

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
          <a class="card-url" href="${escapeHtml(t.url)}" target="_blank">${escapeHtml(t.url)}</a>
          <div class="card-meta">
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

    // Copy URL
    card.querySelector(".copy-btn").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      await navigator.clipboard.writeText(t.url);
      btn.innerHTML = ICONS.check;
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = ICONS.copy;
        btn.classList.remove("copied");
      }, 1500);
    });

    // Remove from archive
    card.querySelector(".remove-btn").addEventListener("click", async () => {
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

function renderPastDigests(digests) {
  const container = document.getElementById("past-digests");
  container.style.display = "block";

  for (let di = 0; di < digests.length; di++) {
    const digest = digests[di];
    const digestIndex = di + 1; // offset by 1 since index 0 is the latest

    const section = document.createElement("div");
    section.className = "past-section";

    const header = document.createElement("div");
    header.className = "past-header";
    header.innerHTML = `
      <span>${digest.tabs.length} tab(s) archived on ${formatDate(digest.date)}</span>
    `;

    const toggle = document.createElement("button");
    toggle.className = "past-toggle";
    toggle.textContent = "Show";

    const list = document.createElement("div");
    list.className = "past-list";
    list.style.display = "none";

    toggle.addEventListener("click", () => {
      const visible = list.style.display !== "none";
      list.style.display = visible ? "none" : "block";
      toggle.textContent = visible ? "Show" : "Hide";
      if (!list.hasChildNodes()) {
        renderTabs(list, digest.tabs, digestIndex);
      }
    });

    header.appendChild(toggle);
    section.appendChild(header);
    section.appendChild(list);
    container.appendChild(section);
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
