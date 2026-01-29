# LocalForge Development Guide

This document provides standardized development specifications for adding new tools to the LocalForge project. Following these guidelines ensures consistency across architecture, UI, and data persistence.

## 1. Directory Structure

All new tools should follow this file organization:

```text
LocalForge/
├── your_tool_name.html      # Tool entry HTML
├── js/
│   ├── components.js        # [Shared] UI Components (Header, Sidebar, Theme)
│   └── db-client.js         # [Shared] Database Client
├── css/
│   └── style.css            # [Shared] Global Styles
└── docs/
    └── images/              # Screenshots and documentation assets
```

## 2. HTML Template Standards

### 2.1 Complete Head Section Template

Use this complete template for all new tools to ensure consistency:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tool Name - LocalForge</title>
  
  <!-- DNS Prefetch for Performance -->
  <link rel="preconnect" href="https://cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">
  <link rel="preconnect" href="https://cdnjs.cloudflare.com">
  <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
  
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="favicon.png">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com" defer></script>
  <script>
    window.tailwindConfig = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            slate: {
              850: '#1e293b',
            }
          }
        }
      }
    };
    
    Object.defineProperty(window, 'tailwind', {
      configurable: true,
      set: function(tw) {
        Object.defineProperty(window, 'tailwind', {
          value: tw,
          writable: true,
          configurable: true
        });
        tw.config = window.tailwindConfig;
      }
    });
  </script>
  
  <!-- FontAwesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  
  <!-- Global Styles -->
  <link rel="stylesheet" href="css/style.css">
  
  <!-- Tool-Specific Styles -->
  <style>
    /* Your tool-specific CSS here */
  </style>
  
  <!-- Shared Components -->
  <script type="module" src="js/components.js"></script>
  
  <!-- Anti-Flicker for Web Components -->
  <style>
    local-sidebar:not(:defined),
    local-header:not(:defined) {
      opacity: 0;
    }
    
    local-sidebar:defined,
    local-header:defined {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Theme Support */
    html {
      color-scheme: light dark;
    }
    
    html.dark {
      color-scheme: dark;
    }
    
    /* Smooth Transitions */
    *, *::before, *::after {
      transition: background-color 0.3s ease, 
                  border-color 0.3s ease, 
                  color 0.3s ease,
                  fill 0.3s ease,
                  stroke 0.3s ease;
    }
    
    /* Disable transitions during load */
    .preload * {
      transition: none !important;
    }
  </style>
  
  <!-- Early Theme Detection -->
  <script>
    (function() {
      const savedMode = localStorage.getItem('lifeflow_theme_mode') || 'auto';
      let isDark = false;
      
      if (savedMode === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = savedMode === 'dark';
      }
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  </script>
</head>
```

### 2.2 Body Layout

```html
<body class="preload bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans h-screen flex overflow-hidden transition-colors duration-300">
  
  <!-- Remove preload class after load -->
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        document.body.classList.remove('preload');
      }, 100);
    });
  </script>

  <!-- 1. Global Sidebar -->
  <local-sidebar></local-sidebar>

  <!-- 2. Main Content Wrapper -->
  <div class="flex-1 flex flex-col min-w-0">

    <!-- 3. Tool Header -->
    <local-header title="Tool Name">
      <i slot="icon" class="fas fa-tools text-blue-500"></i>
      <div slot="actions" class="text-xs text-slate-500 dark:text-slate-400">
        Tool description here
      </div>
    </local-header>

    <!-- 4. Scrollable Content Area -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Your tool content here -->
    </div>
  </div>

  <!-- 5. Business Logic -->
  <script>
    // Your tool JavaScript here
  </script>
</body>
</html>
```

## 3. Key Guidelines

### 3.1 Theme Support (Required)

All tools MUST support both light and dark modes:

- Use `dark:` prefixes for dark mode specific styles
- Test both modes during development
- Colors should have sufficient contrast in both modes

**Example:**
```html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
```

### 3.2 Icon Colors

Assign a unique accent color to each tool for visual distinction:

```html
<!-- Media Tools: Blue/Purple/Green -->
<i class="fas fa-image text-blue-500"></i>
<i class="fas fa-compress-alt text-purple-500"></i>
<i class="fas fa-exchange-alt text-green-500"></i>

<!-- Document Tools: Red/Amber/Emerald -->
<i class="fas fa-file-pdf text-red-500"></i>
<i class="fas fa-code text-amber-500"></i>
<i class="fas fa-table text-emerald-500"></i>

<!-- Developer Tools: Indigo/Cyan/Rose -->
<i class="fas fa-qrcode text-indigo-500"></i>
<i class="fas fa-code text-cyan-500"></i>
<i class="fas fa-search text-rose-500"></i>

<!-- Utilities: Violet/Teal -->
<i class="fas fa-key text-violet-500"></i>
<i class="fas fa-clock text-teal-500"></i>
```

### 3.3 Drag & Drop Support

For file handling tools, implement consistent drag-and-drop zones:

```html
<div class="drop-zone border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition">
  <i class="fas fa-cloud-upload-alt text-4xl text-blue-500 mb-4"></i>
  <p class="text-slate-600 dark:text-slate-400">Drop files here or click to select</p>
  <input type="file" class="hidden" accept=".pdf,.jpg,.png">
</div>
```

```javascript
const dropZone = document.querySelector('.drop-zone');
const fileInput = document.querySelector('input[type="file"]');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
```

### 3.4 CDN Libraries

When adding third-party libraries, prefer CDN links:

```html
<!-- PDF Processing -->
<script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>

<!-- CSV Parsing -->
<script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>

<!-- GIF Creation -->
<script src="https://unpkg.com/gifshot@0.4.5/dist/gifshot.min.js"></script>

<!-- QR Codes -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

## 4. Registering Navigation

### 4.1 Update Sidebar (js/components.js)

Add your tool to the appropriate category in `LocalSidebar.render()`:

```javascript
// Find the appropriate category section and add:
<li>
  <a href="your_tool.html" class="flex items-center px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition whitespace-nowrap group ${justifyClass}">
    <i class="fas fa-icon-name w-6 text-center shrink-0 group-hover:text-accent-color dark:group-hover:text-accent-color transition ${iconMargin}"></i>
    <span class="${hideTextClass}">Tool Name</span>
  </a>
</li>
```

### 4.2 Update Dashboard (index.html)

Add a card to the dashboard in the appropriate section:

```html
<!-- Tool Name -->
<a href="your_tool.html"
  class="group p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer relative overflow-hidden block shadow-sm dark:shadow-none">
  <div class="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition">
  </div>
  <div class="w-10 h-10 rounded-lg bg-accent-500/10 text-accent-400 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
    <i class="fas fa-icon-name"></i>
  </div>
  <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Tool Name</h3>
  <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Brief description.</p>
</a>
```

## 5. UI/UX Style Guide

### 5.1 Color Palette

**Backgrounds:**
- Light mode: `bg-slate-50` (main), `bg-white` (cards)
- Dark mode: `bg-slate-900` (main), `bg-slate-800` (cards)

**Text:**
- Light mode: `text-slate-900` (primary), `text-slate-500` (secondary)
- Dark mode: `text-slate-100` (primary), `text-slate-400` (secondary)

**Borders:**
- Light mode: `border-slate-200`
- Dark mode: `border-slate-700`

### 5.2 Typography

- Body: Default sans-serif (Tailwind's font-sans)
- Code/Monospace: `font-mono` with `'Consolas', 'Monaco', 'Courier New'`
- Labels: `text-xs font-bold uppercase tracking-wider text-slate-500`

### 5.3 Spacing & Layout

- Card padding: `p-5` or `p-6`
- Section gaps: `space-y-6` or `gap-4`
- Border radius: `rounded-xl` (cards), `rounded-lg` (buttons)
- Shadows: `shadow-sm` (subtle), `shadow-lg` (elevated)

### 5.4 Interactions

All interactive elements should have:
- Hover states: `hover:bg-slate-100 dark:hover:bg-slate-700`
- Transitions: `transition` or `transition-all duration-300`
- Cursor: `cursor-pointer` for clickable elements

## 6. Keyboard Shortcuts

If your tool supports keyboard shortcuts, document them:

```javascript
window.addEventListener('keydown', (e) => {
  // Don't trigger if user is typing in an input
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
  
  if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    saveFile();
  }
});
```

Update the shortcuts table in README.md:

```markdown
| **Your Tool** | `Cmd/Ctrl` + `S` | Save file |
| **Your Tool** | `Delete` | Remove selected item |
```

## 7. Testing Checklist

Before submitting a new tool, verify:

- [ ] Works in both light and dark modes
- [ ] Responsive layout (test at different window sizes)
- [ ] Sidebar navigation works correctly
- [ ] Settings panel opens/closes properly
- [ ] No console errors
- [ ] File operations work (drag & drop, if applicable)
- [ ] Theme persists after page reload
- [ ] Tool appears correctly on dashboard

## 8. Performance Tips

1. **CDN Resources**: Use `defer` for scripts that don't block rendering
2. **Images**: Optimize screenshots for docs/ folder
3. **Debouncing**: Use debounce for input-heavy tools
4. **Lazy Loading**: Load heavy libraries only when needed

## 9. Example: Minimal Tool Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tool - LocalForge</title>
  
  <link rel="preconnect" href="https://cdn.tailwindcss.com">
  <link rel="dns-prefetch" href="https://cdn.tailwindcss.com">
  <link rel="icon" type="image/png" href="favicon.png">
  
  <script src="https://cdn.tailwindcss.com" defer></script>
  <script>
    window.tailwindConfig = {
      darkMode: 'class',
      theme: { extend: { colors: { slate: { 850: '#1e293b' } } } }
    };
    Object.defineProperty(window, 'tailwind', {
      configurable: true,
      set: function(tw) {
        Object.defineProperty(window, 'tailwind', { value: tw, writable: true, configurable: true });
        tw.config = window.tailwindConfig;
      }
    });
  </script>
  
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  
  <script type="module" src="js/components.js"></script>
  
  <style>
    local-sidebar:not(:defined), local-header:not(:defined) { opacity: 0; }
    local-sidebar:defined, local-header:defined { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    html { color-scheme: light dark; }
    html.dark { color-scheme: dark; }
    *, *::before, *::after { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; }
    .preload * { transition: none !important; }
  </style>
  
  <script>
    (function() {
      const savedMode = localStorage.getItem('lifeflow_theme_mode') || 'auto';
      let isDark = savedMode === 'dark' || (savedMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    })();
  </script>
</head>

<body class="preload bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-sans h-screen flex overflow-hidden transition-colors duration-300">
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { document.body.classList.remove('preload'); }, 100);
    });
  </script>

  <local-sidebar></local-sidebar>

  <div class="flex-1 flex flex-col min-w-0">
    <local-header title="My Tool">
      <i slot="icon" class="fas fa-wrench text-blue-500"></i>
      <div slot="actions" class="text-xs text-slate-500 dark:text-slate-400">Tool description</div>
    </local-header>

    <main class="flex-1 overflow-y-auto p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Tool content here -->
        <h1 class="text-2xl font-bold mb-4">Welcome to My Tool</h1>
        <p class="text-slate-600 dark:text-slate-400">Your tool content goes here.</p>
      </div>
    </main>
  </div>

  <script>
    // Your tool logic here
    console.log('My Tool loaded');
  </script>
</body>
</html>
```

## 10. Submitting Changes

1. Test your tool thoroughly
2. Update README.md with the new tool description
3. Update this CONTRIBUTING.md if you added new patterns
4. Add a screenshot to `docs/images/` (optional but recommended)
5. Verify all existing tools still work

---

**Questions?** Check existing tools in the project for reference implementations.
