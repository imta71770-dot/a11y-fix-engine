# Newsletter Pitches & Community Posts

## 1. Accessibility Weekly (hello@a11yweekly.com)

**Subject:** Open source GitHub Action that auto-fixes WCAG violations in source code

**Body:**

Hi,

I wanted to share a free, open source GitHub Action called A11y Fix Engine that takes a different approach to accessibility tooling. Instead of just detecting WCAG violations or injecting overlay scripts, it modifies your actual source HTML — adding missing alt attributes, lang declarations, form labels, skip-nav links, and more.

95% of websites still fail WCAG compliance, and overlay-based solutions have proven legally insufficient (800+ overlay users were sued in 2023-2024). This tool runs in CI/CD on every pull request, auto-fixes what it can (~30% of common violations), and clearly reports what still needs human review. Built on axe-core, MIT licensed.

GitHub: https://github.com/imta71770-dot/a11y-fix-engine
Marketplace: https://github.com/marketplace/actions/a11y-fix-engine

---

## 2. Frontend Focus (submit via frontendfoc.us)

**Subject:** A11y Fix Engine — GitHub Action that patches WCAG issues in your source code, not with overlays

**Body:**

Hi,

I'd like to suggest A11y Fix Engine for Frontend Focus — it's a free, open source GitHub Action that scans HTML for WCAG 2.2 violations and automatically fixes them in your source code. It handles missing alt text, lang attributes, form labels, landmark roles, and more across 20+ rule types.

Unlike overlay tools (which the FTC has taken action against), this modifies your actual files and commits the fixes in your PR. It reports everything transparently: what was auto-fixed, and what requires human judgment like color contrast or heading hierarchy. It runs on axe-core and takes about 30 seconds to add to any workflow.

GitHub: https://github.com/imta71770-dot/a11y-fix-engine
Marketplace: https://github.com/marketplace/actions/a11y-fix-engine

---

## 3. Show HN (Hacker News)

**Title:** Show HN: A11y Fix Engine – GitHub Action that auto-fixes WCAG violations in source code

**Description:**

95% of websites fail WCAG compliance (WebAIM 2025), and the tools available mostly just generate reports. Overlay widgets claim to fix things at runtime, but they don't hold up legally — 800+ overlay users were sued in 2023-2024, and the FTC took action against accessiBe for deceptive claims.

I built A11y Fix Engine, a GitHub Action that takes a different approach: it scans your HTML with axe-core, then rewrites your source files to fix what it can. Missing alt text, missing lang attributes, unlabeled form inputs, icon buttons without accessible names, iframes without titles — about 30% of common WCAG violations get patched automatically.

What it does NOT do: claim 100% compliance. Issues like color contrast, meaningful link text, and keyboard navigation require human judgment, and those are reported separately. The goal is to eliminate the mechanical fixes so developers can focus on the hard problems.

Setup is one YAML block in your workflow. It runs on every PR, commits fixes, and annotates anything that needs manual review.

MIT licensed, built on axe-core (the same engine used by Microsoft and Google).

GitHub: https://github.com/imta71770-dot/a11y-fix-engine
Marketplace: https://github.com/marketplace/actions/a11y-fix-engine
