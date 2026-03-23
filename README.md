# A11y Fix Engine

**WCAG accessibility violations? Don't just detect them — fix them.**

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-A11y%20Fix%20Engine-green?logo=github)](https://github.com/marketplace/actions/a11y-fix-engine)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WCAG 2.2](https://img.shields.io/badge/WCAG-2.2%20AA-purple)](https://www.w3.org/TR/WCAG22/)

A GitHub Action that scans your HTML for WCAG 2.2 violations and **automatically fixes them in your source code**. No overlays. No JavaScript injection. Real fixes to your actual code.

## The Problem

- **95% of websites** fail WCAG compliance ([WebAIM 2025](https://webaim.org/projects/million/))
- **5,000+ ADA lawsuits** filed annually, up 37% year-over-year
- **EU Accessibility Act** is now enforced — fines up to 4% of revenue
- Existing tools **detect** problems but don't **fix** them
- Overlay solutions are [legally insufficient](https://overlayfactsheet.com/) — 800+ overlay users were sued in 2023-2024

## Quick Start

Add this to your workflow — takes 30 seconds:

```yaml
# .github/workflows/a11y.yml
name: Accessibility Check
on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: imta71770-dot/a11y-fix-engine@v0.1.0
        with:
          standard: 'wcag2aa'
          fix: 'commit'
          fail_on: 'serious'
```

That's it. Every PR now gets automatically scanned and fixed.

## Demo: Before & After

Here's what happens when you run A11y Fix Engine on a typical small business page with accessibility issues:

**Input:** A page with 5 violations (missing alt text, no page title, no lang attribute, unlabeled button, untitled iframe)

**Result:**

```
Scanning: examples/demo-before.html
  Found: 5 violations, Fixed: 6, Manual: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 5 violations, 6 auto-fixed, 0 need manual review
```

### What got fixed automatically:

| Issue | Impact | Fix Applied |
|-------|--------|------------|
| Images without `alt` text | Critical | Added `alt` attribute with descriptive placeholder |
| `<html>` missing `lang` attribute | Serious | Added `lang="en"` |
| Missing `<title>` element | Serious | Added `<title>` element |
| Icon button without label | Critical | Added `aria-label` |
| `<iframe>` without title | Serious | Added `title` attribute |

### Example fix — missing alt text:

**Before:**
```html
<img src="/images/team-photo-2025.jpg">
```

**After:**
```html
<img src="/images/team-photo-2025.jpg"
     alt="TODO: Describe this image — team photo 2025">
```

### Example fix — icon button:

**Before:**
```html
<button type="submit">
  <svg viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
</button>
```

**After:**
```html
<button type="submit" aria-label="TODO: Add accessible label for this button">
  <svg viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
</button>
```

## What It Fixes

**Auto-fixed (~30% of WCAG violations):**
- Missing `alt` text on images
- Missing form labels (`aria-label`)
- Missing `lang` attribute on `<html>`
- Missing `<title>` element
- Missing skip navigation links
- Missing landmark roles
- Icon buttons without accessible names
- `<iframe>` without title
- Invalid `autocomplete` attributes
- `aria-hidden` on `<body>`

**Detected + reported (requires your judgment):**
- Color contrast ratios
- Link purpose / meaningful link text
- Heading hierarchy
- Keyboard navigation
- Complex ARIA patterns

We are **transparent about limitations**. Unlike overlay companies that [got fined by the FTC](https://www.ftc.gov/news-events/news/press-releases/2024/06/accessibe-settles-ftc-charges-it-deceived-consumers-ai-powered-accessibility-tool) for claiming 100% compliance, we clearly separate what's auto-fixed vs. what needs human review.

## Configuration

```yaml
- uses: imta71770-dot/a11y-fix-engine@v0.1.0
  with:
    # Glob pattern for files to scan (default: all HTML)
    path: '**/*.html'

    # WCAG level: wcag2a, wcag2aa, wcag2aaa
    standard: 'wcag2aa'

    # Fix mode:
    #   'report' — annotate PR with violations only
    #   'commit' — auto-fix and commit changes
    fix: 'report'

    # Fail threshold: critical, serious, moderate, minor, none
    fail_on: 'serious'
```

## How It Works

```
Your HTML → axe-core scan → violations detected → auto-fix engine → fixed HTML + report
```

1. **Scan** — [axe-core](https://github.com/dequelabs/axe-core) analyzes your HTML against WCAG 2.2 rules
2. **Match** — each violation is mapped to a fix strategy (20+ rule types)
3. **Fix** — source code is modified: attributes added, elements restructured
4. **Report** — Markdown report shows every change with before/after diffs
5. **Annotate** — violations appear as PR annotations in GitHub

Built on axe-core (MPL-2.0), the industry standard used by Microsoft, Google, and the US government.

## Who This Is For

- **Web agencies** managing multiple client sites
- **Dev teams** that want accessibility in CI/CD without manual audits
- **Open source maintainers** who want accessible projects
- **Anyone** shipping HTML who doesn't want to get sued

## Development

```bash
git clone https://github.com/imta71770-dot/a11y-fix-engine.git
cd a11y-fix-engine
npm install
npm test
```

## License

MIT

## Learn More

- [WCAG 2.2 Explained in Plain English](https://blog.a11yfix.dev/blog/wcag-explained-plain-english/)
- [5-Minute Accessibility Audit](https://blog.a11yfix.dev/blog/five-minute-accessibility-audit/)
- [Overlay Fact Sheet](https://overlayfactsheet.com/)
