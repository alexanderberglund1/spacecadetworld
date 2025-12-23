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

    const focusInput = () => {
      cmd.focus({ preventScroll: true });
    };

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

    const run = async (command) => {
      const raw = (command || "").trim();
      const c = raw.toLowerCase();
      if (!c) return;

      printLine(`cadet@space:~$ ${raw}`, "line acc");

      if (c === "help") {
        printLine("Commands:", "line purp");
        printLine("  status   - what this project is", "line");
        printLine("  devlog   - open devlog panel", "line");
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
        { t: "SPACE.CADET BIOS v0.1", p: 6 },
        { t: "Memory check ............ OK", p: 18 },
        { t: "Starfield renderer ...... OK", p: 30 },
        { t: "Physics module .......... OK", p: 46 },
        { t: "I/O bus ................. OK", p: 58 },
        { t: "Mounting /devlog ........ OK", p: 72 },
        { t: "Loading terminal shell ...", p: 86 },
        { t: "Ready.", p: 100 },
      ];

      for (const s of steps) {
        await typeLineTo(bootlog, s.t, 8);
        bootfill.style.width = `${s.p}%`;
        bootmeta.textContent = s.p < 100 ? "Loading…" : "Press any key";
        await sleep(140);
      }

      localStorage.setItem("sc_boot_done", "1");

      await new Promise((resolve) => {
        const done = () => resolve();
        window.addEventListener("keydown", done, { once: true });
        boot.addEventListener("click", done, { once: true });
      });

      await hideBoot();
      await terminalBoot();
    };

    skipBoot.addEventListener("click", async () => {
      localStorage.setItem("sc_boot_done", "1");
      await hideBoot();
      await terminalBoot();
    });

    const alreadyBooted = localStorage.getItem("sc_boot_done") === "1";
    if (alreadyBooted) {
      boot.style.display = "none";
      await terminalBoot();
    } else {
      await biosBoot();
    }
  });
})();
