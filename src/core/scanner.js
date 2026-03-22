import { JSDOM } from 'jsdom';
import axe from 'axe-core';

/**
 * Scan HTML content for WCAG accessibility violations using axe-core.
 *
 * @param {string} html - The HTML string to scan
 * @param {object} options - Scan options
 * @param {string} options.standard - WCAG standard: 'wcag2a', 'wcag2aa', 'wcag2aaa'
 * @returns {Promise<{violations: Array, passes: Array, incomplete: Array}>}
 */
export async function scanHTML(html, options = {}) {
  const standard = options.standard || 'wcag2aa';

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });

  const { document } = dom.window;

  // Inject axe-core into the JSDOM environment
  const axeScript = dom.window.document.createElement('script');
  axeScript.textContent = axe.source;
  document.head.appendChild(axeScript);

  // Run axe-core
  const results = await dom.window.axe.run(document, {
    runOnly: {
      type: 'tag',
      values: getTagsForStandard(standard),
    },
    resultTypes: ['violations', 'passes', 'incomplete'],
  });

  dom.window.close();

  return {
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    summary: {
      totalViolations: results.violations.length,
      totalIssues: results.violations.reduce((sum, v) => sum + v.nodes.length, 0),
      critical: results.violations.filter(v => v.impact === 'critical').length,
      serious: results.violations.filter(v => v.impact === 'serious').length,
      moderate: results.violations.filter(v => v.impact === 'moderate').length,
      minor: results.violations.filter(v => v.impact === 'minor').length,
    },
  };
}

function getTagsForStandard(standard) {
  switch (standard) {
    case 'wcag2a':
      return ['wcag2a', 'wcag21a'];
    case 'wcag2aa':
      return ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
    case 'wcag2aaa':
      return ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
    default:
      return ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  }
}
