const assert = require('node:assert/strict');
const { test } = require('node:test');
const { registerDerivAuth } = require('./deriv-auth');

test('provisions a missing session table and issues an OTP from the authenticated session', async t => {
    const routes = {};
    let created = 0;
    let firstSave = true;
    const prisma = {
        derivSession: {
            findUnique: async () => ({ expiresAt: new Date(Date.now() + 60000), accessToken: 'fixture-only' }),
            create: () => 'write',
            deleteMany: () => 'delete',
        },
        $transaction: async () => {
            if (!firstSave) return;
            firstSave = false;
            throw { code: 'P2021' };
        },
        $executeRaw: async () => { created++; },
    };
    registerDerivAuth({
        use() {},
        get(path, handler) { routes[path] = handler; },
        post(path, handler) { routes[path] = handler; },
    }, () => prisma);

    const hostname = 'fxprotradesite-one.vercel.app';
    const req = {
        hostname,
        get: () => 'https://' + hostname,
        headers: { cookie: '__Host-deriv-oauth=state.verifier.' + Date.now() },
        body: { code: 'fixture-code', state: 'state' },
    };
    const response = () => ({
        sendStatus(code) { this.status = code; },
        clearCookie() {},
        cookie(name, value) { this.session = value; },
        json(value) { this.data = value; },
    });
    const fetch = t.mock.method(global, 'fetch', async () => ({
        ok: true, json: async () => ({ access_token: 'fixture-only', expires_in: 60 }),
    }));

    const callback = response();
    await routes['/api/deriv/callback'](req, callback);
    assert.equal(callback.status, 204);
    assert.equal(created, 2);

    req.headers.cookie = '__Host-deriv-session=' + callback.session;
    req.body = { accountId: 'DOT90004580' };
    fetch.mock.mockImplementation(async (url, options) => {
        assert.equal(url, 'https://api.derivws.com/trading/v1/options/accounts/DOT90004580/otp');
        assert.equal(options.method, 'POST');
        assert.equal(options.headers.Authorization, 'Bearer fixture-only');
        return { ok: true, json: async () => ({ data: { url: 'wss://api.derivws.com/trading/v1/options/ws/demo?otp=fixture' } }) };
    });
    const socket = response();
    await routes['/api/deriv/socket'](req, socket);
    assert.equal(socket.data.url, 'wss://api.derivws.com/trading/v1/options/ws/demo?otp=fixture');
    const csrf = response();
    await routes['/api/deriv/socket']({ ...req, get: () => 'https://example.com' }, csrf);
    assert.equal(csrf.status, 403);
});
