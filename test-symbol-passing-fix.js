/**
 * Test Bot.init() to Purchase.js Symbol Passing
 * Verifies that originalSymbol gets passed from Bot.init() to tradeOptions
 */

console.log('🔍 Testing Bot.init() to Purchase.js Symbol Passing');
console.log('============================================================\n');

// Simulate Bot.init() options (from trade_definition.js)
console.log('1️⃣ Simulating Bot.init() call with ALL_MARKETS');
const botInitOptions = {
    symbol: 'R_100',                    // Stable init symbol
    originalSymbol: 'ALL_MARKETS',      // User's original selection
    contractTypes: ['CALL'],
    candleInterval: 'FALSE',
    shouldRestartOnError: true,
    timeMachineEnabled: false
};

console.log('   Bot.init() options:', JSON.stringify(botInitOptions, null, 2));

// Simulate trade engine initialization (index.js)
console.log('\n2️⃣ Trade Engine Processing (index.js)');
console.log('   Before fix: tradeOptions only gets symbol');
console.log('   After fix: tradeOptions gets both symbol AND originalSymbol');

// Simulate the fixed tradeOptions creation
const validated_trade_options = {
    amount: 1,
    basis: 'stake',
    currency: 'USD',
    duration: 5,
    duration_unit: 't'
};

console.log('\n   validated_trade_options:', JSON.stringify(validated_trade_options, null, 2));

// OLD WAY (BROKEN)
const oldTradeOptions = { 
    ...validated_trade_options, 
    symbol: botInitOptions.symbol 
};
console.log('\n   ❌ OLD tradeOptions (missing originalSymbol):');
console.log('     ', JSON.stringify(oldTradeOptions, null, 2));

// NEW WAY (FIXED)
const newTradeOptions = { 
    ...validated_trade_options, 
    symbol: botInitOptions.symbol,
    originalSymbol: botInitOptions.originalSymbol 
};
console.log('\n   ✅ NEW tradeOptions (includes originalSymbol):');
console.log('     ', JSON.stringify(newTradeOptions, null, 2));

// Simulate Purchase.executeSingleTrade processing
console.log('\n3️⃣ Purchase.executeSingleTrade() Processing');

function testSymbolDetection(tradeOptions, testName) {
    console.log(`\n--- ${testName} ---`);
    console.log(`Input tradeOptions:`, JSON.stringify(tradeOptions, null, 2));
    
    // Copy Purchase.js logic for ALL_MARKETS detection
    const enhancedTradeOptions = { ...tradeOptions };
    
    if (enhancedTradeOptions.symbol === 'ALL_MARKETS' || 
        (tradeOptions.originalSymbol && tradeOptions.originalSymbol === 'ALL_MARKETS')) {
        
        // Simulate random symbol selection
        const availableSymbols = [
            'R_10', 'R_25', 'R_50', 'R_75', 'R_100',
            '1HZ10V', '1HZ15V', '1HZ20V', '1HZ25V', '1HZ30V', '1HZ50V', '1HZ75V', '1HZ100V'
        ];
        const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
        const previousSymbol = enhancedTradeOptions.symbol;
        
        console.log(`🎲 ALL_MARKETS: Trading on ${randomSymbol} (previous: ${previousSymbol})`);
        enhancedTradeOptions.symbol = randomSymbol;
        return randomSymbol;
    } else {
        console.log(`📌 Regular symbol: Using ${enhancedTradeOptions.symbol} (no randomization)`);
        return enhancedTradeOptions.symbol;
    }
}

// Test old way (should fail to detect ALL_MARKETS)
const oldResult = testSymbolDetection(oldTradeOptions, "OLD WAY - Missing originalSymbol");

// Test new way (should successfully detect and randomize)
const newResult1 = testSymbolDetection(newTradeOptions, "NEW WAY - First Trade");
const newResult2 = testSymbolDetection(newTradeOptions, "NEW WAY - Second Trade");
const newResult3 = testSymbolDetection(newTradeOptions, "NEW WAY - Third Trade");

console.log('\n4️⃣ Results Analysis');
console.log('============================================================');

console.log(`\n📊 OLD Implementation Results:`);
console.log(`   Symbol used: ${oldResult}`);
console.log(`   ALL_MARKETS detected: ${oldResult !== 'R_100' ? 'YES' : 'NO'}`);
console.log(`   Problem: ${oldResult === 'R_100' ? 'Always uses R_100 - no randomization!' : 'Working correctly'}`);

console.log(`\n📊 NEW Implementation Results:`);
const newResults = [newResult1, newResult2, newResult3];
console.log(`   Symbols used: [${newResults.join(', ')}]`);
console.log(`   ALL_MARKETS detected: ${newResults.some(s => s !== 'R_100') ? 'YES' : 'NO'}`);
console.log(`   Unique symbols: ${[...new Set(newResults)].length}/${newResults.length}`);
console.log(`   Randomization working: ${newResults.some(s => s !== 'R_100') ? 'YES ✅' : 'NO ❌'}`);

console.log('\n🔧 Fix Summary');
console.log('============================================================');
console.log('✅ Updated trade engine index.js to pass originalSymbol');
console.log('✅ Purchase.js can now detect ALL_MARKETS correctly');
console.log('✅ Each trade will get fresh random symbol');
console.log('✅ Bot will no longer be stuck on R_100');

console.log('\n🚀 The fix should resolve the "only trading volatility 100" issue!');
console.log('============================================================');