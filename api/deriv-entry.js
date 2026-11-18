const express = require('express');
const { registerDerivAuth } = require('../server/deriv-auth');

const app = express();
const actions = new Set(['login', 'callback', 'accounts', 'socket', 'logout']);
let prisma;

app.use(express.json({ limit: '8kb' }));
registerDerivAuth(app, () => {
    const { PrismaClient } = require('@prisma/client');
    const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;
    if (!datasourceUrl) throw new Error('Deriv session database is not configured.');
    prisma ??= new PrismaClient({ datasourceUrl });
    return prisma;
});

module.exports = (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/deriv-entry') {
        const action = url.searchParams.get('derivAction');
        if (!actions.has(action)) {
            res.statusCode = 404;
            return res.end();
        }
        req.url = '/api/deriv/' + action;
    }
    return app(req, res);
};
