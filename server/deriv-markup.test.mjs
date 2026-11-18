import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readMarkup } from './deriv-markup.mjs';

test('fetches the requested app row from the New API', async () => {
    const row = { app_id: 'fixture-app', app_markup_usd: 1.21, contract_count: 3 };
    const result = await readMarkup('2026-11-01', '2026-11-19', {
        appId: 'fixture-app', token: 'fixture-token',
        async request(url, options) {
            assert.equal(url.href, 'https://api.derivws.com/applications/v1/markup-statistics?date_from=2026-11-01&date_to=2026-11-19');
            assert.equal(options.headers.Authorization, 'Bearer fixture-token');
            assert.equal(options.headers['Deriv-App-ID'], 'fixture-app');
            return { ok: true, json: async () => ({ data: { breakdown: [{ app_id: 'other' }, row] } }) };
        },
    });
    assert.deepEqual(result, row);
    await assert.rejects(readMarkup('2026-02-30', '2026-03-01'), /date range/);
});
