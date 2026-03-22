# Synergy: A11y Fix Engine ↔ AccessibleWeb Guide Blog

## Architecture Overview

```
[AccessibleWeb Guide Blog]          [A11y Fix Engine]
  ↓                                    ↓
 Educational Content               Developer Tool
 (non-technical audience)          (technical audience)
  ↓                                    ↓
 Chrome Extension (検出)  ←API→   REST API (修正)
  ↓                                    ↓
 "問題を理解"  →  "問題を見つける"  →  "問題を直す"
```

## How They Complement Each Other

### Blog → Fix Engine (送客)
- Blog articles about WCAG compliance link to the GitHub Action as a "fix it" CTA
- Chrome extension (planned) can call Fix Engine API as backend for "auto-fix" feature
- Blog's programmatic SEO pages rank for educational queries; Fix Engine ranks for tool queries

### Fix Engine → Blog (送客)
- Fix Engine reports include links to relevant blog guides for manual-review issues
- Each `helpUrl` in violation reports can point to blog's `/fix/[criterion]` pages
- README and docs reference blog for "learn more about WCAG compliance"

## Data Sharing

### Blog → Fix Engine
- `wcag-fixes.json` (54 entries) — used as foundation for fix rules and bad/good code examples
- `checklists.json` — CMS-specific common issues inform framework-aware fixes
- TypeScript interfaces in `types/pseo.ts` — shared data structures

### Fix Engine → Blog
- Fix Engine API can power the Chrome extension's "fix suggestion" feature
- Fix Engine scan results can feed into blog's comparison articles (e.g., "automated vs manual")
- Fix Engine rule coverage data can populate blog's "which WCAG criteria can be auto-fixed" content

## Chrome Extension Integration Plan

The blog project plans a Chrome extension. Here's how to integrate:

```javascript
// In Chrome extension popup.js
async function getFixSuggestions(html) {
  const response = await fetch('https://api.a11y-fix-engine.com/api/v1/fix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': userApiKey,  // from extension settings
    },
    body: JSON.stringify({ html, standard: 'wcag2aa' }),
  });
  return response.json();
}
```

This gives the Chrome extension "fix" capabilities without building a separate engine.

## Cross-Linking Strategy

| Blog Page | Links To |
|-----------|----------|
| `/fix/1-1-1-non-text-content` | GitHub Action setup guide |
| `/compare/overlay-vs-manual-fixes` | Fix Engine as third option |
| `/checklist/wordpress` | GitHub Action for WordPress repos |
| `/blog/five-minute-accessibility-audit` | API for programmatic scanning |

| Fix Engine Page | Links To |
|-----------------|----------|
| README "Learn More" section | Blog home |
| Report "Manual Review" links | Blog `/fix/[criterion]` pages |
| API docs | Blog for context on WCAG criteria |
