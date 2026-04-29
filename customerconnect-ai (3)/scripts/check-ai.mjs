#!/usr/bin/env node

const args = process.argv.slice(2);
const healthOnly = args.includes('--health-only');
const urlArg = args.find((arg) => arg.startsWith('--url='));
const baseUrl = urlArg ? urlArg.slice('--url='.length) : (process.env.APP_URL || 'http://localhost:3000');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function summarizeContent(value) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 120);
}

async function main() {
  const endpoint = new URL('/api/ai', baseUrl);

  const healthResponse = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  const healthPayload = await healthResponse.json().catch(() => ({}));

  if (!healthResponse.ok) {
    fail(`AI health check failed with HTTP ${healthResponse.status}.`);
  }

  console.log(`[health] ${endpoint.toString()}`);
  console.log(`  ok: ${String(healthPayload?.ok === true)}`);
  console.log(`  mode: ${healthPayload?.mode || 'unknown'}`);
  console.log(`  model: ${healthPayload?.model || 'not configured'}`);

  if (healthPayload?.ok !== true) {
    fail('Gemma proxy is not ready. Set AI_COMPLETIONS_URL, AI_MODEL, and AI_API_KEY before launch.');
  }

  if (healthOnly) {
    console.log('AI health check passed.');
    return;
  }

  const smokeResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'Reply with a short plain-text acknowledgement.' },
        { role: 'user', content: 'Reply with READY for CustomerConnect AI.' },
      ],
      temperature: 0,
    }),
  });

  const smokePayload = await smokeResponse.json().catch(() => ({}));

  if (!smokeResponse.ok) {
    fail(`AI smoke test failed with HTTP ${smokeResponse.status}: ${smokePayload?.error || 'Unknown error.'}`);
  }

  if (typeof smokePayload?.content !== 'string' || !smokePayload.content.trim()) {
    fail('AI smoke test returned an empty response.');
  }

  console.log(`[smoke] ${summarizeContent(smokePayload.content)}`);
  console.log('Gemma integration is healthy.');
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : 'Unexpected AI check failure.');
});
