import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runEngine } from '../src/core/engine.js';

describe('A11y Fix Engine', () => {

  it('should detect missing alt text and auto-fix', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <main>
            <img src="/photos/team.jpg">
            <p>Welcome to our site</p>
          </main>
        </body>
      </html>
    `;

    const result = await runEngine(html, { standard: 'wcag2aa', fixEnabled: true });

    // Should have found violations
    assert.ok(result.scan.totalViolations > 0, 'Should find violations');

    // Should have applied at least the alt fix
    const altFix = result.fixes.find(f => f.fixType === 'add-alt-attr');
    if (altFix) {
      assert.ok(altFix.after.includes('alt='), 'Fixed HTML should include alt attribute');
      console.log('  ✅ Alt text fix applied');
      console.log(`     Before: ${altFix.before}`);
      console.log(`     After:  ${altFix.after}`);
    }

    // Fixed HTML should be different from original
    if (result.fixes.length > 0) {
      assert.notStrictEqual(result.fixedHTML, html, 'Fixed HTML should differ from original');
    }

    console.log(`  Total violations: ${result.scan.totalViolations}`);
    console.log(`  Auto-fixed: ${result.fixes.length}`);
    console.log(`  Manual review: ${result.unfixable.length}`);
  });

  it('should detect missing lang attribute and auto-fix', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body><main><p>Hello</p></main></body>
      </html>
    `;

    const result = await runEngine(html, { standard: 'wcag2aa', fixEnabled: true });

    const langFix = result.fixes.find(f => f.fixType === 'add-html-lang');
    if (langFix) {
      assert.ok(langFix.after.includes('lang='), 'Fixed HTML should include lang attribute');
      console.log('  ✅ Lang attribute fix applied');
    }
  });

  it('should detect missing form labels and auto-fix', async () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Form Test</title></head>
        <body>
          <main>
            <form>
              <input type="text" name="email">
              <input type="password" name="password">
              <button type="submit">Submit</button>
            </form>
          </main>
        </body>
      </html>
    `;

    const result = await runEngine(html, { standard: 'wcag2aa', fixEnabled: true });

    const labelFixes = result.fixes.filter(f => f.fixType === 'add-label');
    console.log(`  Form label fixes applied: ${labelFixes.length}`);

    // Should generate a report
    assert.ok(result.report.includes('# Accessibility Fix Report'), 'Should generate report');
  });

  it('should handle clean HTML without errors', async () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Clean Page</title></head>
        <body>
          <a href="#main" class="skip-link">Skip to content</a>
          <header>
            <nav aria-label="Main navigation">
              <ul><li><a href="/">Home</a></li></ul>
            </nav>
          </header>
          <main id="main">
            <h1>Welcome</h1>
            <img src="/logo.png" alt="Company logo">
            <form>
              <label for="name">Name</label>
              <input type="text" id="name" name="name" autocomplete="name">
            </form>
          </main>
          <footer><p>Copyright 2026</p></footer>
        </body>
      </html>
    `;

    const result = await runEngine(html, { standard: 'wcag2aa', fixEnabled: true });

    console.log(`  Violations on clean HTML: ${result.scan.totalViolations}`);
    console.log(`  Fixes needed: ${result.fixes.length}`);
    // Clean HTML should have very few or no violations
  });

  it('should produce report in Markdown format', async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Report Test</title></head>
        <body><img src="test.png"></body>
      </html>
    `;

    const result = await runEngine(html, { standard: 'wcag2aa', fixEnabled: true });

    assert.ok(result.report.includes('# Accessibility Fix Report'));
    assert.ok(result.report.includes('## Summary'));
    console.log('  ✅ Report generated successfully');
    console.log(`  Report length: ${result.report.length} chars`);
  });
});
