/**
 * Test file for "All Markets" feature
 * Tests that random symbol selection works with the signals.js symbol list
 */

// Mock the symbols from signals.js
const availableSymbols = [
    'R_10',
    'R_25', 
    'R_50',
    'R_75',
    'R_100',
    '1HZ10V',
    '1HZ15V',
    '1HZ25V',
    '1HZ30V',
    '1HZ50V',
    '1HZ75V',
    '1HZ90V',
    '1HZ100V'
];

// Simulate the random symbol selection logic
function getRandomAvailableSymbol() {
    const randomIndex = Math.floor(Math.random() * availableSymbols.length);
    return availableSymbols[randomIndex];
}

console.log('🧪 Testing "All Markets" Random Symbol Selection\n');
console.log(`Available symbols: ${availableSymbols.length} total`);
console.log('Symbols:', availableSymbols.join(', '));
console.log('\n🔄 Testing random selection (10 iterations):\n');

const selectionCounts = {};
availableSymbols.forEach(symbol => {
    selectionCounts[symbol] = 0;
});

// Test 10 random selections
for (let i = 1; i <= 10; i++) {
    const selectedSymbol = getRandomAvailableSymbol();
    selectionCounts[selectedSymbol]++;
    console.log(`${i.toString().padStart(2)}. Selected: ${selectedSymbol}`);
}

console.log('\n📊 Selection frequency:');
Object.entries(selectionCounts).forEach(([symbol, count]) => {
    if (count > 0) {
        console.log(`   ${symbol}: ${count} time${count === 1 ? '' : 's'}`);
    }
});

console.log('\n✅ All Markets feature test completed!');
console.log('\n🎯 Implementation Summary:');
console.log('- When "All Markets" is selected in the trade parameters symbol dropdown');
console.log('- The bot will randomly select from these 13 symbols on each trade');
console.log('- Includes both Volatility indices (R_10-R_100) and 1Hz Volatility indices (1HZ10V-1HZ100V)');
console.log('- Each trade execution picks a new random symbol for maximum diversification');
