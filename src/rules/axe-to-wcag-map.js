/**
 * Mapping from axe-core rule IDs to WCAG criteria and auto-fix capabilities.
 *
 * Each entry defines:
 * - wcag: the WCAG criterion (e.g., "1.1.1")
 * - autoFixable: whether we can auto-fix this in source code
 * - fixType: the type of fix strategy to apply
 */
export const AXE_RULE_MAP = {
  // === WCAG 1.1.1 Non-text Content ===
  'image-alt': {
    wcag: '1.1.1',
    autoFixable: true,
    fixType: 'add-alt-attr',
    description: 'Images must have alternate text'
  },
  'input-image-alt': {
    wcag: '1.1.1',
    autoFixable: true,
    fixType: 'add-alt-attr',
    description: 'Image buttons must have alternate text'
  },
  'area-alt': {
    wcag: '1.1.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Area elements of image maps must have alternate text'
  },
  'object-alt': {
    wcag: '1.1.1',
    autoFixable: true,
    fixType: 'add-aria-label',
    description: 'Object elements must have alternate text'
  },
  'svg-img-alt': {
    wcag: '1.1.1',
    autoFixable: true,
    fixType: 'add-svg-title',
    description: 'SVG elements with img role must have alternate text'
  },

  // === WCAG 1.3.1 Info and Relationships ===
  'label': {
    wcag: '1.3.1',
    autoFixable: true,
    fixType: 'add-label',
    description: 'Form elements must have labels'
  },
  'input-button-name': {
    wcag: '1.3.1',
    autoFixable: true,
    fixType: 'add-value-attr',
    description: 'Input buttons must have discernible text'
  },
  'list': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Lists must only contain li, script, or template elements'
  },
  'listitem': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'List items must be contained in a list'
  },
  'definition-list': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Definition lists must only contain dt and dd groups'
  },
  'dlitem': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Definition list items must be wrapped in dl'
  },
  'th-has-data-cells': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Table headers must refer to data cells'
  },
  'td-has-header': {
    wcag: '1.3.1',
    autoFixable: false,
    fixType: 'manual',
    description: 'Table data cells must refer to headers'
  },

  // === WCAG 1.3.5 Identify Input Purpose ===
  'autocomplete-valid': {
    wcag: '1.3.5',
    autoFixable: true,
    fixType: 'fix-autocomplete',
    description: 'Autocomplete attributes must be used correctly'
  },

  // === WCAG 1.4.3 Contrast (Minimum) ===
  'color-contrast': {
    wcag: '1.4.3',
    autoFixable: true,
    fixType: 'fix-color-contrast',
    description: 'Text must have sufficient color contrast'
  },

  // === WCAG 1.4.11 Non-text Contrast ===
  // (axe doesn't have a specific rule; detected via color-contrast-enhanced)

  // === WCAG 2.1.1 Keyboard ===
  'scrollable-region-focusable': {
    wcag: '2.1.1',
    autoFixable: true,
    fixType: 'add-tabindex',
    description: 'Scrollable regions must have keyboard access'
  },

  // === WCAG 2.4.1 Bypass Blocks ===
  'bypass': {
    wcag: '2.4.1',
    autoFixable: true,
    fixType: 'add-skip-link',
    description: 'Pages must provide means to bypass repeated blocks'
  },
  'region': {
    wcag: '2.4.1',
    autoFixable: true,
    fixType: 'add-landmark',
    description: 'All page content must be contained by landmarks'
  },

  // === WCAG 2.4.2 Page Titled ===
  'document-title': {
    wcag: '2.4.2',
    autoFixable: true,
    fixType: 'add-page-title',
    description: 'Documents must have a title element'
  },

  // === WCAG 2.4.4 Link Purpose ===
  'link-name': {
    wcag: '2.4.4',
    autoFixable: false,
    fixType: 'manual',
    description: 'Links must have discernible text'
  },

  // === WCAG 2.4.6 Headings and Labels ===
  'empty-heading': {
    wcag: '2.4.6',
    autoFixable: false,
    fixType: 'manual',
    description: 'Headings must not be empty'
  },

  // === WCAG 2.4.7 Focus Visible ===
  // (primarily CSS-based, hard to auto-detect with axe)

  // === WCAG 3.1.1 Language of Page ===
  'html-has-lang': {
    wcag: '3.1.1',
    autoFixable: true,
    fixType: 'add-html-lang',
    description: 'HTML element must have a lang attribute'
  },
  'html-lang-valid': {
    wcag: '3.1.1',
    autoFixable: true,
    fixType: 'fix-html-lang',
    description: 'HTML lang attribute must have a valid value'
  },
  'html-xml-lang-mismatch': {
    wcag: '3.1.1',
    autoFixable: true,
    fixType: 'fix-xml-lang',
    description: 'HTML xml:lang and lang must match'
  },

  // === WCAG 3.1.2 Language of Parts ===
  'valid-lang': {
    wcag: '3.1.2',
    autoFixable: true,
    fixType: 'fix-lang-attr',
    description: 'Lang attributes must use valid values'
  },

  // === WCAG 3.3.2 Labels or Instructions ===
  'select-name': {
    wcag: '3.3.2',
    autoFixable: true,
    fixType: 'add-label',
    description: 'Select element must have accessible name'
  },

  // === WCAG 4.1.2 Name, Role, Value ===
  'button-name': {
    wcag: '4.1.2',
    autoFixable: true,
    fixType: 'add-aria-label',
    description: 'Buttons must have discernible text'
  },
  'aria-hidden-body': {
    wcag: '4.1.2',
    autoFixable: true,
    fixType: 'remove-aria-hidden',
    description: 'aria-hidden must not be set on the body'
  },
  'frame-title': {
    wcag: '4.1.2',
    autoFixable: true,
    fixType: 'add-frame-title',
    description: 'Frames must have a title attribute'
  },

  // === General ARIA rules ===
  'aria-allowed-attr': {
    wcag: '4.1.2',
    autoFixable: false,
    fixType: 'manual',
    description: 'ARIA attributes must be allowed for the role'
  },
  'aria-required-attr': {
    wcag: '4.1.2',
    autoFixable: false,
    fixType: 'manual',
    description: 'Required ARIA attributes must be provided'
  },
  'aria-valid-attr-value': {
    wcag: '4.1.2',
    autoFixable: false,
    fixType: 'manual',
    description: 'ARIA attributes must have valid values'
  },
  'aria-valid-attr': {
    wcag: '4.1.2',
    autoFixable: false,
    fixType: 'manual',
    description: 'ARIA attributes must be valid and not misspelled'
  },
  'aria-roles': {
    wcag: '4.1.2',
    autoFixable: false,
    fixType: 'manual',
    description: 'ARIA roles must be valid'
  }
};

/**
 * Get all auto-fixable rules
 */
export function getAutoFixableRules() {
  return Object.entries(AXE_RULE_MAP)
    .filter(([, v]) => v.autoFixable)
    .map(([ruleId, v]) => ({ ruleId, ...v }));
}

/**
 * Get fix type for a given axe rule ID
 */
export function getFixType(ruleId) {
  return AXE_RULE_MAP[ruleId] || null;
}
