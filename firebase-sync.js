const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

function getFirestoreToken(interactive = true) {
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

async function firestoreRequest(path, token, options = {}) {
  const url = path.startsWith("http") ? path : `${FIRESTORE_BASE}${path}`;
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
    throw new Error(`Firestore ${res.status}: ${body}`);
  }
  return res.json();
}

// --- Firestore data conversion helpers ---

function digestToFirestore(digest) {
  return {
    fields: {
      date: { integerValue: String(digest.date) },
      auto: { booleanValue: !!digest.auto },
      tabs: {
        arrayValue: {
          values: digest.tabs.map((t) => ({
            mapValue: {
              fields: {
                title: { stringValue: t.title || "" },
                url: { stringValue: t.url || "" },
                favIconUrl: { stringValue: t.favIconUrl || "" },
                lastAccessed: { integerValue: String(t.lastAccessed || 0) },
                createdAt: { integerValue: String(t.createdAt || 0) },
                archivedAt: { integerValue: String(t.archivedAt || 0) },
              },
            },
          })),
        },
      },
    },
  };
}

function firestoreToDigest(doc) {
  const f = doc.fields;
  return {
    date: Number(f.date.integerValue),
    auto: f.auto?.booleanValue || false,
    tabs: (f.tabs?.arrayValue?.values || []).map((v) => {
      const tf = v.mapValue.fields;
      return {
        title: tf.title.stringValue,
        url: tf.url.stringValue,
        favIconUrl: tf.favIconUrl.stringValue,
        lastAccessed: Number(tf.lastAccessed.integerValue),
        createdAt: Number(tf.createdAt.integerValue),
        archivedAt: Number(tf.archivedAt.integerValue),
      };
    }),
  };
}

// --- Push: upload local digests to Firestore ---

async function pushDigestsToCloud(digests) {
  const token = await getFirestoreToken(true);

  for (const digest of digests) {
    const docId = `digest_${digest.date}`;
    const body = digestToFirestore(digest);

    await firestoreRequest(`/digests/${docId}`, token, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  return { pushed: digests.length };
}

// --- Pull: download digests from Firestore ---

async function pullDigestsFromCloud() {
  const token = await getFirestoreToken(true);

  let docs = [];
  let pageToken = null;

  do {
    const qs = pageToken ? `?pageToken=${pageToken}&pageSize=100` : "?pageSize=100";
    const data = await firestoreRequest(`/digests${qs}`, token);
    if (data.documents) {
      docs = docs.concat(data.documents);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return docs.map(firestoreToDigest);
}

// --- Full sync: merge local + cloud ---

async function syncDigests() {
  const { archivedDigests: local = [] } = await chrome.storage.local.get("archivedDigests");

  const cloud = await pullDigestsFromCloud();

  const merged = mergeDigests(local, cloud);

  await chrome.storage.local.set({ archivedDigests: merged });

  await pushDigestsToCloud(merged);

  return {
    localCount: local.length,
    cloudCount: cloud.length,
    mergedCount: merged.length,
  };
}

function mergeDigests(localDigests, cloudDigests) {
  const byDate = new Map();

  for (const d of cloudDigests) {
    byDate.set(d.date, d);
  }

  for (const d of localDigests) {
    if (!byDate.has(d.date)) {
      byDate.set(d.date, d);
    } else {
      const existing = byDate.get(d.date);
      const mergedTabs = mergeTabs(existing.tabs, d.tabs);
      byDate.set(d.date, { ...d, tabs: mergedTabs });
    }
  }

  const all = Array.from(byDate.values());
  all.sort((a, b) => b.date - a.date);

  if (all.length > 30) all.length = 30;
  return all;
}

function mergeTabs(tabsA, tabsB) {
  const seen = new Set();
  const result = [];

  for (const t of [...tabsA, ...tabsB]) {
    const key = `${t.url}|${t.archivedAt}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(t);
    }
  }

  return result;
}
