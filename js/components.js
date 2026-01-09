// js/components.js
// Theme Management
class ThemeManager {
  static init() {
    // Expose global functions
    window.setGlobalTheme = (mode) => {
      localStorage.setItem("lifeflow_theme_mode", mode);
      ThemeManager.apply(mode);
    };

    // Initial application
    const savedMode = localStorage.getItem("lifeflow_theme_mode") || "auto";
    ThemeManager.apply(savedMode);

    // Listen for system changes if in auto mode
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("lifeflow_theme_mode") === "auto") {
          ThemeManager.apply("auto");
        }
      });

    // Listen for storage changes to sync across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "lifeflow_theme_mode") {
        ThemeManager.apply(e.newValue || "auto");
      }
    });

    // Initialize Settings Modal (Global Fallback)
    // Ensure it runs even if DOMContentLoaded already fired
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        SettingsManager.init()
      );
    } else {
      SettingsManager.init();
    }
  }

  static apply(mode) {
    let isDark = false;

    if (mode === "auto") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      document.body?.classList.add("dark");
    } else {
      html.classList.remove("dark");
      document.body?.classList.remove("dark");
    }

    console.log(`[ThemeManager] Applied ${mode} (isDark: ${isDark})`);

    // Update components
    document.querySelectorAll("local-header").forEach((header) => {
      header.setAttribute("theme", isDark ? "dark" : "light");
    });

    // Dispatch event for other listeners
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { mode, isDark } })
    );

    // Update Settings UI if it exists
    SettingsManager.updateUI(mode);
  }
}

class SettingsManager {
  static updateUI(mode) {
    // Update all specific theme buttons in the document
    // This targets both the global settings modal and any fallback/custom buttons if they persist
    const updateBtns = (prefix) => {
      const btns = {
        auto: document.getElementById(`${prefix}-auto`),
        light: document.getElementById(`${prefix}-light`),
        dark: document.getElementById(`${prefix}-dark`),
      };

      // Remove active state from all
      const activeClassesLines = [
        "ring-2",
        "ring-blue-500",
        "bg-blue-50",
        "dark:bg-blue-900/30",
        "text-blue-600",
        "dark:text-blue-400",
      ];
      const inactiveClassesLines = [
        "text-slate-500",
        "hover:text-slate-900",
        "hover:bg-white",
        "dark:hover:text-white",
        "dark:hover:bg-slate-700",
      ];

      Object.values(btns).forEach((btn) => {
        if (!btn) return;
        // Reset to base state
        btn.classList.remove(...activeClassesLines);
        btn.classList.add("text-slate-500", "dark:text-slate-400"); // Base text
      });

      // Apply active state
      if (btns[mode]) {
        const btn = btns[mode];
        btn.classList.remove("text-slate-500", "dark:text-slate-400");
        btn.classList.add(...activeClassesLines);
      }
    };

    updateBtns("themeBtn");
  }

  static init() {
    console.log("[SettingsManager] init triggered");
    const existingModal = document.getElementById("settingsModal");

    if (!existingModal) {
      this.injectSettingsModal();
    }

    // Expose global control functions
    window.openSettings = () => {
      const modal = document.getElementById("settingsModal");
      if (modal) {
        // Sync UI state before showing
        const currentMode =
          localStorage.getItem("lifeflow_theme_mode") || "auto";
        SettingsManager.updateUI(currentMode);

        modal.classList.remove("hidden");
        modal.classList.add("flex");

        // Trigger animation
        const content = modal.querySelector(".modal-content");
        if (content) {
          content.classList.remove("scale-95", "opacity-0");
          content.classList.add("scale-100", "opacity-100");
        }
      }
    };

    window.closeSettings = () => {
      const modal = document.getElementById("settingsModal");
      if (modal) {
        const content = modal.querySelector(".modal-content");
        if (content) {
          content.classList.add("scale-95", "opacity-0");
          content.classList.remove("scale-100", "opacity-100");
        }
        setTimeout(() => {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }, 200);
      }
    };

    // Initialize Notification Toggle Logic
    this.initNotifications();

    // Global Shortcuts
    window.addEventListener("keydown", (e) => {
      // Don't trigger if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;

      // Cmd + , or Ctrl + ,
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        window.openSettings();
        return;
      }

      // ESC to close
      if (e.key === "Escape") {
        const modal = document.getElementById("settingsModal");
        if (modal && !modal.classList.contains("hidden")) {
          window.closeSettings();
        }
      }
    });

    // Initial UI Sync
    const currentMode = localStorage.getItem("lifeflow_theme_mode") || "auto";
    SettingsManager.updateUI(currentMode);
  }

  static initNotifications() {
    const toggle = document.getElementById("notifToggle");
    if (!toggle) return;

    // Set initial state
    const status = localStorage.getItem("lifeflow_notif_enabled") === "true";
    toggle.checked = status;

    toggle.onchange = async (e) => {
      const enabled = e.target.checked;
      if (enabled && Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          e.target.checked = false;
          alert("Notification permission denied.");
          return;
        }
      }
      localStorage.setItem("lifeflow_notif_enabled", enabled);
      console.log("[Settings] Notifications", enabled ? "enabled" : "disabled");
    };

    // Add Test Notification logic
    window.sendTestNotification = async () => {
      console.log("[Settings] Manual test notification triggered");
      if (typeof window.showNotification === "function") {
        window.showNotification(
          "Test Notification",
          "This is a test notification from LifeFlow Settings."
        );
      } else {
        // Fallback if lifeflow.html logic isn't available
        if (Notification.permission === "granted") {
          new Notification("LifeFlow Test", {
            body: "Test notification (Direct)",
            requireInteraction: true,
          });
        } else {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            new Notification("LifeFlow Test", {
              body: "Test notification (After Permission)",
              requireInteraction: true,
            });
          } else {
            alert("Notification permission not granted.");
          }
        }
      }
    };
  }

  static injectSettingsModal() {
    const modal = document.createElement("div");
    modal.id = "settingsModal";
    modal.className =
      "fixed inset-0 z-[100] hidden items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300";

    modal.innerHTML = `
            <div class="modal-content w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-500 scale-95 opacity-0">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 transition-colors duration-500">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i class="fas fa-cog text-blue-500"></i> Settings
                    </h3>
                    <button onclick="window.closeSettings()" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div class="p-6 space-y-8 transition-colors duration-500">
                    <!-- Theme Section -->
                    <section>
                        <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Appearance</label>
                        <div class="grid grid-cols-3 gap-3">
                            <button id="themeBtn-light" onclick="window.setGlobalTheme('light')" class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 group">
                                <div class="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
                                    <i class="fas fa-sun"></i>
                                </div>
                                <span class="text-xs font-medium dark:text-slate-300">Light</span>
                            </button>
                            <button id="themeBtn-dark" onclick="window.setGlobalTheme('dark')" class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 group">
                                <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 flex items-center justify-center group-hover:scale-110 transition">
                                    <i class="fas fa-moon"></i>
                                </div>
                                <span class="text-xs font-medium dark:text-slate-300">Dark</span>
                            </button>
                            <button id="themeBtn-auto" onclick="window.setGlobalTheme('auto')" class="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 group">
                                <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
                                    <i class="fas fa-desktop"></i>
                                </div>
                                <span class="text-xs font-medium dark:text-slate-300">System</span>
                            </button>
                        </div>
                    </section>

                    <!-- Notifications -->
                    <section>
                         <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Other Settings</label>
                             <div class="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                            <i class="fas fa-bell"></i>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-900 dark:text-white">Notifications</div>
                                            <p class="text-[10px] text-slate-500">Show alerts when timers finish</p>
                                        </div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" id="notifToggle" class="sr-only peer">
                                        <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                                <button onclick="window.sendTestNotification()" class="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
                                    Test Notification
                                </button>
                            </div>
                    </section>
                </div>

                <!-- Footer -->
                <div class="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center rounded-b-2xl">
                    <p class="text-[10px] text-slate-400 mt-2 italic">LocalForge v1.2 &bull; Your data is stored locally in the browser</p>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Click outside to close
    modal.onclick = (e) => {
      if (e.target === modal) window.closeSettings();
    };
  }
}
// ...
class LocalHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["title", "theme", "back-link"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute("title") || "LocalForge";
    const backLink = this.getAttribute("back-link") || "index.html";
    const theme = this.getAttribute("theme") || "light";
    const isDark = theme === "dark";

    this.shadowRoot.innerHTML = `
        <style>
            @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
            :host {
                display: block;
                width: 100%;
                z-index: 50;
            }
            a { text-decoration: none; color: inherit; }
            
            .header-inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 4rem;
                padding: 0 1.5rem;
                background-color: ${
                  isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(255, 255, 255, 0.8)"
                };
                backdrop-filter: blur(8px);
                border-bottom: 1px solid ${
                  isDark ? "rgba(51, 65, 85, 1)" : "rgba(226, 232, 240, 1)"
                };
                color: ${isDark ? "#f8fafc" : "#0f172a"};
                transition: all 0.3s ease;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 1rem;
                flex-shrink: 0;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .header-left:hover { opacity: 0.8; }

            .title {
                font-size: 1.25rem;
                font-weight: 700;
                letter-spacing: -0.025em;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
                flex-shrink: 0;
            }

            /* Slot styling for icon */
            ::slotted([slot="icon"]) {
                font-size: 1.5rem !important; /* Ensure icon is not too small */
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Handle FontAwesome icons in slot */
            ::slotted(i) {
                width: 1.5rem;
                text-align: center;
            }
        </style>

        <header>
            <div class="header-inner">
                <a href="${backLink}" class="header-left">
                    <slot name="icon"><i class="fas fa-cube" style="color: #3b82f6; font-size: 1.5rem;"></i></slot>
                    <span class="title">${title}</span>
                </a>
                <div class="header-right">
                    <slot name="actions"></slot>
                </div>
            </div>
        </header>
        `;
  }
}

class LocalSidebar extends HTMLElement {
  constructor() {
    super();
    this.isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.highlightActiveLink();
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem("sidebar-collapsed", this.isCollapsed);
    this.render();
    this.setupEventListeners(); // Re-bind events after re-render
    this.highlightActiveLink();
  }

  highlightActiveLink() {
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const links = this.querySelectorAll("a, button[data-link]");

    links.forEach((link) => {
      const href = link.getAttribute("href") || link.getAttribute("data-link");
      if (href === currentPath) {
        link.classList.add(
          "bg-indigo-50",
          "dark:bg-slate-800",
          "text-indigo-600",
          "dark:text-white"
        );
        link.classList.remove("text-slate-500", "dark:text-slate-400");
        const icon = link.querySelector("i");
        if (icon) {
          // Find the color class in the icon (e.g., group-hover:text-blue-400) and apply it
          const colorClass = Array.from(icon.classList).find(
            (c) => c.startsWith("text-") && !c.includes("slate")
          );
          if (!colorClass) {
            // Fallback: try to match from group-hover
            const hoverClass = Array.from(icon.classList).find((c) =>
              c.includes("group-hover:text-")
            );
            if (hoverClass) {
              icon.classList.add(hoverClass.replace("group-hover:", ""));
            }
          }
        }
      }
    });
  }

  setupEventListeners() {
    const toggleBtns = this.querySelectorAll(".sidebar-toggle-btn");
    toggleBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        this.toggle();
      };
    });
  }

  render() {
    const widthClass = this.isCollapsed ? "w-20" : "w-64";
    const hideTextClass = this.isCollapsed ? "hidden" : "block";
    const justifyClass = this.isCollapsed ? "justify-center" : "";
    const iconMargin = this.isCollapsed ? "mr-0" : "mr-3";
    const toggleIcon = this.isCollapsed
      ? "fa-chevron-right"
      : "fa-chevron-left";

    this.className = `flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${widthClass} h-screen sticky top-0 z-40 shrink-0`;

    this.innerHTML = `
            <!-- Sidebar Header -->
            <div class="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <a href="index.html" class="flex items-center gap-3 overflow-hidden whitespace-nowrap ${
                  this.isCollapsed ? "justify-center w-full" : ""
                }">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <i class="fas fa-layer-group text-white text-sm"></i>
                    </div>
                    <span class="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100 ${hideTextClass}">LocalForge</span>
                </a>
                <button class="sidebar-toggle-btn text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition p-1 ${
                  this.isCollapsed ? "hidden" : "block"
                }">
                    <i class="fas ${toggleIcon}"></i>
                </button>
            </div>

            <!-- Toggle Button (Visible only when collapsed, centered) -->
            ${
              this.isCollapsed
                ? `
            <button class="sidebar-toggle-btn mx-auto mt-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition p-2">
                <i class="fas ${toggleIcon}"></i>
            </button>
            `
                : ""
            }

            <!-- Nav Items -->
            <nav class="flex-1 overflow-y-auto py-4 overflow-x-hidden custom-scrollbar">
                <ul class="space-y-1 px-2">
                    <li>
                        <a href="index.html" class="flex items-center px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-home w-6 text-center shrink-0 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass} font-medium">Home Overview</span>
                        </a>
                    </li>

                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 whitespace-nowrap ${hideTextClass}">
                        Media Tools
                    </div>
                    <!-- Separator for collapsed mode -->
                    ${
                      this.isCollapsed
                        ? '<div class="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-4"></div>'
                        : ""
                    }

                    <li>
                        <a href="image_editor.html" class="flex items-center px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-image w-6 text-center shrink-0 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">Image Editor</span>
                        </a>
                    </li>
                    <li>
                        <a href="image_resize.html" class="flex items-center px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-compress-alt w-6 text-center shrink-0 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">Image Resize</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <!-- Bottom Settings -->
            <div class="p-2 border-t border-slate-200 dark:border-slate-800">
                <button onclick="window.openSettings && window.openSettings()" 
                    class="w-full flex items-center px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                    <i class="fas fa-cog w-6 text-center shrink-0 ${iconMargin}"></i>
                    <span class="${hideTextClass}">Settings</span>
                </button>
            </div>
        `;
  }
}

customElements.define("local-header", LocalHeader);
customElements.define("local-sidebar", LocalSidebar);

// Initialize Global Theme Management
window.ThemeManager = ThemeManager;
window.SettingsManager = SettingsManager;
ThemeManager.init();
