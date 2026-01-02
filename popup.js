const profilesDiv = document.getElementById("profiles");

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

document.getElementById("saveProfile").onclick = async () => {
  const tab = await getActiveTab();
  const profileName = document.getElementById("profileName").value;

  chrome.runtime.sendMessage({
    type: "SAVE_PROFILE",
    url: tab.url,
    profileName
  });
};

document.getElementById("exportPlaywright").onclick = async () => {
  const tab = await getActiveTab();

  chrome.runtime.sendMessage({
    type: "EXPORT_PLAYWRIGHT",
    url: tab.url
  });
};

document.getElementById("backupProfiles").onclick = () => {
  chrome.runtime.sendMessage({ type: "BACKUP_PROFILES" });
};

document.getElementById("restoreProfiles").onclick = () => {
  document.getElementById("restoreFile").click();
};

document.getElementById("restoreFile").onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.runtime.sendMessage({ type: "RESTORE_PROFILES", data });
      } catch (error) {
        alert("Invalid backup file format");
      }
    };
    reader.readAsText(file);
  }
};

function renderProfiles(domains) {
  profilesDiv.innerHTML = "";

  Object.entries(domains).forEach(([domain, profiles]) => {
    const h = document.createElement("h4");
    h.textContent = domain;
    profilesDiv.appendChild(h);

    profiles.forEach(profile => {
      const row = document.createElement("div");
      row.className = "profile-row";

      const loadBtn = document.createElement("button");
      loadBtn.textContent = profile.email || profile.profileName;
      loadBtn.className = "profile-load-btn";
      loadBtn.onclick = () => {
        chrome.runtime.sendMessage({
          type: "LOAD_PROFILE",
          profile
        });
      };

      const downloadBtn = document.createElement("button");
      downloadBtn.innerHTML = "&#x2B07;";
      downloadBtn.className = "profile-download-btn";
      downloadBtn.title = "Download Playwright JSON";
      downloadBtn.onclick = () => {
        chrome.runtime.sendMessage({ type: "DOWNLOAD_PROFILE", profile });
      };

      const refreshBtn = document.createElement("button");
      refreshBtn.innerHTML = "&#x21BB;";
      refreshBtn.className = "profile-refresh-btn";
      refreshBtn.title = "Refresh Profile Data";
      refreshBtn.onclick = async () => {
        const tab = await getActiveTab();
        chrome.runtime.sendMessage({
          type: "REFRESH_PROFILE",
          profile,
          currentUrl: tab.url
        });
      };

      row.appendChild(loadBtn);
      row.appendChild(refreshBtn);
      row.appendChild(downloadBtn);
      profilesDiv.appendChild(row);
    });
  });
}

chrome.storage.local.get("domains", ({ domains = {} }) => {
  renderProfiles(domains);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.domains) {
    renderProfiles(changes.domains.newValue || {});
  }
});
