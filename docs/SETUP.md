# GitHub Pages Setup Guide

This guide explains how to set up GitHub Pages for IntelliPen documentation.

## Automatic Setup (Recommended)

The documentation is configured to deploy automatically via GitHub Actions.

### Steps:

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Build and deployment":
     - Source: Select "GitHub Actions"
   - Save the settings

2. **Push Changes**:
   ```bash
   git add docs/
   git commit -m "Add documentation"
   git push origin main
   ```

3. **Wait for Deployment**:
   - Go to Actions tab in your repository
   - Watch the "Deploy Documentation" workflow
   - Once complete, your site will be live

4. **Access Documentation**:
   - Visit: `https://vietanhdev.github.io/IntelliPen/`
   - Or check the Pages settings for the exact URL

## Manual Setup (Alternative)

If you prefer to build locally and deploy manually:

### Prerequisites

```bash
# Install Ruby (if not already installed)
# On macOS:
brew install ruby

# On Ubuntu/Debian:
sudo apt-get install ruby-full

# On Windows:
# Download from https://rubyinstaller.org/
```

### Build Locally

```bash
# Navigate to docs directory
cd docs

# Install dependencies
bundle install

# Build the site
bundle exec jekyll build

# The site will be in docs/_site/
```

### Serve Locally

```bash
# Serve with live reload
bundle exec jekyll serve

# Open in browser
# http://localhost:4000/IntelliPen/
```

## Configuration

### Update Repository Name

If you fork this repository, update the `baseurl` in `docs/_config.yml`:

```yaml
baseurl: "/YOUR_REPO_NAME"
url: "https://YOUR_USERNAME.github.io"
```

### Customize Theme

Edit `docs/_config.yml` to customize:

```yaml
# Site information
title: Your Title
description: Your Description

# Theme colors
color_scheme: light  # or dark

# Search
search_enabled: true

# Footer
footer_content: "Your footer text"
```

## Troubleshooting

### Build Fails

**Issue**: GitHub Actions workflow fails

**Solutions**:
1. Check the Actions tab for error details
2. Verify `docs/_config.yml` syntax is correct
3. Ensure all markdown files have valid front matter
4. Check that Gemfile dependencies are compatible

### 404 Error

**Issue**: Documentation shows 404 error

**Solutions**:
1. Verify GitHub Pages is enabled in repository settings
2. Check that `baseurl` in `_config.yml` matches repository name
3. Wait a few minutes for deployment to complete
4. Clear browser cache and try again

### Styling Issues

**Issue**: Documentation looks broken or unstyled

**Solutions**:
1. Verify `baseurl` is correct in `_config.yml`
2. Check that theme is properly installed
3. Clear Jekyll cache: `bundle exec jekyll clean`
4. Rebuild: `bundle exec jekyll build`

### Local Build Issues

**Issue**: `bundle install` fails

**Solutions**:
```bash
# Update bundler
gem install bundler

# Clean and reinstall
rm -rf vendor/
bundle install

# If Ruby version issues:
rbenv install 3.1.0  # or rvm install 3.1.0
rbenv local 3.1.0    # or rvm use 3.1.0
```

## Updating Documentation

### Adding New Pages

1. Create a new markdown file in `docs/`:
   ```markdown
   ---
   layout: default
   title: Your Page Title
   nav_order: 7
   ---

   # Your Page Title

   Content here...
   ```

2. Commit and push:
   ```bash
   git add docs/your-page.md
   git commit -m "Add new documentation page"
   git push origin main
   ```

3. GitHub Actions will automatically deploy

### Editing Existing Pages

1. Edit the markdown file
2. Test locally (optional):
   ```bash
   cd docs
   bundle exec jekyll serve
   ```
3. Commit and push changes
4. Automatic deployment will update the site

## Advanced Configuration

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to `docs/`:
   ```
   docs.yoursite.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

3. Update `_config.yml`:
   ```yaml
   url: "https://docs.yoursite.com"
   baseurl: ""
   ```

### Analytics

Add Google Analytics to `_config.yml`:

```yaml
google_analytics: UA-XXXXXXXXX-X
```

### Custom CSS

Create `docs/assets/css/custom.css`:

```css
/* Your custom styles */
```

Add to `_config.yml`:

```yaml
custom_css:
  - /assets/css/custom.css
```

## Maintenance

### Updating Dependencies

```bash
cd docs
bundle update
git add Gemfile.lock
git commit -m "Update documentation dependencies"
git push origin main
```

### Monitoring

- Check GitHub Actions for build status
- Monitor Pages settings for deployment status
- Review site regularly for broken links

## Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Just the Docs Theme](https://just-the-docs.github.io/just-the-docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Markdown Guide](https://www.markdownguide.org/)

## Support

For issues with documentation setup:
1. Check this guide first
2. Review GitHub Actions logs
3. Open an issue with `documentation` label
4. Include error messages and steps to reproduce
