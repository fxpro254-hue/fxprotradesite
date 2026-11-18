const express = require('express');
const { registerDerivAuth } = require('../server/deriv-auth');

const app = express();
const actions = new Set(['login', 'callback', 'accounts', 'logout']);
let prisma;

app.use(express.json({ limit: '8kb' }));
registerDerivAuth(app, () => {
    const { PrismaClient } = require('@prisma/client');
    prisma ??= new PrismaClient();
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
