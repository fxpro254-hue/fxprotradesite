const assert = require('node:assert/strict');
const { test } = require('node:test');
const { tradeProposal } = require('./trade-proposal.js');

const input = { symbol: 'R_100', currency: 'USD', amount: '2', duration: '5', growth: '0.01', digit: '4' };
const metadata = {
    min_contract_duration: '1t', max_contract_duration: '10t',
    last_digit_range: [3, 4, 5], growth_rate_range: [0.01, 0.02],
};
const quote = (contract_type, values = {}) => tradeProposal({ ...input, ...values, contract: { ...metadata, contract_type } });

test('uses live contract metadata and emits only family-specific proposal fields', () => {
    for (const type of ['CALL', 'PUT', 'DIGITEVEN', 'DIGITODD']) {
        const result = quote(type);
        assert.equal(result.underlying_symbol, 'R_100');
        assert.equal(result.duration, 5);
        assert.equal(result.subscribe, 1);
        assert.equal('barrier' in result, false);
    }
    for (const type of ['DIGITMATCH', 'DIGITDIFF', 'DIGITOVER', 'DIGITUNDER']) {
        assert.equal(quote(type).barrier, '4');
        assert.equal(quote(type, { digit: '9' }), null);
    }
    assert.equal(quote('CALL', { duration: '11' }), null);
    assert.equal(quote('ACCU', { growth: '0.9' }), null);
    assert.equal(quote('ACCU').growth_rate, 0.01);
    assert.equal('duration' in quote('ACCU'), false);
});
