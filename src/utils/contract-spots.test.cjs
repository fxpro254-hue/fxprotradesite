const assert = require('node:assert/strict');
const { test } = require('node:test');
const { contractSpots } = require('./contract-spots.js');

test('reads the new API spots with their precision and falls back to legacy transaction rows', () => {
    assert.deepEqual(contractSpots({
        entry_spot: '102.40', entry_spot_time: 1700000000, entry_tick: 100,
        exit_spot: '102.50', exit_spot_time: 1700000001,
    }), {
        entry_tick: '102.40', entry_tick_time: 1700000000,
        exit_tick: '102.50', exit_tick_time: 1700000001,
    });
    assert.equal(contractSpots({ exit_spot: null, exit_tick_display_value: '0.000' }).exit_tick, '0.000');
    assert.equal(contractSpots({ exit_spot: null }).exit_tick, undefined);
});
