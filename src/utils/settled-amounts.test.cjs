const { test } = require('node:test');
const assert = require('node:assert/strict');
const { settledAmounts } = require('./settled-amounts.js');

test('sums string-valued settled trades, including an early sale and a loss', () => {
    const contracts = [
        { buy_price: '20.00', sell_price: '21.50', profit: '1.50' },
        { buy_price: '20.00', sell_price: '0.00', payout: '21.50', profit: '-20.00' },
        { buy_price: '20.00', sell_price: '8.00', payout: '40.00', profit: '-12.00' },
        { buy_price: '20.00', sell_price: null, profit: '1.50' },
    ];
    const sums = contracts.map(settledAmounts).reduce((a, b) => ({
        stake: a.stake + b.stake, payout: a.payout + b.payout, profit: a.profit + b.profit,
    }));
    assert.deepEqual(sums, { stake: 80, payout: 51, profit: -29 });
});
