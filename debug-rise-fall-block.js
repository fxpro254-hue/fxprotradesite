// Debug script for Rise/Fall Percentage Block
// Run this in the browser console when the bot is loaded

console.log('📈 Debug: Starting Rise/Fall Percentage Block test...');

class RiseFallPercentageDebugger {
    constructor() {
        this.testResults = [];
        console.log('🎯 Rise/Fall Percentage Block Debugger Initialized');
    }

    // Check if the method is available
    checkMethodAvailability() {
        console.log('🔍 Checking method availability...');
        
        // Check Bot API
        if (typeof Bot !== 'undefined' && Bot.getRiseFallPercentage) {
            console.log('✅ Bot.getRiseFallPercentage method is available');
            
            // Test method signature
            try {
                const testResult = Bot.getRiseFallPercentage('rise', 10);
                if (testResult && typeof testResult.then === 'function') {
                    console.log('✅ Method returns a Promise');
                    testResult.then(result => {
                        console.log(`✅ Test call successful: ${result}%`);
                    }).catch(error => {
                        console.log(`❌ Test call failed: ${error.message}`);
                    });
                } else {
                    console.log('⚠️ Method does not return a Promise');
                }
            } catch (error) {
                console.error('❌ Error testing getRiseFallPercentage:', error);
            }
            
            return true;
        } else {
            console.log('❌ Bot.getRiseFallPercentage method not found');
            console.log('Available Bot methods:', Object.keys(Bot || {}));
            return false;
        }
    }

    // Generate test data for different market conditions
    generateTestData(pattern, count = 10) {
        console.log(`📊 Generating ${count} test ticks for ${pattern} pattern...`);
        const ticks = [];
        let basePrice = 100.000;
        
        switch (pattern) {
            case 'rising':
                // Generate mostly rising prices
                for (let i = 0; i < count; i++) {
                    const change = Math.random() > 0.2 ? Math.random() * 0.01 : -Math.random() * 0.005;
                    basePrice += change;
                    ticks.push(basePrice);
                }
                break;
            case 'falling':
                // Generate mostly falling prices
                for (let i = 0; i < count; i++) {
                    const change = Math.random() > 0.2 ? -Math.random() * 0.01 : Math.random() * 0.005;
                    basePrice += change;
                    ticks.push(basePrice);
                }
                break;
            case 'sideways':
                // Generate sideways movement
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.002;
                    basePrice += change;
                    ticks.push(basePrice);
                }
                break;
            case 'volatile':
                // Generate volatile movement
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.05;
                    basePrice += change;
                    ticks.push(basePrice);
                }
                break;
            default:
                // Random movement
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.02;
                    basePrice += change;
                    ticks.push(basePrice);
                }
        }
        
        return ticks.map(tick => parseFloat(tick.toFixed(3)));
    }

    // Analyze test data manually for comparison
    analyzeTestData(ticks, pattern) {
        if (ticks.length < 2) return 0;
        
        let riseCount = 0;
        let fallCount = 0;
        
        for (let i = 1; i < ticks.length; i++) {
            if (ticks[i] > ticks[i-1]) {
                riseCount++;
            } else if (ticks[i] < ticks[i-1]) {
                fallCount++;
            }
        }
        
        const totalMoves = riseCount + fallCount;
        const risePercentage = totalMoves > 0 ? (riseCount / (ticks.length - 1)) * 100 : 0;
        const fallPercentage = totalMoves > 0 ? (fallCount / (ticks.length - 1)) * 100 : 0;
        
        console.log(`📈 Analysis Results:`);
        console.log(`   Rises: ${riseCount}/${ticks.length - 1} (${risePercentage.toFixed(1)}%)`);
        console.log(`   Falls: ${fallCount}/${ticks.length - 1} (${fallPercentage.toFixed(1)}%)`);
        console.log(`   Unchanged: ${(ticks.length - 1) - riseCount - fallCount}`);
        
        return pattern === 'rise' ? risePercentage : fallPercentage;
    }

    // Test all patterns
    async testAllPatterns() {
        console.log('🧪 Testing all rise/fall patterns...');
        
        const testCases = [
            { pattern: 'rising', count: 10 },
            { pattern: 'falling', count: 10 },
            { pattern: 'sideways', count: 15 },
            { pattern: 'volatile', count: 20 }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🔬 Testing ${testCase.pattern} market (${testCase.count} ticks):`);
            
            // Generate test data
            const testTicks = this.generateTestData(testCase.pattern, testCase.count);
            console.log('Generated ticks:', testTicks);
            
            // Manual analysis
            const expectedRise = this.analyzeTestData(testTicks, 'rise');
            const expectedFall = this.analyzeTestData(testTicks, 'fall');
            
            // Test with actual method (if available)
            if (this.checkMethodAvailability()) {
                try {
                    const actualRise = await Bot.getRiseFallPercentage('rise', testCase.count);
                    const actualFall = await Bot.getRiseFallPercentage('fall', testCase.count);
                    
                    console.log(`🎯 Expected Rise: ${expectedRise.toFixed(1)}%, Actual: ${actualRise.toFixed(1)}%`);
                    console.log(`🎯 Expected Fall: ${expectedFall.toFixed(1)}%, Actual: ${actualFall.toFixed(1)}%`);
                } catch (error) {
                    console.error(`❌ Error testing ${testCase.pattern}:`, error);
                }
            }
        }
    }

    // Test edge cases
    async testEdgeCases() {
        console.log('\n🚨 Testing edge cases...');
        
        const edgeCases = [
            { name: 'Empty data', count: 0 },
            { name: 'Single tick', count: 1 },
            { name: 'Two ticks', count: 2 },
            { name: 'Large count', count: 100 }
        ];
        
        for (const edgeCase of edgeCases) {
            console.log(`\n🔍 Testing: ${edgeCase.name}`);
            
            if (this.checkMethodAvailability()) {
                try {
                    const riseResult = await Bot.getRiseFallPercentage('rise', edgeCase.count);
                    const fallResult = await Bot.getRiseFallPercentage('fall', edgeCase.count);
                    
                    console.log(`✅ Rise result: ${riseResult}%`);
                    console.log(`✅ Fall result: ${fallResult}%`);
                } catch (error) {
                    console.error(`❌ Error in ${edgeCase.name}:`, error);
                }
            }
        }
    }

    // Run comprehensive test
    async runComprehensiveTest() {
        console.log('🚀 Starting comprehensive Rise/Fall Percentage block test...');
        
        // Check availability
        if (!this.checkMethodAvailability()) {
            console.log('❌ Cannot run tests - method not available');
            return;
        }
        
        // Test all patterns
        await this.testAllPatterns();
        
        // Test edge cases
        await this.testEdgeCases();
        
        console.log('\n✨ Rise/Fall Percentage block testing completed!');
    }
}

// Create debugger instance
const riseFallDebugger = new RiseFallPercentageDebugger();

// Auto-run basic test
console.log('🎬 Auto-running basic availability check...');
riseFallDebugger.checkMethodAvailability();

// Instructions
console.log('\n📖 Usage Instructions:');
console.log('1. riseFallDebugger.checkMethodAvailability() - Check if method exists');
console.log('2. riseFallDebugger.testAllPatterns() - Test all market patterns');
console.log('3. riseFallDebugger.testEdgeCases() - Test edge cases');
console.log('4. riseFallDebugger.runComprehensiveTest() - Run all tests');
console.log('\n🔥 Quick test: riseFallDebugger.runComprehensiveTest()');
