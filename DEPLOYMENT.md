# Deployment Guide

This project is now a static site and can be easily deployed to GitHub Pages.

## GitHub Pages Deployment

1.  **Push to GitHub**: Ensure your `main` branch (or `dev`, depending on your preference) is pushed to GitHub.
2.  **Settings**: Go to your repository settings on GitHub.
3.  **Pages**: Select "Pages" from the sidebar.
4.  **Build and deployment**:
    - **Source**: Select **Deploy from a branch** (Classic Pages experience) from the dropdown. _Note: You do NOT need to set up GitHub Actions for this project as it is a static site._
    - **Branch**: Select your main branch (e.g., `main` or `master`) and ensure the folder is set to `/` (root).
5.  **Save**: Click Save. GitHub will start building your site.

## Custom Domain Setup

1.  **Purchase Domain**: Ensure you have purchased your custom domain (e.g., `example.com`) from a registrar.
2.  **DNS Configuration**:
    - **CNAME Record** (Recommended for subdomains like `tools`):
      - **Type**: `CNAME`
      - **Name** (Host): `tools`
      - **Value** (Target): `fangwangme.github.io`
      - **TTL**: Automatic or 3600
3.  **GitHub Settings**:
    - Go back to **Settings > Pages**.
    - Under **Custom domain**, enter your domain name (e.g., `example.com`).
    - Click **Save**. GitHub will create a `CNAME` file in your repository.
    - Check **Enforce HTTPS** to ensure secure connections.
4.  **Verification**: It may take some time for DNS changes to propagate (up to 24 hours, but usually faster).
