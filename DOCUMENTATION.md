# IntelliPen Documentation

## 📚 View Documentation

**Live Documentation**: [https://vietanhdev.github.io/IntelliPen/](https://vietanhdev.github.io/IntelliPen/)

## Quick Links

- [Getting Started](https://vietanhdev.github.io/IntelliPen/getting-started.html) - Installation and setup
- [User Guide](https://vietanhdev.github.io/IntelliPen/user-guide.html) - Complete feature documentation
- [Architecture](https://vietanhdev.github.io/IntelliPen/architecture.html) - Technical architecture and design
- [API Reference](https://vietanhdev.github.io/IntelliPen/api-reference.html) - Chrome AI APIs integration
- [Contributing](https://vietanhdev.github.io/IntelliPen/contributing.html) - Development guidelines
- [Privacy Policy](https://vietanhdev.github.io/IntelliPen/privacy.html) - Privacy and data handling
- [FAQ](https://vietanhdev.github.io/IntelliPen/faq.html) - Frequently asked questions

## 🚀 Setting Up GitHub Pages

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"**
4. Save the settings

### Step 2: Deploy Documentation

The documentation will automatically deploy when you push to the main branch:

```bash
git add docs/ .github/workflows/docs.yml DOCUMENTATION.md
git commit -m "Add comprehensive documentation and GitHub Pages setup"
git push origin main
```

### Step 3: Verify Deployment

1. Go to the **Actions** tab in your repository
2. Watch the "Deploy Documentation" workflow
3. Once complete (usually 2-3 minutes), your documentation will be live
4. Visit: `https://vietanhdev.github.io/IntelliPen/`

## 📝 Documentation Structure

```
docs/
├── index.md                    # Home page
├── getting-started.md          # Installation guide
├── user-guide.md              # Feature documentation
├── architecture.md            # Technical architecture
├── api-reference.md           # API documentation
├── contributing.md            # Development guidelines
├── privacy.md                 # Privacy policy
├── faq.md                     # FAQ
├── quick-reference.md         # Developer quick reference
├── changelog.md               # Version history
├── _config.yml                # Jekyll configuration
├── Gemfile                    # Ruby dependencies
└── README.md                  # Documentation README
```

## 🛠️ Local Development

To run the documentation site locally:

### Prerequisites

```bash
# Install Ruby (if not already installed)
# macOS:
brew install ruby

# Ubuntu/Debian:
sudo apt-get install ruby-full

# Windows:
# Download from https://rubyinstaller.org/
```

### Setup and Run

```bash
# Navigate to docs directory
cd docs

# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve

# Open in browser
# http://localhost:4000/IntelliPen/
```

The site will automatically rebuild when you make changes to markdown files.

## ✏️ Updating Documentation

### Adding a New Page

1. Create a new markdown file in `docs/`:

```markdown
---
layout: default
title: Your Page Title
nav_order: 11
---

# Your Page Title

Your content here...
```

2. Commit and push:

```bash
git add docs/your-page.md
git commit -m "Add new documentation page"
git push origin main
```

3. GitHub Actions will automatically deploy the update

### Editing Existing Pages

1. Edit the markdown file in `docs/`
2. Test locally (optional): `bundle exec jekyll serve`
3. Commit and push changes
4. Automatic deployment will update the live site

## 🎨 Documentation Features

### Theme

- **Just the Docs**: Clean, professional documentation theme
- **Search**: Full-text search across all pages
- **Navigation**: Hierarchical navigation with ordering
- **Mobile Responsive**: Works on all devices
- **Dark Mode**: Coming soon

### Content Features

- Syntax-highlighted code blocks
- Table of contents on long pages
- Cross-references between pages
- Breadcrumb navigation
- Back to top links
- SEO optimized

## 📋 Documentation Checklist

When updating code, ensure documentation is updated:

- [ ] Update relevant user guide sections
- [ ] Update API reference if APIs changed
- [ ] Add examples for new features
- [ ] Update architecture docs if structure changed
- [ ] Update FAQ with common questions
- [ ] Update changelog with changes
- [ ] Test all code examples
- [ ] Check for broken links

## 🔧 Troubleshooting

### Build Fails

**Issue**: GitHub Actions workflow fails

**Solutions**:
1. Check Actions tab for error details
2. Verify `_config.yml` syntax
3. Ensure all markdown files have valid front matter
4. Check that all links are valid

### 404 Error

**Issue**: Documentation shows 404

**Solutions**:
1. Verify GitHub Pages is enabled
2. Check `baseurl` in `_config.yml` matches repo name
3. Wait a few minutes for deployment
4. Clear browser cache

### Local Build Issues

**Issue**: `bundle install` fails

**Solutions**:
```bash
# Update bundler
gem install bundler

# Clean and reinstall
rm -rf vendor/
bundle install
```

## 📚 Documentation Standards

### Writing Style

- Clear and concise
- Use active voice
- Write for developers
- Include code examples
- Explain the "why" not just the "how"

### Code Examples

- Complete and working
- Include error handling
- Add comments for clarity
- Show best practices
- Test before committing

### Formatting

- Use proper markdown syntax
- Consistent heading levels
- Code blocks with language tags
- Lists for multiple items
- Tables for structured data

## 🤝 Contributing to Documentation

Documentation contributions are welcome! See [Contributing Guide](https://vietanhdev.github.io/IntelliPen/contributing.html) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a branch: `git checkout -b docs/improve-user-guide`
3. Make your changes in `docs/`
4. Test locally (optional)
5. Commit: `git commit -m "Improve user guide section on translation"`
6. Push: `git push origin docs/improve-user-guide`
7. Open a Pull Request

## 📞 Support

For documentation issues:

- **GitHub Issues**: [Report documentation problems](https://github.com/vietanhdev/IntelliPen/issues)
- **GitHub Discussions**: [Ask documentation questions](https://github.com/vietanhdev/IntelliPen/discussions)
- **Pull Requests**: [Suggest improvements](https://github.com/vietanhdev/IntelliPen/pulls)

## 📄 License

Documentation is licensed under [MIT License](LICENSE), same as the project.

---

**Ready to get started?** Visit the [live documentation](https://vietanhdev.github.io/IntelliPen/) or [enable GitHub Pages](#-setting-up-github-pages) to deploy your own copy.
