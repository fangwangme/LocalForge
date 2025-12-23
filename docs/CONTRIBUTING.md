# LocalForge Development Guide

This document provides standardized development specifications for adding new tools to the LocalForge project. Following these guidelines ensures consistency across architecture, UI, and data persistence.

## 1. Directory Structure

All new tools should follow this file organization:

```text
LocalForge/
├── your_tool_name.html      # Tool entry HTML
├── js/
│   ├── your_tool_name.js    # Core logic (optional, can be inline)
│   ├── components.js        # [Shared] UI Components (Header, Sidebar)
│   └── db-client.js         # [Shared] Database Client
├── css/
│   └── style.css            # [Shared] Global Styles
```

## 2. HTML Template Standards

### 2.1 Head Section

Must include Tailwind CSS, FontAwesome, global styles, and the component script.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tool Name - LocalForge</title>
    
    <!-- Dependencies -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Core Styles & Components -->
    <link rel="stylesheet" href="css/style.css">
    <script type="module" src="js/components.js"></script>
</head>
```

### 2.2 Body Layout

Use Flexbox to support the global sidebar.

```html
<body class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans h-screen flex overflow-hidden">
    
    <!-- 1. Global Sidebar -->
    <local-sidebar></local-sidebar>

    <!-- 2. Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 relative">
        
        <!-- 3. Tool Header -->
        <local-header title="Tool Name">
            <!-- Icon (slot="icon") -->
            <i slot="icon" class="fas fa-tools text-blue-500"></i>
            
            <!-- Navbar Actions (slot="actions") -->
            <div slot="actions" class="flex items-center gap-2">
                <button id="myActionBtn" class="...">Action</button>
            </div>
        </local-header>

        <!-- 4. Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto">
            <main class="max-w-4xl mx-auto px-4 py-8">
                <!-- Your tool UI code here -->
            </main>
        </div>
    </div>
    
    <!-- 5. Business Logic -->
    <script type="module" src="js/your_tool_name.js"></script>
</body>
</html>
```

## 3. Database Integration

If your tool requires data persistence, use `js/db-client.js`.

### 3.1 Initialization

In your tool's script:

```javascript
import { db } from './js/db-client.js';

// Listen for Database Ready event
db.on('db_opened', async () => {
    await initSchema();
    await loadData();
});

// If the DB is already open (e.g., navigated from another tool)
if (db.isOpen) {
    initSchema();
    loadData();
}
```

### 3.2 Schema Definition

Tools are responsible for managing their own tables. Use `IF NOT EXISTS` to avoid conflicts.

```javascript
async function initSchema() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS my_tool_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            created_at TEXT
        )
    `);
}
```

### 3.3 Data Operations

Use `db.query()` to fetch data and `db.execute()` to modify it.

```javascript
// Query
const results = await db.query("SELECT * FROM my_tool_data ORDER BY created_at DESC");

// Insert/Update
await db.execute(
    "INSERT INTO my_tool_data (content, created_at) VALUES (?, ?)", 
    ["Hello World", new Date().toISOString()]
);
```

**Note**: Changes are automatically synced to IndexedDB and the local file system backup by the background coordination service.

## 4. Registering Navigation

To add your tool to the sidebar, modify the `LocalSidebar` class in `js/components.js`:

1.  Open `js/components.js`.
2.  Find the `navItems` array or the template in the `render()` method.
3.  Add your tool's link:

```html
<li>
    <a href="your_tool_name.html" class="flex items-center px-4 py-3 ... group">
        <i class="fas fa-tools w-6 text-center ... group-hover:text-amber-400"></i>
        <span>Tool Name</span>
    </a>
</li>
```

## 5. UI/UX Style Guide

*   **Color Palette**: Use Tailwind Slate shades for Dark Mode (`bg-slate-900`, `text-slate-300`) and Slate-50 for Light Mode.
*   **Accents**: Use meaningful colors (Blue for info, Rose for errors/timers, Emerald for success).
*   **Interactions**: Ensure all buttons have `hover` states and smooth `transition-all`.
*   **Scrollbars**: Custom themed scrollbars are handled globally via `css/style.css`.
