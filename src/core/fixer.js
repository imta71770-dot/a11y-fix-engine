import { JSDOM } from 'jsdom';
import { getFixType } from '../rules/axe-to-wcag-map.js';

/**
 * Apply auto-fixes to HTML based on axe-core violations.
 *
 * @param {string} html - Original HTML source
 * @param {Array} violations - axe-core violations array
 * @returns {{fixedHTML: string, fixes: Array, unfixable: Array}}
 */
export function applyFixes(html, violations) {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const fixes = [];
  const unfixable = [];

  for (const violation of violations) {
    const rule = getFixType(violation.id);

    if (!rule || !rule.autoFixable) {
      unfixable.push({
        ruleId: violation.id,
        wcag: rule?.wcag || 'unknown',
        description: violation.description,
        impact: violation.impact,
        nodes: violation.nodes.length,
        helpUrl: violation.helpUrl,
      });
      continue;
    }

    for (const node of violation.nodes) {
      const fix = applyFix(document, node, rule, violation);
      if (fix) {
        fixes.push(fix);
      } else {
        unfixable.push({
          ruleId: violation.id,
          wcag: rule.wcag,
          description: violation.description,
          impact: violation.impact,
          nodes: 1,
          reason: 'Element not found or fix could not be applied',
          helpUrl: violation.helpUrl,
        });
      }
    }
  }

  const fixedHTML = dom.serialize();
  dom.window.close();

  return { fixedHTML, fixes, unfixable };
}

/**
 * Apply a single fix to a DOM element.
 */
function applyFix(document, node, rule, violation) {
  // Try to find the element using the target selector
  let element = null;
  for (const selector of node.target) {
    try {
      element = document.querySelector(selector);
      if (element) break;
    } catch {
      // Invalid selector, skip
    }
  }

  if (!element) return null;

  const before = element.outerHTML;

  switch (rule.fixType) {
    case 'add-alt-attr':
      return fixAddAlt(element, before, violation);

    case 'add-aria-label':
      return fixAddAriaLabel(element, before, violation);

    case 'add-svg-title':
      return fixAddSvgTitle(element, before, violation);

    case 'add-label':
      return fixAddLabel(element, document, before, violation);

    case 'add-value-attr':
      return fixAddValue(element, before, violation);

    case 'fix-color-contrast':
      return fixColorContrast(element, before, violation);

    case 'add-tabindex':
      return fixAddTabindex(element, before, violation);

    case 'add-skip-link':
      return fixAddSkipLink(element, document, before, violation);

    case 'add-landmark':
      return fixAddLandmark(element, before, violation);

    case 'add-page-title':
      return fixAddPageTitle(document, before, violation);

    case 'add-html-lang':
      return fixAddHtmlLang(element, before, violation);

    case 'fix-html-lang':
      return fixHtmlLangValid(element, before, violation);

    case 'fix-xml-lang':
      return fixXmlLang(element, before, violation);

    case 'fix-lang-attr':
      return fixLangAttr(element, before, violation);

    case 'remove-aria-hidden':
      return fixRemoveAriaHidden(element, before, violation);

    case 'add-frame-title':
      return fixAddFrameTitle(element, before, violation);

    case 'fix-autocomplete':
      return fixAutocomplete(element, before, violation);

    default:
      return null;
  }
}

// === Fix implementations ===

function fixAddAlt(element, before, violation) {
  if (element.hasAttribute('alt')) return null;
  // Use meaningful placeholder — AI enhancement would generate real alt text
  const src = element.getAttribute('src') || '';
  const filename = src.split('/').pop()?.split('.')[0]?.replace(/[-_]/g, ' ') || 'image';
  element.setAttribute('alt', `TODO: Describe this image — ${filename}`);
  return createFix('add-alt-attr', before, element.outerHTML, violation,
    'Added alt attribute. Replace TODO placeholder with a meaningful description.');
}

function fixAddAriaLabel(element, before, violation) {
  if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) return null;
  const tag = element.tagName.toLowerCase();
  element.setAttribute('aria-label', `TODO: Add accessible label for this ${tag}`);
  return createFix('add-aria-label', before, element.outerHTML, violation,
    'Added aria-label. Replace TODO with a meaningful label.');
}

function fixAddSvgTitle(element, before, violation) {
  if (element.querySelector('title')) return null;
  const title = element.ownerDocument.createElement('title');
  title.textContent = 'TODO: Describe this SVG image';
  element.prepend(title);
  if (!element.hasAttribute('role')) element.setAttribute('role', 'img');
  return createFix('add-svg-title', before, element.outerHTML, violation,
    'Added <title> to SVG and role="img". Replace TODO with a description.');
}

function fixAddLabel(element, document, before, violation) {
  // Check if a label already exists
  const id = element.getAttribute('id');
  if (id && document.querySelector(`label[for="${id}"]`)) return null;
  if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) return null;

  // Generate an ID if needed
  if (!id) {
    const generatedId = `a11y-fix-${element.tagName.toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;
    element.setAttribute('id', generatedId);
  }

  // Add aria-label as a safe fix (adding a <label> element could break layouts)
  const type = element.getAttribute('type') || element.tagName.toLowerCase();
  element.setAttribute('aria-label', `TODO: Label for ${type} input`);
  return createFix('add-label', before, element.outerHTML, violation,
    'Added aria-label. Prefer adding a visible <label> element for better UX.');
}

function fixAddValue(element, before, violation) {
  if (element.hasAttribute('value') && element.getAttribute('value').trim()) return null;
  element.setAttribute('value', 'TODO: Button text');
  return createFix('add-value-attr', before, element.outerHTML, violation,
    'Added value attribute. Replace TODO with meaningful button text.');
}

function fixColorContrast(element, before, violation) {
  // Extract contrast data from axe node
  const data = violation.nodes?.[0]?.any?.[0]?.data;
  if (!data) return null;

  const { fgColor, bgColor, contrastRatio, expectedContrastRatio } = data;
  if (!fgColor || !expectedContrastRatio) return null;

  // Darken/lighten foreground to meet ratio — simple approach
  const currentStyle = element.getAttribute('style') || '';
  element.setAttribute('style',
    `${currentStyle}; /* a11y-fix: contrast was ${contrastRatio?.toFixed(2)}, needs ${expectedContrastRatio} */`.trim()
  );

  return createFix('fix-color-contrast', before, element.outerHTML, violation,
    `Color contrast ratio is ${contrastRatio?.toFixed(2)}, needs ${expectedContrastRatio}. ` +
    `Manual adjustment required — update foreground or background color.`);
}

function fixAddTabindex(element, before, violation) {
  if (element.hasAttribute('tabindex')) return null;
  element.setAttribute('tabindex', '0');
  return createFix('add-tabindex', before, element.outerHTML, violation,
    'Added tabindex="0" to make scrollable region keyboard accessible.');
}

function fixAddSkipLink(element, document, before, violation) {
  const main = document.querySelector('main') || document.querySelector('[role="main"]');
  if (!main) return null;

  if (!main.hasAttribute('id')) {
    main.setAttribute('id', 'main-content');
  }

  const existing = document.querySelector('a[href="#main-content"], a.skip-link');
  if (existing) return null;

  const skipLink = document.createElement('a');
  skipLink.setAttribute('href', `#${main.getAttribute('id')}`);
  skipLink.setAttribute('class', 'skip-link');
  skipLink.textContent = 'Skip to main content';
  document.body.prepend(skipLink);

  return createFix('add-skip-link', before, skipLink.outerHTML, violation,
    'Added skip navigation link. Style with CSS to show on focus.');
}

function fixAddLandmark(element, before, violation) {
  const tag = element.tagName.toLowerCase();
  if (['header', 'nav', 'main', 'footer', 'aside', 'section', 'article'].includes(tag)) return null;

  // Add role="main" for the primary content area if it looks like one
  if (!element.hasAttribute('role')) {
    element.setAttribute('role', 'region');
    element.setAttribute('aria-label', 'TODO: Name this content region');
  }
  return createFix('add-landmark', before, element.outerHTML, violation,
    'Added landmark role. Consider using semantic HTML elements instead (<main>, <nav>, etc.).');
}

function fixAddPageTitle(document, before, violation) {
  let title = document.querySelector('title');
  if (title && title.textContent.trim()) return null;

  if (!title) {
    title = document.createElement('title');
    document.head.appendChild(title);
  }
  title.textContent = 'TODO: Add page title';
  return createFix('add-page-title', before, title.outerHTML, violation,
    'Added <title> element. Replace TODO with a descriptive page title.');
}

function fixAddHtmlLang(element, before, violation) {
  if (element.hasAttribute('lang')) return null;
  element.setAttribute('lang', 'en');
  return createFix('add-html-lang', before, element.outerHTML.slice(0, 100), violation,
    'Added lang="en" to <html>. Change to the appropriate language code if not English.');
}

function fixHtmlLangValid(element, before, violation) {
  const lang = element.getAttribute('lang');
  if (lang && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(lang)) return null;
  element.setAttribute('lang', 'en');
  return createFix('fix-html-lang', before, element.outerHTML.slice(0, 100), violation,
    `Replaced invalid lang="${lang}" with "en". Set the correct language code.`);
}

function fixXmlLang(element, before, violation) {
  const lang = element.getAttribute('lang');
  const xmlLang = element.getAttribute('xml:lang');
  if (lang && xmlLang && lang === xmlLang) return null;
  if (lang) {
    element.setAttribute('xml:lang', lang);
  }
  return createFix('fix-xml-lang', before, element.outerHTML.slice(0, 100), violation,
    'Synchronized xml:lang with lang attribute.');
}

function fixLangAttr(element, before, violation) {
  const lang = element.getAttribute('lang');
  if (lang && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(lang)) return null;
  element.removeAttribute('lang');
  return createFix('fix-lang-attr', before, element.outerHTML, violation,
    `Removed invalid lang="${lang}". Add a valid BCP 47 language tag if needed.`);
}

function fixRemoveAriaHidden(element, before, violation) {
  element.removeAttribute('aria-hidden');
  return createFix('remove-aria-hidden', before, element.outerHTML.slice(0, 100), violation,
    'Removed aria-hidden from <body>. Body must never be hidden from assistive technology.');
}

function fixAddFrameTitle(element, before, violation) {
  if (element.hasAttribute('title') && element.getAttribute('title').trim()) return null;
  const src = element.getAttribute('src') || '';
  element.setAttribute('title', `TODO: Describe this embedded content — ${src.split('/').pop() || 'frame'}`);
  return createFix('add-frame-title', before, element.outerHTML, violation,
    'Added title attribute to frame/iframe. Replace TODO with a meaningful description.');
}

function fixAutocomplete(element, before, violation) {
  const type = element.getAttribute('type') || 'text';
  const name = (element.getAttribute('name') || '').toLowerCase();

  const autocompleteMap = {
    email: 'email',
    tel: 'tel',
    password: 'current-password',
    url: 'url',
  };

  const nameMap = {
    fname: 'given-name', firstname: 'given-name', 'first-name': 'given-name',
    lname: 'family-name', lastname: 'family-name', 'last-name': 'family-name',
    email: 'email', phone: 'tel', zip: 'postal-code', zipcode: 'postal-code',
    city: 'address-level2', state: 'address-level1', country: 'country-name',
    address: 'street-address', username: 'username',
  };

  const value = autocompleteMap[type] || nameMap[name];
  if (!value) return null;

  element.setAttribute('autocomplete', value);
  return createFix('fix-autocomplete', before, element.outerHTML, violation,
    `Added autocomplete="${value}". Verify this matches the input's purpose.`);
}

// === Helper ===

function createFix(fixType, beforeHTML, afterHTML, violation, note) {
  return {
    fixType,
    ruleId: violation.id,
    wcag: violation.tags?.find(t => t.startsWith('wcag'))?.replace('wcag', '') || '',
    impact: violation.impact,
    description: violation.description,
    before: beforeHTML,
    after: afterHTML,
    note,
  };
}
