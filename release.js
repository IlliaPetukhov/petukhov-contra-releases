// Вибір архівів платформ із відповіді GitHub releases/latest. Без DOM: перевіряється в Node.
(function (root) {
  "use strict";
  function escape(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Розширення йдуть за пріоритетом (Mac: dmg, а для старих релізів zip), в межах розширення новий префікс раніше за стару назву.
  function pickAsset(release, platform, prefixes, extensions) {
    const assets = (release && release.assets) || [];
    for (const extension of extensions) {
      for (const prefix of prefixes) {
        const name = new RegExp("^" + escape(prefix) + "-" + escape(platform) + "-(\\d+(?:\\.\\d+)*)\\." + escape(extension) + "$");
        for (const asset of assets) {
          const match = name.exec(asset.name);
          if (match) return { url: asset.browser_download_url, version: match[1], bytes: asset.size };
        }
      }
    }
    return null;
  }

  function detectPlatform(userAgent) {
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)) return "mobile";
    if (/Windows/i.test(userAgent)) return "windows";
    if (/Macintosh|Mac OS X/i.test(userAgent)) return "mac";
    return null;
  }

  const api = { pickAsset, detectPlatform };
  if (typeof module !== "undefined") module.exports = api;
  else root.ReleaseFiles = api;
})(this);
