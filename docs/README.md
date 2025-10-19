# IntelliPen Documentation

This directory contains the Hugo-based documentation for IntelliPen using the Docsy theme.

## Viewing Documentation

Visit the live documentation at: https://intellipen.nrl.ai/

## Prerequisites

- **Hugo Extended** version 0.110.0 or later
- **Go** 1.21 or later
- **Node.js** and **npm** (for PostCSS)

## Quick Start

### Install Hugo Extended

**macOS:**
```bash
brew install hugo
```

**Linux:**
```bash
# Download from GitHub releases
wget https://github.com/gohugoio/hugo/releases/download/v0.121.0/hugo_extended_0.121.0_linux-amd64.deb
sudo dpkg -i hugo_extended_0.121.0_linux-amd64.deb
```

**Windows:**
```bash
choco install hugo-extended
```

### Setup

```bash
cd docs

# Run setup script
./setup-hugo.sh

# Or manually:
hugo mod get
hugo mod tidy
npm install
```

### Local Development

```bash
cd docs

# Start development server
hugo server

# Or use npm script
npm run dev
```

Visit `http://localhost:1313/`

### Build for Production

```bash
cd docs

# Build site
hugo --gc --minify

# Or use npm script
npm run build
```

Output will be in `docs/public/` directory.

## Documentation Structure

```
docs/
├── hugo.toml              # Hugo configuration
├── go.mod                 # Go module dependencies
├── package.json           # Node.js dependencies
├── content/               # Content files
│   └── en/               # English content
│       ├── _index.md     # Home page
│       ├── docs/         # Documentation
│       │   ├── getting-started.md
│       │   ├── user-guide.md
│       │   ├── architecture.md
│       │   ├── api-reference.md
│       │   ├── contributing.md
│       │   ├── faq.md
│       │   └── privacy.md
│       ├── blog/         # Blog posts
│       └── about/        # About pages
├── static/               # Static assets
└── public/               # Built site (generated)
```

## Adding Content

### New Documentation Page

```bash
hugo new docs/your-page.md
```

Edit the front matter:
```yaml
---
title: "Your Page Title"
linkTitle: "Short Title"
weight: 10
description: >
  Brief description
---
```

### New Blog Post

```bash
hugo new blog/your-post.md
```

## Deployment

### GitHub Pages

The site is automatically deployed via GitHub Actions when changes are pushed to the `main` branch.

See `.github/workflows/hugo-docs.yml` for the workflow configuration.

### Manual Deployment

```bash
cd docs
hugo --gc --minify
# Deploy public/ directory to your hosting
```

## Theme

IntelliPen uses the [Docsy](https://www.docsy.dev/) theme, which provides:

- Responsive design
- Search functionality
- Multi-language support
- Blog support
- Documentation structure
- GitHub integration

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Docsy Theme](https://www.docsy.dev/)
- [Migration Guide](MIGRATION.md)
- [Setup Guide](README_HUGO.md)

## Support

For documentation issues:
- Open an issue on [GitHub](https://github.com/vietanhdev/IntelliPen/issues)
- Tag with `documentation` label
- Provide specific page and section references
