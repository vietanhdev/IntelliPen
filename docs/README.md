# IntelliPen Documentation

This directory contains the documentation for IntelliPen, published via GitHub Pages.

## Viewing Documentation

Visit the live documentation at: https://vietanhdev.github.io/IntelliPen/

## Documentation Structure

- `index.md` - Home page and overview
- `getting-started.md` - Installation and setup guide
- `user-guide.md` - Complete feature documentation
- `architecture.md` - Technical architecture and design
- `api-reference.md` - Chrome AI APIs integration reference
- `contributing.md` - Development and contribution guidelines

## Local Development

To run the documentation site locally:

### Prerequisites

- Ruby 2.7 or higher
- Bundler gem

### Setup

```bash
# Install dependencies
cd docs
bundle install

# Serve locally
bundle exec jekyll serve

# Open in browser
# http://localhost:4000/IntelliPen/
```

### Making Changes

1. Edit markdown files in the `docs/` directory
2. Jekyll will automatically rebuild (in serve mode)
3. Refresh browser to see changes
4. Commit and push to update live site

## GitHub Pages Configuration

The site uses:
- **Theme**: Just the Docs
- **Markdown**: Kramdown with GFM
- **Plugins**: SEO tag, GitHub metadata, include cache

Configuration is in `_config.yml`.

## Publishing

Documentation is automatically published when changes are pushed to the `main` branch:

1. Make changes to markdown files
2. Commit and push to main branch
3. GitHub Actions builds and deploys automatically
4. Changes appear at https://vietanhdev.github.io/IntelliPen/ within minutes

## Contributing

To contribute to documentation:

1. Follow the [Contributing Guide](contributing.md)
2. Ensure markdown is properly formatted
3. Test locally before submitting PR
4. Keep documentation in sync with code changes

## Support

For documentation issues:
- Open an issue on GitHub
- Tag with `documentation` label
- Provide specific page and section references
