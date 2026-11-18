const assert = require('node:assert/strict');
const { test } = require('node:test');
const { installOptionsRequests } = require('./new-options.js');

const id = 'c84a793b-8a87-7999-ce10-9b22f7ceead3';
const directBuy = {
    buy: '1',
    price: '1',
    parameters: {
        symbol: 'R_100', contract_type: 'DIGITOVER', currency: 'USD', amount: '1',
        duration: '5', duration_unit: 't', basis: 'stake', barrier: 4, selected_tick: 4,
    },
};
const hasError = code => error => error.error?.code === code;

test('prices a direct buy on its trading connection and forgets the quote', async () => {
    const requests = [];
    const api = { async send(request) {
        requests.push(request);
        if (request.proposal) return { proposal: { id, ask_price: 1 }, subscription: { id } };
        if (request.buy) return { buy: { contract_id: 7 } };
        return {};
    }};
    installOptionsRequests(api, () => true, 'DOT100');
    assert.deepEqual(await api.send(directBuy), { buy: { contract_id: 7 } });
    assert.deepEqual(requests, [
        { proposal: 1, subscribe: 1, underlying_symbol: 'R_100', contract_type: 'DIGITOVER',
            currency: 'USD', amount: 1, duration: 5, duration_unit: 't', basis: 'stake', barrier: '4' },
        { buy: id, price: 1 },
        { forget: id },
    ]);
    await assert.rejects(api.send({ buy: id, price: 1 }), hasError('StaleTradeQuote'));
});

test('blocks public writes and prevents retry after an uncertain purchase on reconnect', async () => {
    const publicApi = { async send() { assert.fail('public writes must not reach the socket'); } };
    installOptionsRequests(publicApi, () => false, '');
    await assert.rejects(publicApi.send(directBuy), hasError('TradingConnectionUnavailable'));

    const tradingApi = { async send(request) {
        if (request.proposal) return { proposal: { id, ask_price: 1 } };
        throw { error: { code: 'DisconnectError' } };
    }};
    installOptionsRequests(tradingApi, () => true, 'DOT200');
    await assert.rejects(tradingApi.send(directBuy), hasError('TradeReconciliationRequired'));

    const replacement = { async send() { assert.fail('uncertain purchase must not be retried'); } };
    installOptionsRequests(replacement, () => true, 'DOT200');
    await assert.rejects(replacement.send(directBuy), hasError('TradeReconciliationRequired'));
});
