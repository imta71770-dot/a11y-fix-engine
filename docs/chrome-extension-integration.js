/**
 * Chrome Extension Integration Code for AccessibleWeb Guide
 *
 * This file provides the integration layer between the blog project's
 * planned Chrome extension and the A11y Fix Engine API.
 *
 * Copy this into the blog project's Chrome extension source.
 * Path: ~/personal-agents/digital-products/a11y-blog-site/extension/
 */

// === Configuration ===
const API_BASE = 'https://a11y-fix-engine-api.workers.dev';

// === Main Functions ===

/**
 * Scan the current page for accessibility issues.
 * Called from the extension popup when user clicks "Scan".
 */
async function scanCurrentPage(apiKey = '') {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Get the page HTML
  const [{ result: html }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  // Call A11y Fix Engine API
  const response = await fetch(`${API_BASE}/api/v1/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
    body: JSON.stringify({ html, standard: 'wcag2aa' }),
  });

  return response.json();
}

/**
 * Scan and get fix suggestions for the current page.
 * Requires Pro or Agency API key.
 */
async function getFixSuggestions(apiKey) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result: html }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => document.documentElement.outerHTML,
  });

  const response = await fetch(`${API_BASE}/api/v1/fix`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ html, standard: 'wcag2aa' }),
  });

  return response.json();
}

/**
 * Highlight violations on the current page.
 * Injects CSS highlights on affected elements.
 */
async function highlightViolations(tabId, violations) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (violations) => {
      // Remove previous highlights
      document.querySelectorAll('.a11y-fix-highlight').forEach(el => {
        el.style.outline = '';
        el.classList.remove('a11y-fix-highlight');
      });

      // Add highlights for each violation
      for (const violation of violations) {
        const severity = violation.impact;
        const color = {
          critical: '#d32f2f',
          serious: '#f57c00',
          moderate: '#fbc02d',
          minor: '#1976d2',
        }[severity] || '#999';

        // Try to find elements (violations have CSS selectors)
        try {
          const elements = document.querySelectorAll(violation.selector || '*');
          elements.forEach(el => {
            el.style.outline = `3px solid ${color}`;
            el.classList.add('a11y-fix-highlight');
            el.title = `A11y: ${violation.description} (${severity})`;
          });
        } catch (e) {
          // Invalid selector, skip
        }
      }
    },
    args: [violations],
  });
}

/**
 * Show scan results in the extension popup.
 */
function renderResults(container, result) {
  const { scan, violations, fixes } = result;

  container.innerHTML = `
    <div class="a11y-results">
      <div class="summary">
        <h3>Scan Results</h3>
        <div class="stats">
          <span class="stat critical">${scan.critical} Critical</span>
          <span class="stat serious">${scan.serious} Serious</span>
          <span class="stat moderate">${scan.moderate} Moderate</span>
          <span class="stat minor">${scan.minor} Minor</span>
        </div>
        ${fixes ? `<p class="fixed">Auto-fixed: ${fixes.length} issues</p>` : ''}
      </div>

      <div class="violations">
        ${(violations || []).map(v => `
          <div class="violation ${v.impact}">
            <strong>${v.description}</strong>
            <span class="badge">WCAG ${v.wcag}</span>
            <span class="badge ${v.impact}">${v.impact}</span>
            <p>${v.nodes} element(s) affected</p>
            ${v.helpUrl ? `<a href="${v.helpUrl}" target="_blank">Learn more</a>` : ''}
          </div>
        `).join('')}
      </div>

      ${fixes && fixes.length > 0 ? `
        <div class="fixes">
          <h3>Auto-Fixed</h3>
          ${fixes.map(f => `
            <div class="fix">
              <strong>${f.description}</strong>
              <p>${f.note}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

// Export for use in extension
if (typeof module !== 'undefined') {
  module.exports = { scanCurrentPage, getFixSuggestions, highlightViolations, renderResults };
}
