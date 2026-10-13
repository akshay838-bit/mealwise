import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync(new URL('../.meal-agent-executor.json', import.meta.url), 'utf8'));
const [action = 'list', input] = process.argv.slice(2);
const allowed = new Set(['list', 'step-result', 'order-history', 'reset-run', 'interpret', 'dinner-start', 'next-day-start', 'send-meal-plan', 'sync', 'clarify', 'selection', 'notify', 'preview', 'claim', 'payment-link', 'paid', 'failed', 'supersede']);
if (!allowed.has(action)) throw new Error('Unknown bridge action');
const data = input ? JSON.parse(readFileSync(input, 'utf8')) : {};
if (['claim', 'payment-link', 'paid'].includes(action) && !config.ready) throw new Error('Executor setup is not verified; checkout disabled');
const response = await fetch(config.baseUrl + '/api/internal/groceries', {
  method: action === 'list' ? 'GET' : 'POST',
  headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
  body: action === 'list' ? undefined : JSON.stringify({ ...data, action }),
  signal: AbortSignal.timeout(25000),
});
const result = await response.json().catch(() => ({ error: 'Non-JSON response', status: response.status }));
console.log(JSON.stringify(result));
if (!response.ok) process.exitCode = 1;
