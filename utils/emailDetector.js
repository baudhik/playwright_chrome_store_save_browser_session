async function detectEmail(tab) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const search = obj => {
        if (!obj) return null;
        if (typeof obj === "string" && obj.includes("@")) return obj;
        if (typeof obj === "object") {
          for (const v of Object.values(obj)) {
            const r = search(v);
            if (r) return r;
          }
        }
        return null;
      };

      for (let i = 0; i < localStorage.length; i++) {
        try {
          const v = JSON.parse(localStorage.getItem(localStorage.key(i)));
          const email = search(v);
          if (email) return email;
        } catch {}
      }
      return null;
    }
  });

  return result;
}
