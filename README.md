# LocalForge (HTML Tools)

![LocalForge Hero Banner](docs/images/hero.png)

LocalForge is a **Local-First** Web toolset powered by **SharedWorker + sql.js**. It provides a collection of independent HTML-based tools that share a single local SQLite database, with data secondary-synced to your local file system for privacy and speed.

## 🏗 Architecture

- **Multi-Page Application (MPA)**: Each tool is a standalone HTML file, ensuring light weight and modularity.
- **Web Components**: Reusable UI elements (`<local-header>`, `<local-sidebar>`) provide a consistent navigation and aesthetic experience.

## 🌟 Feature Showcase

### Image Editor

Precision cropping (16:9), intelligent watermark removal, and format conversion.

![Image Editor](docs/images/image%20editor.png)

### Image Resize

A pure client-side image compressor with custom target size and format options.

## ⌨️ Keyboard Shortcuts

| Scope            | Key(s)             | Action                         |
| :--------------- | :----------------- | :----------------------------- |
| **Global**       | `Cmd/Ctrl` + `,`   | Open Settings                  |
| **Global**       | `Esc`              | Close Settings / Modals        |
| **Image Editor** | `Arrow Left/Right` | Switch Image                   |
| **Image Editor** | `S`                | Save processed image           |
| **Image Editor** | `O`                | Save original image            |
| **Image Editor** | `G`                | Auto Remove Watermark (Gemini) |
| **Image Editor** | `C`                | Clear Selection                |

### 1. Access

Open `index.html` directly in your browser. No server required for basic usage.

## 💻 Development

For detailed guidelines on adding new tools, please refer to [CONTRIBUTING.md](docs/CONTRIBUTING.md).

### Basic Workflow:

1.  **Template**: Copy the structure of an existing HTML tool.
2.  **Modules**: Import `js/components.js`.
3.  **Navigation**: Register your tool in `js/components.js` to add it to the sidebar.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5 / JavaScript (ES6+ Modules)
- **Database**: Local Storage (Settings)
- **Styling**: Tailwind CSS (CDN) + FontAwesome
- **Charts**: Chart.js

## 📄 License

MIT
