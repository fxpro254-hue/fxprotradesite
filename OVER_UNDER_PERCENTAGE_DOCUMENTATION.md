# Over/Under Percentage Block Documentation

## 📋 Overview

The **Over/Under Percentage Block** is a powerful analysis tool that calculates the percentage of last digits that are either over or under a specified threshold in recent tick data. This block enables sophisticated digit-based trading strategies by analyzing digit distribution patterns.

## 🎯 Block Syntax

```
{{ over/under }} {{ dynamic digit }} % of last {{ dynamic number of ticks }} digits
```

**Visual Representation:**
```
[Dropdown: Over/Under] [Input: Digit] % of last [Input: Count] digits
```

## 🔧 Parameters

| Parameter | Type | Description | Range | Default |
|-----------|------|-------------|-------|---------|
| **Condition** | Dropdown | Whether to check for digits over or under the threshold | `over`, `under` | `over` |
| **Digit** | Number Input | The threshold digit for comparison | 0-9 | 5 |
| **Count** | Number Input | Number of recent ticks to analyze | 1-100+ | 10 |

## ⚙️ Implementation Details

### Block Definition
- **File**: `src/external/bot-skeleton/scratch/blocks/Binary/Tick Analysis/over_under_percentage.js`
- **Category**: `Tick Analysis` and `binaryfx`
- **Output**: Number (percentage 0-100)
- **API Call**: `Bot.getOverUnderPercentage(condition, digit, count)`

### Backend Implementation
- **File**: `src/external/bot-skeleton/services/tradeEngine/trade/Ticks.js`
- **Method**: `getOverUnderPercentage(condition, digit, count)`
- **Return**: Promise<number> - Percentage value

### Algorithm Logic
```javascript
getOverUnderPercentage(condition, digit, count) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            const recentTicks = ticks.slice(-count);
            const digits = this.getLastDigitsFromList(recentTicks);
            
            let matchingCount = 0;
            digits.forEach(tickDigit => {
                if (condition === 'over' && tickDigit > digit) {
                    matchingCount++;
                } else if (condition === 'under' && tickDigit < digit) {
                    matchingCount++;
                }
            });
            
            const percentage = digits.length > 0 ? (matchingCount / digits.length) * 100 : 0;
            resolve(percentage);
        });
    });
}
```

## 📊 Usage Examples

### Basic Examples

1. **High Digit Analysis**
   ```javascript
   Bot.getOverUnderPercentage('over', 6, 15)
   // Returns percentage of digits 7,8,9 in last 15 ticks
   ```

2. **Low Digit Analysis**
   ```javascript
   Bot.getOverUnderPercentage('under', 4, 20)
   // Returns percentage of digits 0,1,2,3 in last 20 ticks
   ```

3. **Extreme Digit Filtering**
   ```javascript
   Bot.getOverUnderPercentage('over', 8, 10)
   // Returns percentage of digit 9 only in last 10 ticks
   ```

### Trading Strategy Examples

#### 1. **Digit Momentum Strategy**
```javascript
// Check for high digit dominance
if (Bot.getOverUnderPercentage('over', 6, 20) > 60) {
    // Strong bias toward high digits (7,8,9)
    // Consider "Over" trades
}
```

#### 2. **Mean Reversion Strategy**
```javascript
// Check for extreme digit bias
if (Bot.getOverUnderPercentage('over', 8, 15) > 80) {
    // Extremely high percentage of digit 9
    // Consider mean reversion trades
}
```

#### 3. **Volatility Detection**
```javascript
// Detect unusual digit patterns
const extremeHigh = Bot.getOverUnderPercentage('over', 8, 10);
const extremeLow = Bot.getOverUnderPercentage('under', 2, 10);

if (extremeHigh > 50 || extremeLow > 50) {
    // High volatility period detected
}
```

## 🎲 Digit Range Analysis

### Over Conditions
| Digit | Range | Description |
|-------|-------|-------------|
| Over 0 | 1-9 | All digits except 0 |
| Over 3 | 4-9 | High-mid to high range |
| Over 5 | 6-9 | High digit range |
| Over 7 | 8-9 | Extreme high digits |
| Over 8 | 9 | Maximum digit only |

### Under Conditions
| Digit | Range | Description |
|-------|-------|-------------|
| Under 9 | 0-8 | All digits except 9 |
| Under 6 | 0-5 | Low to mid-low range |
| Under 4 | 0-3 | Low digit range |
| Under 2 | 0-1 | Extreme low digits |
| Under 1 | 0 | Minimum digit only |

## 📈 Strategic Applications

### 1. **Market Sentiment Analysis**
- **High Percentage Over 5**: Bullish sentiment (more high digits)
- **High Percentage Under 5**: Bearish sentiment (more low digits)
- **Balanced Distribution**: Neutral market conditions

### 2. **Entry Signal Generation**
- **Threshold Crossover**: When percentage crosses predefined levels
- **Extreme Values**: >80% indicates strong directional bias
- **Pattern Breaks**: Sudden changes in distribution patterns

### 3. **Risk Management**
- **Volatility Assessment**: Extreme percentages indicate high volatility
- **Pattern Confirmation**: Use with other indicators for validation
- **Time-based Analysis**: Different tick counts for different timeframes

## 🔍 Testing and Debugging

### Browser Console Testing
```javascript
// Test basic functionality
await Bot.getOverUnderPercentage('over', 5, 10);

// Test extreme cases
await Bot.getOverUnderPercentage('over', 9, 5);  // Should be ~0%
await Bot.getOverUnderPercentage('under', 0, 5); // Should be ~0%
```

### Debug Tools Available
1. **test-over-under-block.html** - Interactive testing interface
2. **debug-over-under-block.js** - Console debugging tools
3. Built-in comprehensive test suite

## ⚡ Performance Considerations

### Optimization Tips
- **Tick Count**: Use appropriate count for your analysis timeframe
- **Caching**: Results are calculated in real-time from recent tick data
- **Memory Usage**: Larger tick counts use more memory
- **Update Frequency**: Consider rate limiting for high-frequency strategies

### Recommended Settings
- **Scalping**: 5-10 ticks for immediate patterns
- **Short-term**: 15-25 ticks for trend analysis
- **Medium-term**: 30-50 ticks for pattern confirmation
- **Long-term**: 50+ ticks for statistical significance

## 🚨 Error Handling

### Common Issues
1. **No Tick Data**: Returns 0% if no ticks available
2. **Invalid Parameters**: Validates digit range (0-9)
3. **Network Issues**: Promise rejection on connection problems

### Error Prevention
```javascript
try {
    const percentage = await Bot.getOverUnderPercentage('over', 5, 10);
    if (percentage !== null && percentage !== undefined) {
        // Use percentage safely
    }
} catch (error) {
    console.error('Over/Under analysis failed:', error);
}
```

## 🔗 Integration Points

### Block Categories
- **Primary**: "Tick and candle analysis"
- **Secondary**: "binaryfx"

### Related Blocks
- `even_odd_percentage` - Complementary even/odd analysis
- `last_digit` - Individual digit checking
- `stat` - Statistical analysis functions

### API Integration
- **Interface**: `TicksInterface.js`
- **Trade Engine**: `Ticks.js` class
- **WebSocket**: Real-time tick data feed

## 📚 Advanced Examples

### Multi-Condition Strategy
```javascript
// Combined analysis
const highDigits = await Bot.getOverUnderPercentage('over', 6, 20);
const lowDigits = await Bot.getOverUnderPercentage('under', 4, 20);

if (highDigits > 70) {
    // Strong high digit bias
} else if (lowDigits > 70) {
    // Strong low digit bias
} else {
    // Balanced distribution
}
```

### Dynamic Threshold Adjustment
```javascript
// Adaptive threshold based on volatility
const baseThreshold = 5;
const volatilityAdjustment = calculateVolatility(); // Your function
const adjustedThreshold = baseThreshold + volatilityAdjustment;

const result = await Bot.getOverUnderPercentage('over', adjustedThreshold, 15);
```

## 🎯 Best Practices

1. **Combine with Other Indicators**: Don't rely solely on digit analysis
2. **Use Appropriate Timeframes**: Match tick count to your trading style
3. **Monitor Market Conditions**: Adjust thresholds for different market phases
4. **Backtest Thoroughly**: Validate strategies with historical data
5. **Risk Management**: Always use proper position sizing and stop losses

## 📞 Support and Updates

For issues, improvements, or questions regarding the Over/Under Percentage block:
- Check debug tools first
- Review console output for errors
- Test with mock data if needed
- Validate tick data availability

This block represents a sophisticated addition to the trading toolkit, enabling precise digit-based market analysis for enhanced trading decisions.
