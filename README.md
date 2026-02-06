# LocalForge (HTML Tools)
[tools.fangwang.me](https://tools.fangwang.me)

LocalForge is a **Local-First** Web toolset powered by **Vanilla HTML5/ES6+**. It provides a collection of independent HTML-based tools that run entirely in your browser with no backend required.

## 🏗 Architecture

- **Multi-Page Application (MPA)**: Each tool is a standalone HTML file, ensuring light weight and modularity.
- **Web Components**: Reusable UI elements (`<local-header>`, `<local-sidebar>`) provide a consistent navigation and aesthetic experience.
- **Theme Support**: Full dark/light mode support with smooth transitions.
- **Pure Client-Side**: No data leaves your browser - everything runs locally.

## 🌟 Feature Showcase

### Media Tools

#### Image Editor
Precision cropping (16:9), intelligent watermark removal, and format conversion.

#### Image Resize
A pure client-side image compressor with custom target size and format options.

#### Image Converter
Convert images between PNG, JPG, WebP, and AVIF formats with quality control.

#### GIF Maker
Create animated GIFs from image sequences with customizable frame rate and quality.

### Document Tools

#### PDF Tools
Merge, split, and compress PDF files entirely in your browser.

#### JSON Tools
Format, validate, minify, and convert JSON. Includes tree view and conversion to YAML/XML.

#### CSV Viewer
View, edit, and convert CSV files to JSON. Supports drag-and-drop file upload.

### Developer Tools

#### QR Code Generator
Generate customizable QR codes for URLs, text, email, and WiFi credentials.

#### Base64 Tools
Encode/decode text and files to/from Base64. Includes image preview support.

#### Regex Tester
Test and debug regular expressions with real-time matching and common pattern library.

### Utilities

#### Password Generator
Generate strong, secure passwords with customizable length and character sets. Includes strength meter.

#### Timestamp Converter
Convert between Unix timestamps and human-readable dates. Supports multiple timezones.

## ⌨️ Keyboard Shortcuts

| Scope | Key(s) | Action |
| :--------------- | :----------------- | :----------------------------- |
| **Global** | `Cmd/Ctrl` + `,` | Open Settings |
| **Global** | `Esc` | Close Settings / Modals |
| **Image Editor** | `Arrow Left/Right` | Switch Image |
| **Image Editor** | `S` | Save processed image |
| **Image Editor** | `O` | Save original image |
| **Image Editor** | `G` | Auto Remove Watermark (Gemini) |
| **Image Editor** | `C` | Clear Selection |

## 🚀 Getting Started

### Option 1: Direct Access (Simplest)

Open `index.html` directly in your browser. No server required for basic usage.

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html
```

### Option 2: Local Server (Recommended)

For full functionality including file drag-and-drop:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (if you have http-server installed)
npx http-server -p 8080
```

Then visit http://localhost:8080

## 💻 Development

For detailed guidelines on adding new tools, please refer to [CONTRIBUTING.md](docs/CONTRIBUTING.md).

### CSS Build

Tailwind is compiled locally (not loaded from CDN at runtime):

```bash
npm install
npm run build:css
```

Use watch mode during development:

```bash
npm run watch:css
```

### Quick Start for New Tools

1. **Template**: Copy the structure of an existing HTML tool (e.g., `image_resize.html`).
2. **Dependencies**: For third-party JS libraries, use CDN links as needed.
3. **Styling**: Add Tailwind classes in HTML/JS, then run `npm run build:css`.
4. **Navigation**: Register your tool in `js/components.js` to add it to the sidebar.
5. **Theme**: Ensure dark mode support with `dark:` Tailwind classes.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5 / JavaScript (ES6+ Modules)
- **Styling**: Tailwind CSS (local build output) + FontAwesome
- **Libraries**: Various CDN libraries per tool (pdf-lib, gifshot, qrcode.js, PapaParse, etc.)
- **Storage**: LocalStorage (Settings persistence)

## 📁 File Structure

```
LocalForge/
├── index.html                 # Dashboard/Tool Gallery
├── image_editor.html          # Image editing tool
├── image_resize.html          # Image compression
├── image_converter.html       # Format conversion
├── gif_maker.html             # GIF creation
├── pdf_tools.html             # PDF manipulation
├── json_tools.html            # JSON utilities
├── csv_viewer.html            # CSV viewer/editor
├── qr_generator.html          # QR code generator
├── base64_tools.html          # Base64 encoder/decoder
├── regex_tester.html          # Regex testing tool
├── password_generator.html    # Password generator
├── timestamp_converter.html   # Timestamp utilities
├── js/
│   ├── components.js          # Shared UI components (sidebar, header, theme)
│   └── db-client.js           # Database client (if using SharedWorker)
├── css/
│   ├── tailwind.css           # Tailwind input file
│   ├── tailwind.generated.css # Tailwind compiled output (commit this)
│   └── style.css              # Global styles
├── tailwind.config.js         # Tailwind config
├── package.json               # Build scripts for CSS
└── docs/
    ├── CONTRIBUTING.md        # Development guidelines
    └── images/                # Screenshots and assets
```

## 🔧 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📄 License

MIT
