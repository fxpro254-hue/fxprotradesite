# All Same Pattern Block Documentation

## 📋 Overview

The **All Same Pattern Block** is a powerful boolean analysis tool that checks if the last N digits from recent ticks match specific patterns. This block returns `true` for pattern matches or `false` for no match, making it perfect for use in IF conditions.

**Block Type**: Boolean (returns `true` or `false`)
**Output Shape**: Hexagonal (boolean indicator)
**Categories**: "Tick and candle analysis" and "binaryfx"

## 🎯 Block Syntax

```
last [5] digits are [All even ▼]
```

**Visual Interface**: 
- **Count Input**: Dynamic number input for tick count
- **Pattern Dropdown**: Selection between "All even", "All odd", or "All same"

## 🔧 Parameters

### Count (Number Input)
- **Type**: Dynamic number input
- **Range**: 1-100 (recommended: 3-20)
- **Default**: 5
- **Description**: Number of recent ticks to analyze

### Pattern (Dropdown)
- **Type**: Field dropdown
- **Options**:
  - `All even` - Checks if all digits are even (0, 2, 4, 6, 8)
  - `All odd` - Checks if all digits are odd (1, 3, 5, 7, 9)  
  - `All same` - Checks if all digits are identical
- **Default**: "All even"

## ⚙️ Implementation Details

### Block Definition
- **File**: `src/external/bot-skeleton/scratch/blocks/Binary/Tick Analysis/all_same_pattern.js`
- **Category**: `Tick Analysis` and `binaryfx`
- **Output**: Boolean (`true`/`false`)
- **API Call**: `Bot.checkAllSamePattern(count, pattern)`

### Backend Implementation
- **File**: `src/external/bot-skeleton/services/tradeEngine/trade/Ticks.js`
- **Method**: `checkAllSamePattern(count, pattern)`
- **Return**: Promise<boolean> - True if pattern matches, false if not

### Algorithm Logic
```javascript
checkAllSamePattern(count, pattern) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            const recentTicks = ticks.slice(-count);
            const digits = this.getLastDigitsFromList(recentTicks);
            
            if (digits.length === 0) {
                resolve(false);
                return;
            }
            
            let result = false;
            
            switch (pattern) {
                case 'all_even':
                    result = digits.every(digit => digit % 2 === 0);
                    break;
                case 'all_odd':
                    result = digits.every(digit => digit % 2 !== 0);
                    break;
                case 'all_same':
                    const firstDigit = digits[0];
                    result = digits.every(digit => digit === firstDigit);
                    break;
                default:
                    result = false;
            }
            
            resolve(result);
        });
    });
}
```

## 📊 Usage Examples

### Basic Pattern Detection
### Basic Pattern Detection
```javascript
// Check if last 5 digits are all even
if (await Bot.checkAllSamePattern(5, 'all_even')) {
    // Strong even bias detected
    console.log('All 5 digits are even!');
}

// Check if last 3 digits are all the same
if (await Bot.checkAllSamePattern(3, 'all_same')) {
    // Repetitive pattern detected
    console.log('Strong repetitive pattern!');
}
```

### Use in IF Conditions (Like is_candle_black)
```javascript
// Direct use in Blockly IF statements
if (checkAllSamePattern(5, 'all_even')) {
    // Execute when all 5 digits are even
    purchaseContract('DIGITEVEN');
}

// Combined with other conditions
if (checkAllSamePattern(3, 'all_odd') && getEvenOddPercentage('odd', 10) > 70) {
    // Strong odd pattern confirmation
    purchaseContract('DIGITODD');
}
```

## 🔄 Using in Conditional Logic

### Direct IF Statement Usage
The `all_same_pattern` block works exactly like the `is_candle_black` block - you can drag it directly into IF conditions:

```blockly
IF [last 5 digits are all even]
  THEN purchase DIGITEVEN
```

### Blockly Visual Example
```
┌─────────────────┐
│       IF        │
│  ┌──────────────┴─┐
│  │ last [5] digits│
│  │ are [all even ▼]│
│  └────────────────┘
│       THEN
│  ┌────────────────┐
│  │ purchase EVEN  │
│  └────────────────┘
└─────────────────────┘
```

### Logical Operations
```javascript
// AND combination
if (checkAllSamePattern(5, 'all_even') && getEvenOddPercentage('even', 10) > 60) {
    // Both conditions must be true
}

// OR combination  
if (checkAllSamePattern(3, 'all_odd') || checkAllSamePattern(3, 'all_even')) {
    // Either strong odd or strong even pattern
}

// NOT operation
if (!checkAllSamePattern(8, 'all_same')) {
    // When digits are NOT all the same (varied pattern)
}
```

### Trading Strategy Integration
```javascript
// Entry signal based on strong patterns
const strongEvenPattern = await Bot.checkAllSamePattern(4, 'all_even');
const recentEvenPercentage = await Bot.getEvenOddPercentage('even', 10);

if (strongEvenPattern && recentEvenPercentage > 70) {
    // Very strong even bias - consider Even trades
    console.log('Strong even signal confirmed');
}

// Pattern break detection
const allSamePattern = await Bot.checkAllSamePattern(6, 'all_same');
if (allSamePattern) {
    // Possible pattern break incoming
    console.log('Repetitive pattern - watch for break');
}
```

### Multi-Timeframe Pattern Analysis
```javascript
// Short-term pattern (scalping)
const shortPattern = await Bot.checkAllSamePattern(3, 'all_even');

// Medium-term pattern (swing)
const mediumPattern = await Bot.checkAllSamePattern(8, 'all_even');

// Execute only when both timeframes align
if (shortPattern && mediumPattern) {
    console.log('Multi-timeframe even pattern confirmed');
}
```

## 🎲 Pattern Analysis Guide

### All Even Pattern
**Description**: All digits are even (0, 2, 4, 6, 8)
**Use Cases**:
- Market sentiment towards even numbers
- Entry signals for Even/Odd trades
- Confirmation for even-bias strategies

**Example Matches**:
- `[2, 4, 6, 8, 0]` ✅ All even
- `[0, 2, 4, 6, 8]` ✅ All even
- `[2, 4, 6, 8, 1]` ❌ Contains odd

### All Odd Pattern  
**Description**: All digits are odd (1, 3, 5, 7, 9)
**Use Cases**:
- Market sentiment towards odd numbers
- Entry signals for Odd trades
- Trend reversal detection

**Example Matches**:
- `[1, 3, 5, 7, 9]` ✅ All odd
- `[9, 7, 5, 3, 1]` ✅ All odd
- `[1, 3, 5, 7, 8]` ❌ Contains even

### All Same Pattern
**Description**: All digits are identical
**Use Cases**:
- Repetitive pattern detection
- Market stability/instability signals
- Pattern break anticipation

**Example Matches**:
- `[5, 5, 5, 5, 5]` ✅ All same (5)
- `[0, 0, 0, 0, 0]` ✅ All same (0)
- `[7, 7, 7, 7, 8]` ❌ Not all same

## 📈 Strategic Applications

### 1. **Pattern Confirmation Trading**
```javascript
// Multi-layer pattern confirmation
const evenPattern = await Bot.checkAllSamePattern(5, 'all_even');
const evenPercentage = await Bot.getEvenOddPercentage('even', 15);
const overPattern = await Bot.getOverUnderPercentage('over', 4, 10);

if (evenPattern && evenPercentage > 65 && overPattern > 60) {
    // Triple confirmation for even/high bias
    purchaseContract('DIGITEVEN');
}
```

### 2. **Pattern Break Strategy**
```javascript
// Detect when patterns break
const wasAllSame = await Bot.checkAllSamePattern(8, 'all_same');
const currentDigit = await Bot.getLastDigit();

if (wasAllSame) {
    // Watch for pattern break
    console.log('Repetitive pattern detected - prepare for variance');
    // Reduce position size or wait for confirmation
}
```

### 3. **Volatility-Based Adaptation**
```javascript
// Adjust strategy based on pattern strength
const strongPattern = await Bot.checkAllSamePattern(10, 'all_even');

if (strongPattern) {
    // Market showing strong bias - increase confidence
    setStakeAmount(baseStake * 1.5);
} else {
    // No clear pattern - use conservative approach
    setStakeAmount(baseStake * 0.8);
}
```

### 4. **Multi-Pattern Matrix**
```javascript
// Comprehensive pattern analysis
const patterns = await Promise.all([
    Bot.checkAllSamePattern(5, 'all_even'),
    Bot.checkAllSamePattern(5, 'all_odd'), 
    Bot.checkAllSamePattern(5, 'all_same'),
    Bot.checkAllSamePattern(10, 'all_even'),
    Bot.checkAllSamePattern(10, 'all_odd'),
    Bot.checkAllSamePattern(10, 'all_same')
]);

const [shortEven, shortOdd, shortSame, longEven, longOdd, longSame] = patterns;

// Trading matrix logic
if (shortEven && longEven) {
    console.log('Strong multi-timeframe even pattern');
} else if (shortSame || longSame) {
    console.log('Repetitive pattern - exercise caution');
}
```

## 🔍 Testing and Debugging

### Interactive Test Interface
Open `test-all-same-pattern-block.html` in your browser for comprehensive testing:
- Pattern simulation with mock data
- Real-time API testing
- Block integration verification
- Visual result display

### Console Debug Commands
Load `debug-all-same-pattern-block.js` for advanced debugging:
```javascript
// Check method availability
checkAllSamePattern();

// Run comprehensive tests  
testAllSamePattern();

// Simulate pattern checks
simulateAllSamePattern();

// Live monitoring
monitorAllSamePattern(3000); // Every 3 seconds

// Get current state
getAllSamePatternState();
```

### Manual Testing Examples
```javascript
// Test specific patterns
await Bot.checkAllSamePattern(5, 'all_even');    // Returns: true/false
await Bot.checkAllSamePattern(3, 'all_odd');     // Returns: true/false  
await Bot.checkAllSamePattern(4, 'all_same');    // Returns: true/false

// Test with different counts
await Bot.checkAllSamePattern(10, 'all_even');   // Longer timeframe
await Bot.checkAllSamePattern(3, 'all_same');    // Shorter timeframe
```

## ⚡ Performance Considerations

### Optimal Count Ranges
- **Short-term patterns**: 3-5 ticks (quick signals)
- **Medium-term patterns**: 6-10 ticks (reliable trends)
- **Long-term patterns**: 11-20 ticks (strong confirmations)

### Pattern Probability
- **All Even/Odd**: ~1.6% chance for 5 consecutive digits
- **All Same**: ~0.001% chance for 5 consecutive identical digits
- **Practical Range**: Use 3-8 ticks for realistic pattern detection

### Performance Tips
1. **Cache Results**: Store results for reuse within the same tick
2. **Combine Patterns**: Use with other blocks for confirmation
3. **Reasonable Counts**: Avoid very large counts (>20) for performance
4. **Strategic Timing**: Check patterns at key decision points

## 🚨 Error Handling

### Common Issues
1. **No Tick Data**: Returns `false` if no ticks available
2. **Invalid Pattern**: Returns `false` for unknown pattern types
3. **Network Issues**: Promise rejection on connection problems

### Error Prevention
```javascript
try {
    const hasPattern = await Bot.checkAllSamePattern(5, 'all_even');
    if (hasPattern !== null && hasPattern !== undefined) {
        // Use pattern result safely
        console.log('Pattern check successful:', hasPattern);
    }
} catch (error) {
    console.error('Pattern check failed:', error);
    // Fallback to default behavior
}
```

### Validation Examples
```javascript
// Validate inputs before use
const count = Math.max(1, Math.min(20, inputCount)); // Clamp to 1-20
const validPatterns = ['all_even', 'all_odd', 'all_same'];
const pattern = validPatterns.includes(inputPattern) ? inputPattern : 'all_even';

const result = await Bot.checkAllSamePattern(count, pattern);
```

## 🔗 Integration Points

### Block Categories
- **Primary**: "Tick and candle analysis"
- **Secondary**: "binaryfx"

### Related Blocks
- `even_odd_percentage` - Percentage-based even/odd analysis
- `over_under_percentage` - Threshold-based digit analysis
- `digit_frequency_rank` - Frequency-based digit ranking
- `last_digit` - Individual digit checking

### API Integration
- **Interface**: `TicksInterface.js`
- **Trade Engine**: `Ticks.js` class
- **WebSocket**: Real-time tick data feed

### Blockly Integration
- **Shape**: Hexagonal (boolean output)
- **Color**: Standard tick analysis colors
- **Connections**: Can connect to IF statements, logical operators, AND/OR blocks
- **Usage**: Perfect for conditional logic, just like `is_candle_black` block

## 📚 Advanced Examples

### 1. **Pattern Transition Detection**
```javascript
// Detect when patterns change
let previousEvenPattern = await Bot.checkAllSamePattern(5, 'all_even');

// Later in the strategy...
const currentEvenPattern = await Bot.checkAllSamePattern(5, 'all_even');

if (previousEvenPattern && !currentEvenPattern) {
    console.log('Even pattern broken - possible trend change');
} else if (!previousEvenPattern && currentEvenPattern) {
    console.log('New even pattern established');
}

previousEvenPattern = currentEvenPattern;
```

### 2. **Pattern Strength Scoring**
```javascript
// Create pattern strength score
const patterns = await Promise.all([
    Bot.checkAllSamePattern(3, 'all_even'),
    Bot.checkAllSamePattern(5, 'all_even'),
    Bot.checkAllSamePattern(8, 'all_even')
]);

const strength = patterns.filter(p => p).length;
console.log(`Even pattern strength: ${strength}/3`);

if (strength >= 2) {
    console.log('Strong even pattern detected');
}
```

### 3. **Dynamic Pattern Adaptation**
```javascript
// Adapt strategy based on pattern type
const patterns = await Promise.all([
    Bot.checkAllSamePattern(5, 'all_even'),
    Bot.checkAllSamePattern(5, 'all_odd'),
    Bot.checkAllSamePattern(5, 'all_same')
]);

const [isAllEven, isAllOdd, isAllSame] = patterns;

if (isAllSame) {
    console.log('Repetitive pattern - high volatility expected');
    // Use smaller stakes, wait for pattern break
} else if (isAllEven || isAllOdd) {
    console.log('Clear bias pattern - normal strategy');
    // Use standard stakes and strategy
} else {
    console.log('Mixed pattern - conservative approach');
    // Use reduced stakes or skip trades
}
```

### 4. **Pattern-Based Position Sizing**
```javascript
// Adjust position size based on pattern confidence
async function calculatePositionSize(baseStake) {
    const shortPattern = await Bot.checkAllSamePattern(3, 'all_even');
    const mediumPattern = await Bot.checkAllSamePattern(7, 'all_even');
    const longPattern = await Bot.checkAllSamePattern(12, 'all_even');
    
    let multiplier = 1.0;
    
    if (shortPattern) multiplier += 0.2;
    if (mediumPattern) multiplier += 0.3;
    if (longPattern) multiplier += 0.5;
    
    return baseStake * Math.min(multiplier, 2.0); // Cap at 2x
}

// Usage
const stake = await calculatePositionSize(10); // Base stake of 10
console.log(`Calculated stake: ${stake}`);
```

## 🎯 Best Practices

### 1. **Combine with Other Blocks**
- Use with percentage blocks for confirmation
- Combine with frequency ranking for comprehensive analysis
- Integrate with traditional indicators for complete strategies

### 2. **Use Appropriate Timeframes**
- **3-5 ticks**: Quick pattern detection, scalping strategies
- **6-10 ticks**: Medium-term trends, swing trading
- **11+ ticks**: Long-term patterns, position trading

### 3. **Pattern Probability Awareness**
- All Same patterns are very rare - use shorter counts (3-5)
- All Even/Odd patterns are more common - can use longer counts (5-10)
- Balance pattern strength requirements with practical occurrence

### 4. **Risk Management Integration**
```javascript
// Pattern-based risk management
const strongPattern = await Bot.checkAllSamePattern(8, 'all_even');
const riskMultiplier = strongPattern ? 1.5 : 0.8;

const positionSize = basePosition * riskMultiplier;
const stopLoss = strongPattern ? targetProfit * 0.5 : targetProfit * 0.3;
```

### 5. **Performance Optimization**
- Cache pattern results within the same tick analysis
- Use reasonable count limits (avoid >20 for performance)
- Combine multiple pattern checks into single API calls when possible

## 📞 Support and Updates

For issues, improvements, or questions regarding the All Same Pattern block:
- Test with debug tools first (`debug-all-same-pattern-block.js`)
- Use interactive test interface (`test-all-same-pattern-block.html`)
- Review console output for errors
- Validate tick data availability and pattern parameters

This block represents a sophisticated addition to the trading toolkit, enabling precise pattern-based market analysis for enhanced trading decisions and risk management.

---

**Implementation Complete** ✅  
**Available in**: "Tick and candle analysis" and "binaryfx" categories  
**API Method**: `Bot.checkAllSamePattern(count, pattern)`  
**Output Type**: Boolean (`true`/`false`)  
**Best for**: Pattern confirmation, trend analysis, risk management
