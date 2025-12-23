# LocalForge (HTML Tools)

![LocalForge Hero Banner](docs/images/hero.png)

LocalForge is a **Local-First** Web toolset powered by **SharedWorker + sql.js**. It provides a collection of independent HTML-based tools that share a single local SQLite database, with data secondary-synced to your local file system for privacy and speed.

## 🏗 Architecture

- **Multi-Page Application (MPA)**: Each tool (LifeFlow, HIIT Timer, etc.) is a standalone HTML file, ensuring light weight and modularity.
- **SharedWorker Context**: `js/shared-db-worker.js` acts as the central engine, hosting the in-memory `sql.js` database instance. All open tabs connect to this worker for real-time state synchronization across pages.
- **Single-Writer Pattern**: To ensure file integrity, the system coordinates a "Writer" role via `js/db-client.js`. Only one active tab (usually the dashboard or the most recently used tool) handles the File System Access API to sync in-memory data back to your local `.sqlite` file.
- **Web Components**: Reusable UI elements (`<local-header>`, `<local-sidebar>`) provide a consistent navigation and aesthetic experience.

## 🌟 Feature Showcase

### LifeFlow
A personal life log to track your every moment. Features a Pomodoro-style timer and quick manual logging with customizable tags.

<div style="display: flex; gap: 10px;">
  <img src="docs/images/lifeflow%20timer.png" width="48%" alt="LifeFlow Timer" />
  <img src="docs/images/lifeflow%20stats.png" width="48%" alt="LifeFlow Stats" />
</div>

### HIIT Timer
High-Intensity Interval Training timer with custom intervals, rounds, and visual progress tracking. Includes a detailed stats view.

![HIIT Workout](docs/images/hiit%20jump.png)

### Image Editor
Precision cropping (16:9), intelligent watermark removal, and format conversion.

![Image Editor](docs/images/image%20editor.png)

### Image Resize
A pure client-side image compressor with custom target size and format options.

## ⌨️ Keyboard Shortcuts

| Scope | Key(s) | Action |
| :--- | :--- | :--- |
| **Global** | `Cmd/Ctrl` + `,` | Open Settings |
| **Global** | `Esc` | Close Settings / Modals |
| **Image Editor** | `Arrow Left/Right` | Switch Image |
| **Image Editor** | `S` | Save processed image |
| **Image Editor** | `O` | Save original image |
| **Image Editor** | `G` | Auto Remove Watermark (Gemini) |
| **Image Editor** | `C` | Clear Selection |
| **HIIT Timer** | `S` | Open Stats |
| **LifeFlow** | `S` | Open Stats |
| **LifeFlow** | `T` | Open Tags Management |

## 🚀 Quick Start

### 1. Start Support
You can manage the server using standard `npm` commands:

```bash
npm start        # Starts Production Server (Port 8092, Auto-opens Browser)
npm run debug    # Starts Debug Server (Port 8093, Logs to data/debug.log)
npm stop         # Stops all running servers
npm run status   # Checks status of Production and Debug servers
```

Alternatively, you can run the script directly:
```bash
./start_server.sh start      # Production mode
./start_server.sh --debug    # Debug mode
```

### 2. Access
Open your browser and go to `http://localhost:8092`.

### 3. Database Setup (Important)
LocalForge maintains its own database file within the project directory.

1.  Click **"Settings & Database"** on the dashboard.
2.  Click **"Authorize Project Folder"**.
3.  Select the root **`LocalForge/`** directory.
4.  The system will automatically detect or create `data/html_tools_db.sqlite` and persist your data there.

## 💻 Development

For detailed guidelines on adding new tools, please refer to [CONTRIBUTING.md](docs/CONTRIBUTING.md).

### Basic Workflow:
1.  **Template**: Copy the structure of an existing HTML tool.
2.  **Modules**: Import `js/components.js` and `js/db-client.js`.
3.  **DB Integration**:
    ```javascript
    import { db } from './js/db-client.js';
    
    // Initialize tables
    await db.execute("CREATE TABLE IF NOT EXISTS ...");
    
    // Query data
    const res = await db.query("SELECT * FROM ...");
    ```
4.  **Navigation**: Register your tool in `js/components.js` to add it to the sidebar.

## 🛠 Tech Stack

*   **Frontend**: Vanilla HTML5 / JavaScript (ES6+ Modules)
*   **Database**: [sql.js](https://sql.js.org/) (WebAssembly SQLite)
*   **State Sync**: SharedWorker API
*   **Styling**: Tailwind CSS (CDN) + FontAwesome
*   **Charts**: Chart.js

## 📄 License

MIT