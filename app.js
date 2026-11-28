(function () {
  "use strict";
  const config = JSON.parse(document.getElementById("config").textContent);
  const text = config.strings;
  const cards = document.querySelectorAll(".downloads .platform");

  const system = ReleaseFiles.detectPlatform(navigator.userAgent) || "";
  document.documentElement.dataset.system = system;

  // Вкладки інструкції: без скриптів видно обидві, зі скриптами одну, типово для системи відвідувача.
  const tabs = document.querySelectorAll(".tabs button");
  function choose(platform) {
    tabs.forEach((tab) => tab.setAttribute("aria-pressed", String(tab.dataset.platform === platform)));
    document.querySelectorAll(".guide").forEach((guide) => { guide.hidden = guide.dataset.platform !== platform; });
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => choose(tab.dataset.platform)));
  document.querySelector(".tabs").hidden = false;
  choose(system === "mac" ? "mac" : "windows");

  function show(card, state, status, url) {
    const button = card.querySelector(".cta");
    card.dataset.state = state;
    card.querySelector(".status").textContent = status;
    if (url) { button.href = url; button.removeAttribute("aria-disabled"); }
    else { button.removeAttribute("href"); button.setAttribute("aria-disabled", "true"); }
  }

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
  }

  async function load() {
    cards.forEach((card) => { card.querySelector(".status").textContent = text.loading; });
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), config.fetchTimeoutMs);
    try {
      const response = await fetch(config.apiUrl, { signal: abort.signal, headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const release = await response.json();
      cards.forEach((card) => {
        const file = ReleaseFiles.pickAsset(release, card.dataset.platform, config.prefixes, config.extensions[card.dataset.platform] || ["zip"]);
        if (!file) return show(card, "unavailable", text.unavailable, null);
        const size = Math.round(file.bytes / 1e6) + " " + text.sizeUnit;
        show(card, "ready", fill(text.fileInfo, { version: file.version, size }), file.url);
      });
    } catch (error) {
      console.warn(error);
      cards.forEach((card) => show(card, "offline", text.offline, config.releasePageUrl));
    } finally {
      clearTimeout(timer);
    }
  }

  load();
})();
