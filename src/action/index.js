import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { glob } from 'fs';
import { runEngine } from '../core/engine.js';

/**
 * GitHub Action entry point.
 * Scans HTML files, applies fixes, and outputs results.
 */
async function run() {
  try {
    // Parse inputs (GitHub Actions sets INPUT_ env vars)
    const pathPattern = getInput('path', '**/*.html');
    const standard = getInput('standard', 'wcag2aa');
    const fixMode = getInput('fix', 'report');
    const failOn = getInput('fail_on', 'serious');
    const apiKey = getInput('api_key', '');

    console.log(`🔍 A11y Fix Engine`);
    console.log(`   Standard: ${standard}`);
    console.log(`   Fix mode: ${fixMode}`);
    console.log(`   Scanning: ${pathPattern}`);
    console.log('');

    // Find HTML files
    const files = await findFiles(pathPattern);
    if (files.length === 0) {
      console.log('No HTML files found matching the pattern.');
      setOutput('total_violations', '0');
      setOutput('total_fixed', '0');
      setOutput('total_manual', '0');
      return;
    }

    console.log(`Found ${files.length} HTML file(s) to scan.`);
    console.log('');

    let totalViolations = 0;
    let totalFixed = 0;
    let totalManual = 0;
    const allReports = [];
    const severityLevels = ['minor', 'moderate', 'serious', 'critical'];
    const failThreshold = severityLevels.indexOf(failOn);
    let shouldFail = false;

    for (const file of files) {
      console.log(`Scanning: ${file}`);
      const html = readFileSync(file, 'utf-8');

      const result = await runEngine(html, {
        standard,
        fixEnabled: fixMode !== 'report',
      });

      totalViolations += result.scan.totalViolations;
      totalFixed += result.fixes.length;
      totalManual += result.unfixable.length;

      // Check if we should fail the build
      if (failOn !== 'none') {
        for (const violation of result.unfixable) {
          const level = severityLevels.indexOf(violation.impact);
          if (level >= failThreshold) {
            shouldFail = true;
          }
        }
      }

      // Output annotations (GitHub Actions workflow commands)
      for (const issue of result.unfixable) {
        const level = issue.impact === 'critical' || issue.impact === 'serious' ? 'error' : 'warning';
        console.log(`::${level} file=${file}::${issue.description} (WCAG ${issue.wcag}, ${issue.impact})`);
      }

      for (const fix of result.fixes) {
        console.log(`::notice file=${file}::Auto-fixed: ${fix.description} (${fix.fixType})`);
      }

      // Write fixed HTML if in commit/pr mode
      if (fixMode !== 'report' && result.fixes.length > 0) {
        writeFileSync(file, result.fixedHTML);
        console.log(`  ✅ Applied ${result.fixes.length} fix(es)`);
      }

      allReports.push(`## ${file}\n\n${result.report}`);
      console.log(`  Found: ${result.scan.totalViolations} violations, Fixed: ${result.fixes.length}, Manual: ${result.unfixable.length}`);
      console.log('');
    }

    // Write combined report
    const reportPath = 'a11y-fix-report.md';
    const fullReport = allReports.join('\n\n---\n\n');
    writeFileSync(reportPath, fullReport);

    // Set outputs
    setOutput('total_violations', String(totalViolations));
    setOutput('total_fixed', String(totalFixed));
    setOutput('total_manual', String(totalManual));
    setOutput('report', reportPath);

    // Summary
    console.log('━'.repeat(50));
    console.log(`Total: ${totalViolations} violations, ${totalFixed} auto-fixed, ${totalManual} need manual review`);

    if (shouldFail) {
      console.log(`::error::Accessibility check failed — ${totalManual} issue(s) at ${failOn} level or above`);
      process.exit(1);
    }

  } catch (error) {
    console.log(`::error::${error.message}`);
    process.exit(1);
  }
}

// === Helpers ===

function getInput(name, defaultValue) {
  return process.env[`INPUT_${name.toUpperCase()}`] || defaultValue;
}

function setOutput(name, value) {
  const outputFile = process.env['GITHUB_OUTPUT'];
  if (outputFile) {
    const { appendFileSync } = require('fs');
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
  console.log(`  Output: ${name}=${value}`);
}

async function findFiles(pattern) {
  const { promisify } = await import('util');
  // Simple glob implementation for GitHub Action context
  const { execSync } = await import('child_process');
  try {
    const result = execSync(`find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*"`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
    return result.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

run();
