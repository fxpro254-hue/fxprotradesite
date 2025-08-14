// Debug script for Last Ticks Direction Block
// Run this in the browser console when the bot is loaded

console.log('🎯 Debug: Starting Last Ticks Direction Block test...');

class LastTicksDirectionDebugger {
    constructor() {
        this.testResults = [];
        console.log('🎯 Last Ticks Direction Block Debugger Initialized');
    }

    // Check if the method is available
    checkMethodAvailability() {
        console.log('🔍 Checking method availability...');
        
        // Check Bot API
        if (typeof Bot !== 'undefined' && Bot.checkLastTicksDirection) {
            console.log('✅ Bot.checkLastTicksDirection method is available');
            
            // Test method signature
            try {
                const testResult = Bot.checkLastTicksDirection(3, 'rise');
                if (testResult && typeof testResult.then === 'function') {
                    console.log('✅ Method returns a Promise');
                    testResult.then(result => {
                        console.log(`✅ Test call successful: ${result}`);
                    }).catch(error => {
                        console.log(`❌ Test call failed: ${error.message}`);
                    });
                } else {
                    console.log('⚠️ Method does not return a Promise');
                }
            } catch (error) {
                console.error('❌ Error testing checkLastTicksDirection:', error);
            }
            
            return true;
        } else {
            console.log('❌ Bot.checkLastTicksDirection method not found');
            console.log('Available Bot methods:', Object.keys(Bot || {}));
            return false;
        }
    }

    // Generate test data for different direction patterns
    generateTestData(pattern, count = 5) {
        console.log(`📊 Generating ${count} test ticks for ${pattern} pattern...`);
        const ticks = [];
        let basePrice = 100.000;
        
        switch (pattern) {
            case 'all_rising':
                // Generate strictly rising prices
                for (let i = 0; i < count; i++) {
                    basePrice += Math.random() * 0.01 + 0.001; // Always positive increment
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
                break;
            case 'all_falling':
                // Generate strictly falling prices
                for (let i = 0; i < count; i++) {
                    basePrice -= Math.random() * 0.01 + 0.001; // Always negative increment
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
                break;
            case 'mixed':
                // Generate mixed movements
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.02;
                    basePrice += change;
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
                break;
            case 'sideways':
                // Generate mostly flat with tiny movements
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.001;
                    basePrice += change;
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
                break;
            case 'rising_then_falling':
                // First half rising, second half falling
                const halfway = Math.floor(count / 2);
                for (let i = 0; i < count; i++) {
                    if (i < halfway) {
                        basePrice += Math.random() * 0.01 + 0.001;
                    } else {
                        basePrice -= Math.random() * 0.01 + 0.001;
                    }
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
                break;
            default:
                // Random movement
                for (let i = 0; i < count; i++) {
                    const change = (Math.random() - 0.5) * 0.02;
                    basePrice += change;
                    ticks.push(parseFloat(basePrice.toFixed(3)));
                }
        }
        
        return ticks;
    }

    // Analyze test data manually for comparison
    analyzeTestData(ticks, direction) {
        if (ticks.length < 2) return false;
        
        console.log(`📈 Analyzing ${ticks.length} ticks for ${direction} pattern:`);
        console.log(`   Ticks: [${ticks.join(', ')}]`);
        
        for (let i = 1; i < ticks.length; i++) {
            const current = ticks[i];
            const previous = ticks[i - 1];
            const movement = current > previous ? 'rise' : current < previous ? 'fall' : 'unchanged';
            
            console.log(`   ${i}: ${previous} → ${current} (${movement})`);
            
            if (direction === 'rise' && current <= previous) {
                console.log(`   ❌ Expected rise but got ${movement}`);
                return false;
            } else if (direction === 'fall' && current >= previous) {
                console.log(`   ❌ Expected fall but got ${movement}`);
                return false;
            }
        }
        
        console.log(`   ✅ All ticks match ${direction} pattern`);
        return true;
    }

    // Test all direction patterns
    async testAllPatterns() {
        console.log('🧪 Testing all direction patterns...');
        
        const testCases = [
            { pattern: 'all_rising', count: 5, expectedRise: true, expectedFall: false },
            { pattern: 'all_falling', count: 5, expectedRise: false, expectedFall: true },
            { pattern: 'mixed', count: 7, expectedRise: false, expectedFall: false },
            { pattern: 'rising_then_falling', count: 6, expectedRise: false, expectedFall: false }
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🔬 Testing ${testCase.pattern} pattern (${testCase.count} ticks):`);
            
            // Generate test data
            const testTicks = this.generateTestData(testCase.pattern, testCase.count);
            
            // Manual analysis
            const expectedRise = this.analyzeTestData(testTicks, 'rise');
            const expectedFall = this.analyzeTestData(testTicks, 'fall');
            
            console.log(`🎯 Expected Results: Rise=${expectedRise}, Fall=${expectedFall}`);
            
            // Test with actual method (if available)
            if (this.checkMethodAvailability()) {
                try {
                    const actualRise = await Bot.checkLastTicksDirection(testCase.count, 'rise');
                    const actualFall = await Bot.checkLastTicksDirection(testCase.count, 'fall');
                    
                    console.log(`🎯 Actual Results: Rise=${actualRise}, Fall=${actualFall}`);
                    
                    // Validation
                    const riseMatch = expectedRise === actualRise ? '✅' : '❌';
                    const fallMatch = expectedFall === actualFall ? '✅' : '❌';
                    
                    console.log(`${riseMatch} Rise validation: Expected ${expectedRise}, Got ${actualRise}`);
                    console.log(`${fallMatch} Fall validation: Expected ${expectedFall}, Got ${actualFall}`);
                    
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
            { name: 'Zero count', count: 0 },
            { name: 'Single tick', count: 1 },
            { name: 'Two ticks', count: 2 },
            { name: 'Large count', count: 50 }
        ];
        
        for (const edgeCase of edgeCases) {
            console.log(`\n🔍 Testing: ${edgeCase.name}`);
            
            if (this.checkMethodAvailability()) {
                try {
                    const riseResult = await Bot.checkLastTicksDirection(edgeCase.count, 'rise');
                    const fallResult = await Bot.checkLastTicksDirection(edgeCase.count, 'fall');
                    
                    console.log(`✅ Rise result: ${riseResult}`);
                    console.log(`✅ Fall result: ${fallResult}`);
                } catch (error) {
                    console.error(`❌ Error in ${edgeCase.name}:`, error);
                }
            }
        }
    }

    // Test real-time performance
    async testRealTimePerformance() {
        console.log('\n⚡ Testing real-time performance...');
        
        if (!this.checkMethodAvailability()) {
            console.log('❌ Cannot run performance test - method not available');
            return;
        }
        
        const testCounts = [3, 5, 10, 20];
        
        for (const count of testCounts) {
            console.log(`\n📊 Performance test with ${count} ticks:`);
            
            const startTime = performance.now();
            
            try {
                const riseResult = await Bot.checkLastTicksDirection(count, 'rise');
                const fallResult = await Bot.checkLastTicksDirection(count, 'fall');
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                console.log(`✅ Results: Rise=${riseResult}, Fall=${fallResult}`);
                console.log(`⚡ Execution time: ${duration.toFixed(2)}ms`);
                
            } catch (error) {
                console.error(`❌ Performance test failed for count ${count}:`, error);
            }
        }
    }

    // Run comprehensive test
    async runComprehensiveTest() {
        console.log('🚀 Starting comprehensive Last Ticks Direction block test...');
        
        // Check availability
        if (!this.checkMethodAvailability()) {
            console.log('❌ Cannot run tests - method not available');
            return;
        }
        
        // Test all patterns
        await this.testAllPatterns();
        
        // Test edge cases
        await this.testEdgeCases();
        
        // Test performance
        await this.testRealTimePerformance();
        
        console.log('\n✨ Last Ticks Direction block testing completed!');
    }
}

// Create debugger instance
const lastTicksDirectionDebugger = new LastTicksDirectionDebugger();

// Auto-run basic test
console.log('🎬 Auto-running basic availability check...');
lastTicksDirectionDebugger.checkMethodAvailability();

// Instructions
console.log('\n📖 Usage Instructions:');
console.log('1. lastTicksDirectionDebugger.checkMethodAvailability() - Check if method exists');
console.log('2. lastTicksDirectionDebugger.testAllPatterns() - Test all direction patterns');
console.log('3. lastTicksDirectionDebugger.testEdgeCases() - Test edge cases');
console.log('4. lastTicksDirectionDebugger.testRealTimePerformance() - Test performance');
console.log('5. lastTicksDirectionDebugger.runComprehensiveTest() - Run all tests');
console.log('\n🔥 Quick test: lastTicksDirectionDebugger.runComprehensiveTest()');

// Example usage
console.log('\n💡 Example Usage in Strategy:');
console.log('// Check if last 3 ticks are all rising');
console.log('await Bot.checkLastTicksDirection(3, "rise");  // Returns: true/false');
console.log('// Check if last 5 ticks are all falling');
console.log('await Bot.checkLastTicksDirection(5, "fall");  // Returns: true/false');
