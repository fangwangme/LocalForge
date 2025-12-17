
class LocalHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'back-link'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'LocalForge';
        const backLink = this.getAttribute('back-link') || 'index.html';

        this.shadowRoot.innerHTML = `
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
            :host {
                display: block;
                width: 100%;
                z-index: 50;
            }
            .header-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 1rem;
                height: 3.5rem; /* h-14 */
                background-color: rgba(15, 23, 42, 0.8); /* bg-slate-900/80 */
                backdrop-filter: blur(4px); /* backdrop-blur-sm */
                border-bottom: 1px solid #334155; /* border-slate-700 */
                position: sticky;
                top: 0;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.125rem; /* text-lg */
                font-weight: 700;
                color: #f8fafc; /* text-white */
                text-decoration: none;
                transition: opacity 0.2s;
            }
            .brand:hover {
                opacity: 0.8;
            }
            .actions {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
        </style>

        <header class="header-container">
            <a href="${backLink}" class="brand">
                <slot name="icon"><i class="fas fa-cube text-blue-500"></i></slot>
                ${title}
            </a>
            <div class="actions">
                <slot name="actions"></slot>
            </div>
        </header>
        `;
    }
}

class LocalSidebar extends HTMLElement {
    constructor() {
        super();
        this.isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.highlightActiveLink();
    }

    toggle() {
        this.isCollapsed = !this.isCollapsed;
        localStorage.setItem('sidebar-collapsed', this.isCollapsed);
        this.render();
        this.setupEventListeners(); // Re-bind events after re-render
        this.highlightActiveLink();
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const links = this.querySelectorAll('a, button[data-link]');
        
        links.forEach(link => {
            const href = link.getAttribute('href') || link.getAttribute('data-link');
            if (href === currentPath) {
                link.classList.add('bg-slate-800', 'text-white');
                link.classList.remove('text-slate-400');
                const icon = link.querySelector('i');
                if (icon) {
                    // Find the color class in the icon (e.g., group-hover:text-blue-400) and apply it
                    const colorClass = Array.from(icon.classList).find(c => c.startsWith('text-') && !c.includes('slate'));
                    if (!colorClass) {
                         // Fallback: try to match from group-hover
                         const hoverClass = Array.from(icon.classList).find(c => c.includes('group-hover:text-'));
                         if (hoverClass) {
                             icon.classList.add(hoverClass.replace('group-hover:', ''));
                         }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        const toggleBtns = this.querySelectorAll('.sidebar-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                this.toggle();
            };
        });
    }

    render() {
        const widthClass = this.isCollapsed ? 'w-20' : 'w-64';
        const hideTextClass = this.isCollapsed ? 'hidden' : 'block';
        const justifyClass = this.isCollapsed ? 'justify-center' : '';
        const iconMargin = this.isCollapsed ? 'mr-0' : 'mr-3';
        const toggleIcon = this.isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left';

        this.className = `flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${widthClass} h-screen sticky top-0 z-40 shrink-0`;

        this.innerHTML = `
            <!-- Sidebar Header -->
            <div class="h-14 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
                <a href="index.html" class="flex items-center gap-3 overflow-hidden whitespace-nowrap ${this.isCollapsed ? 'justify-center w-full' : ''}">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                        <i class="fas fa-layer-group text-white text-sm"></i>
                    </div>
                    <span class="font-bold text-lg tracking-tight text-slate-100 ${hideTextClass}">LocalForge</span>
                </a>
                <button class="sidebar-toggle-btn text-slate-500 hover:text-white transition p-1 ${this.isCollapsed ? 'hidden' : 'block'}">
                    <i class="fas ${toggleIcon}"></i>
                </button>
            </div>

            <!-- Toggle Button (Visible only when collapsed, centered) -->
            ${this.isCollapsed ? `
            <button class="sidebar-toggle-btn mx-auto mt-2 text-slate-500 hover:text-white transition p-2">
                <i class="fas ${toggleIcon}"></i>
            </button>
            ` : ''}

            <!-- Nav Items -->
            <nav class="flex-1 overflow-y-auto py-4 overflow-x-hidden custom-scrollbar">
                <ul class="space-y-1 px-2">
                    <li>
                        <a href="index.html" class="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-home w-6 text-center shrink-0 group-hover:text-blue-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass} font-medium">主页概览</span>
                        </a>
                    </li>

                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 whitespace-nowrap ${hideTextClass}">
                        媒体工具
                    </div>
                    <!-- Separator for collapsed mode -->
                    ${this.isCollapsed ? '<div class="h-px bg-slate-800 my-2 mx-4"></div>' : ''}

                    <li>
                        <a href="image_editor.html" class="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-image w-6 text-center shrink-0 group-hover:text-purple-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">图片编辑器</span>
                        </a>
                    </li>
                    <li>
                        <a href="image_resize.html" class="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-compress-alt w-6 text-center shrink-0 group-hover:text-pink-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">图片压缩</span>
                        </a>
                    </li>

                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 whitespace-nowrap ${hideTextClass}">
                        健身运动
                    </div>
                     ${this.isCollapsed ? '<div class="h-px bg-slate-800 my-2 mx-4"></div>' : ''}

                    <li>
                        <a href="hiit_jump_rope.html" class="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-stopwatch w-6 text-center shrink-0 group-hover:text-rose-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">HIIT 计时器</span>
                        </a>
                    </li>

                    <div class="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 whitespace-nowrap ${hideTextClass}">
                        效率工具
                    </div>
                     ${this.isCollapsed ? '<div class="h-px bg-slate-800 my-2 mx-4"></div>' : ''}

                    <li>
                        <a href="pomodoro.html" class="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                            <i class="fas fa-clock w-6 text-center shrink-0 group-hover:text-red-400 transition ${iconMargin}"></i>
                            <span class="${hideTextClass}">番茄钟</span>
                        </a>
                    </li>
                </ul>
            </nav>

            <!-- Bottom Settings -->
            <div class="p-2 border-t border-slate-800">
                <button onclick="window.openSettings ? window.openSettings() : alert('请在主页进行设置')" 
                    class="w-full flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
                    <i class="fas fa-cog w-6 text-center shrink-0 ${iconMargin}"></i>
                    <span class="${hideTextClass}">设置</span>
                </button>
            </div>
        `;
    }
}

customElements.define('local-header', LocalHeader);
customElements.define('local-sidebar', LocalSidebar);
