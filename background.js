importScripts(
  "utils/storageCollector.js",
  "utils/emailDetector.js",
  "utils/indexedDbExporter.js"
);

function download(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: filename
  });
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "SAVE_PROFILE") {
    const origin = new URL(msg.url).origin;
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

    const storageState = await collectStorage(tab, msg.url);
    const email = await detectEmail(tab);
    const indexedDB = await exportIndexedDB(tab);

    storageState.origins[0].indexedDB = indexedDB;

    const profile = {
      profileName: msg.profileName || email || "unknown",
      email,
      domain: origin,
      createdAt: new Date().toISOString(),
      storageState
    };

    chrome.storage.local.get("domains", ({ domains = {} }) => {
      domains[origin] = domains[origin] || [];
      domains[origin] = domains[origin].filter(
        p => p.profileName !== profile.profileName
      );
      domains[origin].push(profile);
      chrome.storage.local.set({ domains });
    });
  }

  if (msg.type === "EXPORT_PLAYWRIGHT") {
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const storageState = await collectStorage(tab, msg.url);
    download(adaptForPlaywright(storageState), "auth.json");
  }

  if (msg.type === "LOAD_PROFILE") {
    const { cookies, origins } = msg.profile.storageState;
    const domain = msg.profile.domain;

    // 1. Create Tab first (to detect if it's incognito)
    const tab = await chrome.tabs.create({ url: domain, active: true });

    // 2. Restore Cookies (with tab ID to detect incognito)
    await restoreCookies(cookies, domain, tab.id);

    // 3. Restore LocalStorage and SessionStorage
    const listener = async (tabId, changeInfo) => {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        const originState = origins.find(o => new URL(o.origin).origin === new URL(domain).origin) || origins[0];

        if (originState) {
          if (originState.localStorage) await restoreLocalStorage(tab.id, originState.localStorage);
          if (originState.sessionStorage) await restoreSessionStorage(tab.id, originState.sessionStorage);

          chrome.tabs.reload(tab.id);
        }
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  }

  if (msg.type === "DOWNLOAD_PROFILE") {
    const storageState = msg.profile.storageState;
    const filename = `${(msg.profile.profileName || "profile").replace(/[^a-z0-9]/gi, '_')}_auth.json`;
    download(adaptForPlaywright(storageState), filename);
  }

  if (msg.type === "BACKUP_PROFILES") {
    chrome.storage.local.get("domains", ({ domains = {} }) => {
      const backup = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        profiles: domains
      };
      const filename = `profiles_backup_${new Date().toISOString().split('T')[0]}.json`;
      download(backup, filename);
    });
  }

  if (msg.type === "RESTORE_PROFILES") {
    if (msg.data && msg.data.profiles) {
      chrome.storage.local.set({ domains: msg.data.profiles }, () => {
        console.log("Profiles restored successfully");
      });
    }
  }

  if (msg.type === "REFRESH_PROFILE") {
    const targetOrigin = new URL(msg.profile.domain).origin;
    const currentOrigin = new URL(msg.currentUrl).origin;
    
    let tab;
    if (currentOrigin !== targetOrigin) {
      tab = await chrome.tabs.create({ url: msg.profile.domain, active: true });
      await new Promise(resolve => {
        const listener = (tabId, changeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    } else {
      tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    }

    const storageState = await collectStorage(tab, msg.profile.domain);
    const email = await detectEmail(tab);
    const indexedDB = await exportIndexedDB(tab);

    storageState.origins[0].indexedDB = indexedDB;

    const updatedProfile = {
      ...msg.profile,
      email: email || msg.profile.email,
      storageState,
      updatedAt: new Date().toISOString()
    };

    chrome.storage.local.get("domains", ({ domains = {} }) => {
      domains[targetOrigin] = domains[targetOrigin] || [];
      const index = domains[targetOrigin].findIndex(p => p.profileName === msg.profile.profileName);
      if (index !== -1) {
        domains[targetOrigin][index] = updatedProfile;
        chrome.storage.local.set({ domains });
      }
    });
  }
});
