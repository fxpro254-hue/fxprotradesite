const { createHash, randomBytes } = require('node:crypto');

const clientId = '34ZNM9wiC1RF8OpAdLUEY';
const hosts = new Set(['www.fxprotradesite-one.vercel.app', 'fxprotradesite-one.vercel.app']);
const flowCookie = '__Host-deriv-oauth';
const sessionCookie = '__Host-deriv-session';
const cookieOptions = { httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
const randomId = () => randomBytes(32).toString('base64url');
const digest = value => createHash('sha256').update(value).digest('base64url');
const readCookie = (req, name) => req.headers.cookie?.match(new RegExp('(?:^|; )' + name + '=([A-Za-z0-9_.-]+)(?:;|$)'))?.[1];

const registerDerivAuth = (app, prisma) => {
    app.use('/api/deriv', (req, res, next) => {
        res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
        next();
    });

    app.get('/api/deriv/login', (req, res) => {
        if (!hosts.has(req.hostname)) return res.status(400).send('Open this login from the registered trading site.');

        const state = randomId();
        const verifier = randomId();
        res.cookie(flowCookie, [state, verifier, Date.now()].join('.'), { ...cookieOptions, maxAge: 600000 });
        const query = new URLSearchParams({
            client_id: clientId,
            redirect_uri: 'https://' + req.hostname + '/callback',
            response_type: 'code',
            scope: 'trade',
            state,
            code_challenge: digest(verifier),
            code_challenge_method: 'S256',
        });
        return res.redirect('https://auth.deriv.com/oauth2/auth?' + query);
    });

    app.post('/api/deriv/callback', async (req, res) => {
        if (!hosts.has(req.hostname) || req.get('origin') !== 'https://' + req.hostname) return res.sendStatus(403);
        const { code, state: returnedState, error } = req.body ?? {};
        const [state, verifier, issued] = (readCookie(req, flowCookie) || '').split('.');
        const fresh = /^\d+$/.test(issued) && Date.now() - Number(issued) < 600000 && Date.now() >= Number(issued);
        res.clearCookie(flowCookie, cookieOptions);
        const failure = () => res.sendStatus(400);
        if (!state || !verifier || !fresh || state !== returnedState || error || typeof code !== 'string' || !code) return failure();

        try {
            const response = await fetch('https://auth.deriv.com/oauth2/token', {
                method: 'POST',
                redirect: 'error',
                signal: AbortSignal.timeout(10000),
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    redirect_uri: 'https://' + req.hostname + '/callback',
                    code_verifier: verifier,
                }),
            });
            if (!response.ok) return failure();
            const { access_token, expires_in } = await response.json();
            if (typeof access_token !== 'string' || !access_token ||
                !Number.isSafeInteger(expires_in) || expires_in <= 0) return failure();

            const id = randomId();
            const maxAge = Math.min(expires_in, 30 * 86400) * 1000;
            const previous = readCookie(req, sessionCookie);
            await prisma.$transaction([
                prisma.derivSession.deleteMany({ where: { OR: [
                    { expiresAt: { lte: new Date() } },
                    ...(previous ? [{ id: digest(previous) }] : []),
                ] } }),
                prisma.derivSession.create({
                    data: { id: digest(id), accessToken: access_token, expiresAt: new Date(Date.now() + maxAge) },
                }),
            ]);
            res.cookie(sessionCookie, id, { ...cookieOptions, maxAge });
            return res.sendStatus(204);
        } catch {
            return failure();
        }
    });

    app.get('/api/deriv/accounts', async (req, res) => {
        const id = readCookie(req, sessionCookie);
        if (!id) return res.sendStatus(401);
        try {
            const session = await prisma.derivSession.findUnique({ where: { id: digest(id) } });
            if (!session || session.expiresAt <= new Date()) return res.sendStatus(401);
            const response = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
                headers: { Authorization: 'Bearer ' + session.accessToken },
                redirect: 'error',
                signal: AbortSignal.timeout(10000),
            });
            if (response.status === 401) return res.sendStatus(401);
            if (!response.ok) return res.sendStatus(502);
            const { data } = await response.json();
            if (!Array.isArray(data)) return res.sendStatus(502);
            return res.json({ accounts: data.map(({ account_id, account_type, currency, status }) => ({
                account_id, account_type, currency, status,
            })) });
        } catch {
            return res.sendStatus(502);
        }
    });

    app.post('/api/deriv/logout', async (req, res) => {
        if (!hosts.has(req.hostname) || req.get('origin') !== 'https://' + req.hostname) return res.sendStatus(403);
        const id = readCookie(req, sessionCookie);
        try {
            if (id) await prisma.derivSession.deleteMany({ where: { id: digest(id) } });
            res.clearCookie(sessionCookie, cookieOptions);
            return res.sendStatus(204);
        } catch {
            return res.sendStatus(503);
        }
    });
};

module.exports = { registerDerivAuth };
