# Rise/Fall Percentage Block Documentation

## 🎯 Overview

The **Rise/Fall Percentage Block** is a powerful new addition to the binaryfx analysis suite that calculates the percentage of rising or falling price movements in recent tick data. This block enables traders to analyze market momentum and directional bias with precision.

## 📋 Block Specifications

### Visual Interface
```
[Rise/Fall ▼] % of last [10] ticks
```

### Parameters
- **Pattern**: Dropdown selection
  - **Rise**: Count ticks that moved up from previous tick
  - **Fall**: Count ticks that moved down from previous tick
- **Count**: Number of recent ticks to analyze (dynamic input)

### Output
- **Type**: Number (0-100)
- **Description**: Percentage of ticks matching the selected pattern

## 🔧 Technical Implementation

### Block Definition
```javascript
window.Blockly.Blocks.rise_fall_percentage = {
    definition() {
        return {
            message0: localize('{{ pattern }} % of last {{ count }} ticks'),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PATTERN',
                    options: [
                        [localize('Rise'), 'rise'],
                        [localize('Fall'), 'fall']
                    ]
                },
                {
                    type: 'input_value',
                    name: 'COUNT',
                    check: 'Number'
                }
            ],
            output: 'Number',
            category: window.Blockly.Categories.Tick_Analysis,
        };
    }
};
```

### Code Generation
```javascript
window.Blockly.JavaScript.javascriptGenerator.forBlock.rise_fall_percentage = block => {
    const pattern = block.getFieldValue('PATTERN');
    const count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 'COUNT', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    
    return [`Bot.getRiseFallPercentage('${pattern}', ${count})`, ORDER_ATOMIC];
};
```

### Backend Implementation
```javascript
getRiseFallPercentage(pattern, count) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            if (ticks.length < 2 || count < 2) {
                resolve(0);
                return;
            }
            
            const recentTicks = ticks.slice(-count);
            let matchingCount = 0;
            
            // Compare each tick with the previous tick
            for (let i = 1; i < recentTicks.length; i++) {
                const currentTick = recentTicks[i];
                const previousTick = recentTicks[i - 1];
                
                if (pattern === 'rise' && currentTick > previousTick) {
                    matchingCount++;
                } else if (pattern === 'fall' && currentTick < previousTick) {
                    matchingCount++;
                }
            }
            
            // Calculate percentage based on number of comparisons (count - 1)
            const totalComparisons = recentTicks.length - 1;
            const percentage = totalComparisons > 0 ? (matchingCount / totalComparisons) * 100 : 0;
            resolve(percentage);
        });
    });
}
```

## 📊 Usage Examples

### Basic Momentum Analysis
```blockly
IF [Rise % of last 10 ticks] > 70
  THEN Purchase [CALL ▼]
ELSE IF [Fall % of last 10 ticks] > 70
  THEN Purchase [PUT ▼]
```

### Trend Confirmation Strategy
```blockly
IF [Rise % of last 15 ticks] > 60 AND [Even % of last 10 digits] > 55
  THEN Purchase [CALL ▼] trade each tick [Yes ▼]
```

### Mean Reversion Strategy
```blockly
IF [Fall % of last 20 ticks] > 80 AND [current price] < [SMA 20]
  THEN Purchase [CALL ▼]  // Expecting reversal
```

### Multi-Timeframe Analysis
```blockly
IF [Rise % of last 5 ticks] > 80 AND [Rise % of last 20 ticks] > 60
  THEN Purchase [CALL ▼]  // Strong short and medium term momentum
```

## 🎲 Strategic Applications

### 1. **Momentum Trading**
- **Strong Rise**: `Rise % > 75%` indicates bullish momentum
- **Strong Fall**: `Fall % > 75%` indicates bearish momentum
- **Weak Signal**: `Rise/Fall % < 60%` suggests indecision

### 2. **Trend Analysis**
- **Uptrend**: Rising percentages increasing over time
- **Downtrend**: Falling percentages increasing over time
- **Sideways**: Both rise/fall percentages around 45-55%

### 3. **Market Conditions**
- **Trending**: High rise OR fall percentage (>70%)
- **Choppy**: Low rise AND fall percentage (<40% each)
- **Balanced**: Rise ≈ Fall ≈ 50%

### 4. **Entry Signals**
- **Bullish Entry**: `Rise % > 70%` + confirming indicators
- **Bearish Entry**: `Fall % > 70%` + confirming indicators
- **Wait Signal**: `Rise/Fall % between 40-60%`

## 📈 Performance Characteristics

### Calculation Method
1. **Data Collection**: Get last N ticks from symbol data
2. **Price Comparison**: Compare each tick with previous tick
3. **Movement Counting**: Count rises/falls based on pattern
4. **Percentage Calculation**: `(matches / total_comparisons) × 100`

### Key Features
- **Real-time Processing**: Updates with each new tick
- **Memory Efficient**: Only stores required tick history
- **Accurate Calculations**: Handles edge cases properly
- **Promise-based**: Asynchronous execution

### Edge Case Handling
- **Insufficient Data**: Returns 0% if less than 2 ticks
- **Equal Prices**: Unchanged ticks don't count as rise or fall
- **Large Counts**: Efficiently handles up to 1000 ticks

## 🔗 Integration Points

### Block Categories
- **Primary**: "Tick and candle analysis"
- **Secondary**: "binaryfx"

### Related Blocks
- `even_odd_percentage` - Digit-based market sentiment
- `over_under_percentage` - Threshold-based analysis
- `digit_frequency_rank` - Pattern frequency detection
- `all_same_pattern` - Strong pattern confirmation

### API Integration
- **Interface**: `TicksInterface.js`
- **Trade Engine**: `Ticks.js` class
- **WebSocket**: Real-time tick data feed

### Blockly Integration
- **Shape**: Round (numeric output)
- **Color**: Standard tick analysis colors
- **Connections**: Can connect to comparison operators, IF statements
- **Usage**: Perfect for numeric conditions and calculations

## 🧪 Testing and Validation

### Debug Tools
Use the provided debug script `debug-rise-fall-block.js`:
```javascript
// Test method availability
riseFallDebugger.checkMethodAvailability();

// Test all market patterns
await riseFallDebugger.testAllPatterns();

// Test edge cases
await riseFallDebugger.testEdgeCases();

// Run comprehensive test
await riseFallDebugger.runComprehensiveTest();
```

### Manual Testing
```javascript
// Test in browser console
await Bot.getRiseFallPercentage('rise', 10);   // Returns: 65.4
await Bot.getRiseFallPercentage('fall', 15);   // Returns: 23.1
```

## 🎯 Best Practices

1. **Choose Appropriate Timeframes**
   - **Scalping**: 5-10 ticks for quick signals
   - **Day Trading**: 15-25 ticks for trend analysis
   - **Swing Trading**: 50+ ticks for longer-term momentum

2. **Combine with Other Indicators**
   - **Confirmation**: Use with digit analysis blocks
   - **Filter**: Add price action or volume conditions
   - **Exit**: Monitor opposing momentum for exits

3. **Market Condition Awareness**
   - **Trending Markets**: Higher thresholds (70-80%)
   - **Ranging Markets**: Lower thresholds (55-65%)
   - **Volatile Markets**: Use longer periods (20+ ticks)

4. **Risk Management**
   - **Strong Signals**: Higher position sizes
   - **Weak Signals**: Lower position sizes or avoid
   - **Stop Losses**: Exit when momentum reverses significantly

## 📞 Support and Updates

For issues, improvements, or questions regarding the Rise/Fall Percentage block:
- Use debug tools for real-time analysis
- Test with various timeframes and market conditions
- Monitor percentage stability over time
- Validate with historical data

This block provides sophisticated momentum analysis capabilities, enabling traders to identify and exploit directional price movements for enhanced trading strategies. The percentage-based approach offers intuitive interpretation and flexible integration with existing trading logic.

## 🚀 Quick Start

1. **Add Block**: Drag from "binaryfx" category in Bot Builder
2. **Configure**: Select "Rise" or "Fall" and set tick count
3. **Connect**: Link to IF statement or comparison operator
4. **Test**: Use debug tools to validate before live trading
5. **Deploy**: Integrate into comprehensive trading strategy

**Example Strategy:**
```blockly
IF [Rise % of last 10 ticks] > 75 AND [balance] > 100
  THEN Purchase [CALL ▼] amount [5 ▼]
```

Start building momentum-based strategies today!
