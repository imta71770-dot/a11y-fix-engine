import { createServer } from 'http';
import { runEngine } from '../core/engine.js';

const PORT = process.env.PORT || 3100;

/**
 * REST API server for A11y Fix Engine.
 * Provides the same core engine as the GitHub Action, wrapped in HTTP API.
 *
 * Endpoints:
 *   POST /api/v1/scan    — Scan HTML, return violations report
 *   POST /api/v1/fix     — Scan + auto-fix HTML, return fixed HTML + report
 *   GET  /api/v1/health  — Health check
 *   GET  /api/v1/rules   — List all supported fix rules
 */
const server = createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // Health check
    if (path === '/api/v1/health' && req.method === 'GET') {
      return json(res, 200, {
        status: 'ok',
        version: '0.1.0',
        engine: 'a11y-fix-engine',
      });
    }

    // List rules
    if (path === '/api/v1/rules' && req.method === 'GET') {
      const { AXE_RULE_MAP, getAutoFixableRules } = await import('../rules/axe-to-wcag-map.js');
      return json(res, 200, {
        totalRules: Object.keys(AXE_RULE_MAP).length,
        autoFixable: getAutoFixableRules().length,
        rules: AXE_RULE_MAP,
      });
    }

    // Scan only (no fixes)
    if (path === '/api/v1/scan' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.html) {
        return json(res, 400, { error: 'Missing required field: html' });
      }

      const apiKey = req.headers['x-api-key'] || '';
      const rateLimitOk = checkRateLimit(apiKey);
      if (!rateLimitOk) {
        return json(res, 429, { error: 'Rate limit exceeded. Upgrade for higher limits.' });
      }

      const result = await runEngine(body.html, {
        standard: body.standard || 'wcag2aa',
        fixEnabled: false,
      });

      return json(res, 200, {
        scan: result.scan,
        violations: result.unfixable,
        report: result.report,
      });
    }

    // Scan + Fix
    if (path === '/api/v1/fix' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.html) {
        return json(res, 400, { error: 'Missing required field: html' });
      }

      const apiKey = req.headers['x-api-key'] || '';
      const rateLimitOk = checkRateLimit(apiKey);
      if (!rateLimitOk) {
        return json(res, 429, { error: 'Rate limit exceeded. Upgrade for higher limits.' });
      }

      const result = await runEngine(body.html, {
        standard: body.standard || 'wcag2aa',
        fixEnabled: true,
      });

      return json(res, 200, {
        fixedHTML: result.fixedHTML,
        scan: result.scan,
        fixes: result.fixes,
        unfixable: result.unfixable,
        report: result.report,
      });
    }

    // 404
    return json(res, 404, { error: 'Not found' });

  } catch (error) {
    console.error('Error:', error);
    return json(res, 500, { error: 'Internal server error', message: error.message });
  }
});

// === Helpers ===

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Simple in-memory rate limiter.
 * Free tier: 100 requests/hour. Premium: unlimited.
 */
const rateLimits = new Map();

function checkRateLimit(apiKey) {
  // Premium keys bypass rate limiting
  if (apiKey && apiKey.startsWith('a11y_pro_')) return true;

  const key = apiKey || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = apiKey ? 1000 : 100; // Free: 100/hr, Basic: 1000/hr

  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, windowStart: now });
    return true;
  }

  const entry = rateLimits.get(key);
  if (now - entry.windowStart > windowMs) {
    entry.count = 1;
    entry.windowStart = now;
    return true;
  }

  entry.count++;
  return entry.count <= maxRequests;
}

server.listen(PORT, () => {
  console.log(`A11y Fix Engine API running on http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST /api/v1/scan  — Scan HTML for violations`);
  console.log(`  POST /api/v1/fix   — Scan + auto-fix HTML`);
  console.log(`  GET  /api/v1/rules — List supported rules`);
  console.log(`  GET  /api/v1/health — Health check`);
});
