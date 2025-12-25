(() => {
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const typeLineTo = async (node, text, speed) => {
    const line = document.createElement("div");
    node.appendChild(line);
    for (let i = 0; i < text.length; i++) {
      line.textContent += text[i];
      node.scrollTop = node.scrollHeight;
      await sleep(speed);
    }
  };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  ready(async () => {
    const log = document.getElementById("log");
    const cmd = document.getElementById("cmd");

    const drawer = document.getElementById("drawer");
    const drawerTitle = document.getElementById("drawerTitle");
    const drawerBody = document.getElementById("drawerBody");
    const drawerClose = document.getElementById("drawerClose");

    const boot = document.getElementById("boot");
    const bootlog = document.getElementById("bootlog");
    const bootfill = document.getElementById("bootfill");
    const bootmeta = document.getElementById("bootmeta");
    const skipBoot = document.getElementById("skipBoot");

    const focusInput = () => cmd.focus({ preventScroll: true });

    const printLine = (text, cls) => {
      const line = document.createElement("div");
      line.className = cls || "line";
      line.textContent = text;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    };

    const openDrawer = (title, templateId) => {
      const tpl = document.getElementById(templateId);
      drawerTitle.textContent = title;
      drawerBody.innerHTML = "";
      if (tpl) drawerBody.appendChild(tpl.content.cloneNode(true));
      drawer.hidden = false;
      drawerClose.focus();
    };

    const closeDrawer = () => {
      drawer.hidden = true;
      focusInput();
    };

    drawerClose.addEventListener("click", closeDrawer);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !drawer.hidden) closeDrawer();
    });

    log.addEventListener("mousedown", () => setTimeout(focusInput, 0));
    log.addEventListener("touchstart", () => setTimeout(focusInput, 0), { passive: true });

    const renderBuilds = async () => {
      const mount = drawerBody.querySelector("#buildsMount");
      if (!mount) return;

      mount.innerHTML = `<p class="small">Loading…</p>`;

      try {
        const url = "https://api.github.com/repos/alexanderberglund1/kandidat-space-cadet/releases?per_page=8";
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const releases = await res.json();

        if (!Array.isArray(releases) || releases.length === 0) {
          mount.innerHTML = `<p class="small">No releases found.</p>`;
          return;
        }

        const items = releases
          .filter((r) => r && !r.draft)
          .map((r) => {
            const name = escapeHtml(r.name || r.tag_name || "release");
            const date = escapeHtml(fmtDate(r.published_at || r.created_at));
            const page = escapeHtml(r.html_url || "");
            const assets = Array.isArray(r.assets) ? r.assets : [];

            const assetList = assets
              .slice(0, 10)
              .map((a) => {
                const an = escapeHtml(a.name || "asset");
                const dl = escapeHtml(a.browser_download_url || "");
                if (!dl) return "";
                return `<li><a href="${dl}" target="_blank" rel="noreferrer">${an}</a></li>`;
              })
              .filter(Boolean)
              .join("");

            const assetsBlock = assetList
              ? `<ul class="list" style="margin-top:10px;">${assetList}</ul>`
              : `<p class="small" style="margin-top:10px;">No attached files. <a href="${page}" target="_blank" rel="noreferrer">Open release →</a></p>`;

            return `
              <div class="panel" style="margin-top:12px;">
                <h2 style="margin-bottom:6px;">${name}</h2>
                <p class="small">${date}</p>
                ${assetsBlock}
              </div>
            `;
          })
          .join("");

        mount.innerHTML = items;
      } catch (e) {
        mount.innerHTML = `<p class="small">Couldn’t load releases. <a href="https://github.com/alexanderberglund1/kandidat-space-cadet/releases" target="_blank" rel="noreferrer">Open releases →</a></p>`;
      }
    };

    const run = async (command) => {
      const raw = (command || "").trim();
      const c = raw.toLowerCase();
      if (!c) return;

      printLine(`cadet@space:~$ ${raw}`, "line acc");

      if (c === "help") {
        printLine("Commands:", "line purp");
        printLine("  status   - what this project is", "line");
        printLine("  devlog   - open devlog panel", "line");
        printLine("  builds   - latest releases", "line");
        printLine("  contact  - open contact form", "line");
        printLine("  clear    - clear screen", "line");
        return;
      }

      if (c === "clear") {
        log.innerHTML = "";
        return;
      }

      if (c === "status") {
        openDrawer("STATUS", "tpl-status");
        return;
      }

      if (c === "devlog") {
        openDrawer("DEVLOG", "tpl-devlog");
        return;
      }

      if (c === "builds") {
        openDrawer("BUILDS", "tpl-builds");
        setTimeout(renderBuilds, 0);
        return;
      }

      if (c === "contact") {
        openDrawer("CONTACT", "tpl-contact");
        return;
      }

      printLine(`Unknown command: "${raw}"`, "line");
      printLine("Try: help", "line dim");
    };

    cmd.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const v = cmd.value;
        cmd.value = "";
        await run(v);
        focusInput();
      }
    });

    const terminalBoot = async () => {
      printLine("Booting SPACE.CADET terminal…", "line dim");
      printLine("Type 'help' to get started.", "line dim");
      printLine("—", "line dim");
      focusInput();
    };

    const hideBoot = async () => {
      boot.classList.add("hide");
      boot.setAttribute("aria-hidden", "true");
      await sleep(260);
      boot.style.display = "none";
    };

    const biosBoot = async () => {
      bootlog.innerHTML = "";
      bootfill.style.width = "0%";
      bootmeta.textContent = "Initializing…";

      const steps = [
        { t: "SPACE.CADET BIOS v0.1", p: 8 },
        { t: "Memory check ............ OK", p: 18 },
        { t: "Renderer ................ OK", p: 34 },
        { t: "Mounting /devlog ........ OK", p: 52 },
        { t: "Mounting /builds ........ OK", p: 70 },
        { t: "Loading terminal shell ...", p: 88 },
        { t: "Ready.", p: 100 }
      ];

      for (const s of steps) {
        await typeLineTo(bootlog, s.t, 8);
        bootfill.style.width = `${s.p}%`;
        bootmeta.textContent = s.p < 100 ? "Loading…" : "Press any key";
        await sleep(140);
      }

      await new Promise((resolve) => {
        const done = () => resolve();
        window.addEventListener("keydown", done, { once: true });
        boot.addEventListener("click", done, { once: true });
      });

      sessionStorage.setItem("sc_boot_tab", "1");

      await hideBoot();
      await terminalBoot();
    };

    skipBoot.addEventListener("click", async () => {
      sessionStorage.setItem("sc_boot_tab", "1");
      await hideBoot();
      await terminalBoot();
    });

    const alreadyBootedThisTab = sessionStorage.getItem("sc_boot_tab") === "1";

    if (alreadyBootedThisTab) {
      boot.style.display = "none";
      await terminalBoot();
    } else {
      await biosBoot();
    }
  });
})();
