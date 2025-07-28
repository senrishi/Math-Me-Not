browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status == "complete" && tab.url) {
    const reset_time = 35000;

    const dat = await browser.storage.local.get("passTime");
    const t1 = dat.passTime;
    if (t1) {
      const t2 = Date.now() - t1;
      if (t2 < reset_time) {
        return;
      }
    }

    const hostname = new URL(tab.url).hostname.replace(/www\./, "");
    const localUrls = await browser.storage.local.get("storedUrls");
    const storedUrlsObject = localUrls.storedUrls;
    const localTime = await browser.storage.local.get("storedTime");
    const storedTimeObject = localTime.storedTime;

    if (storedUrlsObject && storedTimeObject) {
      for (const key in storedUrlsObject) {
          const blockedUrl = new URL(storedUrlsObject[key]);
          const blockedHostname = blockedUrl.hostname.replace(/www\./, "");
          
          if (hostname === blockedHostname || hostname.endsWith("." + blockedHostname)) {
            const lastAccessTime = storedTimeObject[blockedHostname];
            if (lastAccessTime == null || (Date.now() - lastAccessTime > reset_time)) {
              await browser.storage.local.set({ path: tab.url });
              await browser.storage.local.set({ pathHostname: blockedHostname });
              browser.tabs.update(tabId, { url: "anim.html" });
              return;
            }
          }
      }
    }
  }
});