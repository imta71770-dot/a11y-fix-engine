# A11y Fix Engine

**WCAG accessibility violations? Don't just detect them — fix them.**

A11y Fix Engine scans your HTML for WCAG 2.2 violations and **automatically generates source-code fixes**. No overlays. No JavaScript injection. Real fixes to your actual code.

## Why This Exists

- **95% of websites** fail WCAG compliance (WebAIM 2025)
- **5,000+ ADA lawsuits** filed annually in the US
- **EU Accessibility Act** is now enforced with fines up to 4% of revenue
- Existing tools **detect** problems but don't **fix** them
- Overlay solutions are [legally insufficient](https://overlayfactsheet.com/) and getting sued

**A11y Fix Engine bridges the gap** between "$49/year overlays that fail in court" and "$5,000+ manual audits."

## How It Works

```
Your HTML → [axe-core scan] → [violations detected] → [auto-fix engine] → Fixed HTML + Report
```

**Auto-fixable issues (~30% of all WCAG violations):**
- Missing alt text on images
- Missing form labels
- Missing lang attribute
- Color contrast issues (flagged with guidance)
- Missing page title
- Missing skip navigation links
- Missing landmark roles
- Invalid autocomplete attributes
- aria-hidden on body
- Missing iframe titles
- And more...

**Detected but requiring manual review (~70%):**
- Link purpose / meaningful link text
- Heading hierarchy
- Complex ARIA patterns
- Keyboard navigation
- Content structure and semantics

We are **honest about what AI can and cannot fix**. Unlike overlay companies that promised 100% compliance and got [fined by the FTC](https://www.ftc.gov/news-events/news/press-releases/2024/06/accessibe-settles-ftc-charges-it-deceived-consumers-ai-powered-accessibility-tool), we clearly distinguish auto-fixed vs. needs-human-review issues.

## Quick Start

### As a GitHub Action

```yaml
# .github/workflows/a11y.yml
name: Accessibility Check
on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: a11y-fix-engine/a11y-fix-engine@v1
        with:
          path: '**/*.html'
          standard: 'wcag2aa'
          fix: 'report'        # 'report', 'commit', or 'pr'
          fail_on: 'serious'   # 'critical', 'serious', 'moderate', 'minor', 'none'
```

**Fix modes:**
- `report` — Annotate PR with violations (free)
- `commit` — Auto-fix and commit changes (free)
- `pr` — Create a separate fix PR (premium)

### As a REST API

```bash
# Scan only
curl -X POST http://localhost:3100/api/v1/scan \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><img src=\"photo.jpg\"></body></html>"}'

# Scan + Auto-fix
curl -X POST http://localhost:3100/api/v1/fix \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><img src=\"photo.jpg\"></body></html>", "standard": "wcag2aa"}'
```

**Response:**
```json
{
  "fixedHTML": "<html><body><img src=\"photo.jpg\" alt=\"TODO: Describe this image — photo\"></body></html>",
  "scan": {
    "totalViolations": 2,
    "totalIssues": 2,
    "critical": 1,
    "serious": 1
  },
  "fixes": [
    {
      "fixType": "add-alt-attr",
      "ruleId": "image-alt",
      "wcag": "2a",
      "impact": "critical",
      "description": "Images must have alternate text",
      "note": "Added alt attribute. Replace TODO placeholder with a meaningful description."
    }
  ],
  "unfixable": [],
  "report": "# Accessibility Fix Report\n..."
}
```

### As a Node.js Library

```javascript
import { runEngine } from 'a11y-fix-engine';

const result = await runEngine(html, {
  standard: 'wcag2aa',
  fixEnabled: true,
});

console.log(result.fixes);       // What was auto-fixed
console.log(result.unfixable);   // What needs manual review
console.log(result.fixedHTML);    // The corrected HTML
console.log(result.report);      // Markdown report
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/scan` | Scan HTML, return violations |
| `POST` | `/api/v1/fix` | Scan + auto-fix, return fixed HTML |
| `GET` | `/api/v1/rules` | List all supported fix rules |
| `GET` | `/api/v1/health` | Health check |

## Pricing

| Plan | Price | Limits |
|------|-------|--------|
| **Free** | $0 | 100 scans/hour, PR annotations |
| **Pro** | $29/month | 10,000 scans/hour, auto-fix commits |
| **Agency** | $99/month | Unlimited, fix PRs, team access, priority support |

## Supported Rules

Built on [axe-core](https://github.com/dequelabs/axe-core) (MPL-2.0) with custom auto-fix logic for 20+ rule types covering WCAG 2.0, 2.1, and 2.2 at levels A and AA.

## Development

```bash
npm install
npm test          # Run tests
npm run api:dev   # Start API server on :3100
```

## License

MIT
