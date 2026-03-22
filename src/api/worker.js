/**
 * Cloudflare Workers entry point for A11y Fix Engine API.
 * Mirrors server.js but uses Workers runtime.
 */
import { runEngine } from '../core/engine.js';
import { validateApiKey, PLANS } from './billing.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    try {
      // Health
      if (path === '/api/v1/health') {
        return json({ status: 'ok', version: '0.1.0' });
      }

      // Rules
      if (path === '/api/v1/rules') {
        const { AXE_RULE_MAP, getAutoFixableRules } = await import('../rules/axe-to-wcag-map.js');
        return json({
          totalRules: Object.keys(AXE_RULE_MAP).length,
          autoFixable: getAutoFixableRules().length,
          rules: AXE_RULE_MAP,
        });
      }

      // Pricing
      if (path === '/api/v1/pricing') {
        return json({ plans: PLANS });
      }

      // Scan
      if (path === '/api/v1/scan' && request.method === 'POST') {
        const auth = checkAuth(request);
        if (!auth.valid) return json({ error: auth.error }, 401);

        const body = await request.json();
        if (!body.html) return json({ error: 'Missing required field: html' }, 400);

        const result = await runEngine(body.html, {
          standard: body.standard || 'wcag2aa',
          fixEnabled: false,
        });

        return json({ scan: result.scan, violations: result.unfixable, report: result.report });
      }

      // Fix
      if (path === '/api/v1/fix' && request.method === 'POST') {
        const auth = checkAuth(request);
        if (!auth.valid) return json({ error: auth.error }, 401);
        if (!auth.features.includes('fix')) {
          return json({ error: 'Fix feature requires Pro or Agency plan', upgrade: '/api/v1/pricing' }, 403);
        }

        const body = await request.json();
        if (!body.html) return json({ error: 'Missing required field: html' }, 400);

        const result = await runEngine(body.html, {
          standard: body.standard || 'wcag2aa',
          fixEnabled: true,
        });

        return json({
          fixedHTML: result.fixedHTML,
          scan: result.scan,
          fixes: result.fixes,
          unfixable: result.unfixable,
          report: result.report,
        });
      }

      return json({ error: 'Not found' }, 404);

    } catch (error) {
      return json({ error: 'Internal server error', message: error.message }, 500);
    }
  },
};

function checkAuth(request) {
  const apiKey = request.headers.get('X-API-Key') || '';
  return validateApiKey(apiKey);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  };
}
