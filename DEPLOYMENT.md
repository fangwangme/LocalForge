# Deployment Guide

This project is a static site and can be easily deployed to GitHub Pages or any static hosting service.

## GitHub Pages Deployment

1. **Push to GitHub**: Ensure your `main` branch (or `dev`, depending on your preference) is pushed to GitHub.
2. **Settings**: Go to your repository settings on GitHub.
3. **Pages**: Select "Pages" from the sidebar.
4. **Build and deployment**:
   - **Source**: Select **Deploy from a branch** (Classic Pages experience) from the dropdown.
   - **Note**: You do NOT need to set up GitHub Actions for this project as it is a static site.
   - **Branch**: Select your main branch (e.g., `main` or `master`) and ensure the folder is set to `/` (root).
5. **Save**: Click Save. GitHub will start building your site.

Your site will be available at: `https://yourusername.github.io/LocalForge`

## Custom Domain Setup

1. **Purchase Domain**: Ensure you have purchased your custom domain (e.g., `example.com`) from a registrar.
2. **DNS Configuration**:
   - **CNAME Record** (Recommended for subdomains like `tools`):
     - **Type**: `CNAME`
     - **Name** (Host): `tools`
     - **Value** (Target): `yourusername.github.io`
     - **TTL**: Automatic or 3600
3. **GitHub Settings**:
   - Go back to **Settings > Pages**.
   - Under **Custom domain**, enter your domain name (e.g., `tools.example.com`).
   - Click **Save**. GitHub will create a `CNAME` file in your repository.
   - Check **Enforce HTTPS** to ensure secure connections.
4. **Verification**: It may take some time for DNS changes to propagate (up to 24 hours, but usually faster).

## Local Development Server

For development, you can use any local server:

### Python
```bash
python3 -m http.server 8080
```

### Node.js
```bash
npx http-server -p 8080
```

### PHP
```bash
php -S localhost:8080
```

## CDN Dependencies

This project relies on several CDN resources:

- **Tailwind CSS**: `https://cdn.tailwindcss.com`
- **FontAwesome**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css`
- **Third-party libraries** (tool-specific):
  - PDF-LIB: `https://unpkg.com/pdf-lib@1.17.1`
  - PapaParse: `https://unpkg.com/papaparse@5.4.1`
  - GIFShot: `https://unpkg.com/gifshot@0.4.5`
  - QRCode.js: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0`

**Note**: Ensure these CDNs are accessible from your deployment region.

## Pre-Deployment Checklist

Before deploying:

- [ ] All tools work correctly in both light and dark modes
- [ ] No console errors in production build
- [ ] Settings panel opens/closes properly
- [ ] Theme switching works across all tools
- [ ] File operations work (if applicable)
- [ ] Sidebar navigation is functional
- [ ] Dashboard displays all tools correctly
- [ ] Custom domain DNS is configured (if using)

## Troubleshooting

### Theme not persisting
- Check browser localStorage is enabled
- Verify `lifeflow_theme_mode` key exists in localStorage

### Tools not loading
- Check CDN resources are loading (Network tab in DevTools)
- Verify no JavaScript errors in console

### Sidebar flickering
- This is normal during page load due to Web Components registration
- The anti-flicker CSS should minimize this

## Security Considerations

- All processing happens client-side - no data is sent to servers
- File operations use browser's File API
- LocalStorage is used only for settings (theme preference)
- No cookies or tracking

## Performance

- DNS prefetch is enabled for CDNs
- Scripts use `defer` for non-blocking loading
- Theme is applied before page render to prevent flash
- Images should be optimized for web

## Support

For issues or questions:
- Check [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development guidelines
- Review existing tools for implementation examples
- Open an issue on GitHub
