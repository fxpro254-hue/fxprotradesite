# Last Ticks Direction Block Documentation

## 🎯 Overview

The **Last Ticks Direction Block** is a boolean analysis block that checks if all the last N ticks moved in the same direction (all rising or all falling). This block is perfect for detecting consistent momentum patterns and strong directional moves in trading strategies.

## 📋 Block Specifications

### Visual Interface
```
last [3] ticks are [rise ▼]
```

### Parameters
- **Count**: Number of recent ticks to analyze (dynamic input)
- **Direction**: Dropdown selection
  - **Rise**: Check if all ticks moved up from previous tick
  - **Fall**: Check if all ticks moved down from previous tick

### Output
- **Type**: Boolean (true/false)
- **Description**: Returns true if ALL ticks match the specified direction, false otherwise

## 🔧 Technical Implementation

### Block Definition
```javascript
window.Blockly.Blocks.last_ticks_direction = {
    definition() {
        return {
            message0: localize('last {{ count }} ticks are {{ direction }}'),
            args0: [
                {
                    type: 'input_value',
                    name: 'COUNT',
                    check: 'Number'
                },
                {
                    type: 'field_dropdown',
                    name: 'DIRECTION',
                    options: [
                        [localize('Rise'), 'rise'],
                        [localize('Fall'), 'fall']
                    ]
                }
            ],
            output: 'Boolean',
            category: window.Blockly.Categories.Tick_Analysis,
        };
    }
};
```

### Code Generation
```javascript
window.Blockly.JavaScript.javascriptGenerator.forBlock.last_ticks_direction = block => {
    const count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 'COUNT', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '3';
    const direction = block.getFieldValue('DIRECTION');
    
    return [`Bot.checkLastTicksDirection(${count}, '${direction}')`, ORDER_ATOMIC];
};
```

### Backend Implementation
```javascript
checkLastTicksDirection(count, direction) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            if (ticks.length < 2 || count < 2) {
                resolve(false);
                return;
            }
            
            const recentTicks = ticks.slice(-count);
            
            // Check if all consecutive ticks move in the specified direction
            for (let i = 1; i < recentTicks.length; i++) {
                const currentTick = recentTicks[i];
                const previousTick = recentTicks[i - 1];
                
                if (direction === 'rise' && currentTick <= previousTick) {
                    resolve(false);
                    return;
                } else if (direction === 'fall' && currentTick >= previousTick) {
                    resolve(false);
                    return;
                }
            }
            
            // If we get here, all ticks moved in the specified direction
            resolve(true);
        });
    });
}
```

## 📊 Usage Examples

### Basic Momentum Detection
```blockly
IF [last 3 ticks are rise]
  THEN Purchase [CALL ▼]
ELSE IF [last 3 ticks are fall]
  THEN Purchase [PUT ▼]
```

### Strong Trend Confirmation
```blockly
IF [last 5 ticks are rise] AND [Rise % of last 10 ticks] > 70
  THEN Purchase [CALL ▼] trade each tick [Yes ▼]
```

### Pattern-Based Entry
```blockly
IF [last 4 ticks are fall] AND [last 5 digits are all_even]
  THEN Purchase [CALL ▼]  // Expecting reversal
```

### Multi-Condition Strategy
```blockly
IF [last 3 ticks are rise] AND [balance] > 100 AND [current time between 9:00-17:00]
  THEN Purchase [CALL ▼] amount [10 ▼]
```

## 🎲 Strategic Applications

### 1. **Momentum Confirmation**
- **All Rising**: `last 3 ticks are rise` = Strong bullish momentum
- **All Falling**: `last 5 ticks are fall` = Strong bearish momentum
- **Mixed**: Neither condition met = Indecisive market

### 2. **Breakout Detection**
```blockly
IF [last 4 ticks are rise] AND [current price] > [SMA 20]
  THEN Purchase [CALL ▼]  // Breakout confirmation
```

### 3. **Reversal Signals**
```blockly
IF [last 6 ticks are fall] AND [RSI] < 30
  THEN Purchase [CALL ▼]  // Oversold reversal
```

### 4. **Risk Management**
```blockly
IF [last 3 ticks are fall] AND [current position is CALL]
  THEN Sell position  // Stop loss on momentum shift
```

## 🎯 Comparison with Related Blocks

### vs Rise/Fall Percentage Block
| Feature | Last Ticks Direction | Rise/Fall Percentage |
|---------|---------------------|---------------------|
| **Output** | Boolean (true/false) | Number (0-100%) |
| **Condition** | ALL ticks must match | Percentage threshold |
| **Sensitivity** | High (strict requirement) | Adjustable (percentage based) |
| **Use Case** | Strong pattern detection | General trend analysis |

**Example Comparison:**
- `last 5 ticks are rise` → Returns true ONLY if all 5 ticks rose
- `Rise % of last 5 ticks` → Returns 80% if 4 out of 5 ticks rose

### Strategic Combination
```blockly
IF [last 3 ticks are rise] AND [Rise % of last 10 ticks] > 60
  THEN Purchase [CALL ▼]
  // Strong recent momentum + general upward bias
```

## 📈 Performance Characteristics

### Algorithm Details
1. **Data Retrieval**: Get last N ticks from symbol data
2. **Sequential Analysis**: Compare each tick with the previous one
3. **Direction Validation**: Ensure ALL movements match the specified direction
4. **Boolean Result**: Return true if all match, false if any deviation

### Key Features
- **Strict Validation**: Requires ALL ticks to match direction
- **Real-time Updates**: Recalculates with each new tick
- **Efficient Processing**: Early exit on first mismatch
- **Edge Case Handling**: Proper handling of insufficient data

### Edge Case Handling
- **Insufficient Data**: Returns false if less than 2 ticks
- **Equal Prices**: Unchanged ticks break the pattern (return false)
- **Large Counts**: Efficiently handles up to 1000 ticks
- **Boundary Conditions**: Proper validation for all inputs

## 🔗 Integration Points

### Block Categories
- **Primary**: "Tick and candle analysis"
- **Secondary**: "binaryfx"

### Related Blocks
- `rise_fall_percentage` - Percentage-based momentum analysis
- `all_same_pattern` - Digit pattern matching
- `even_odd_percentage` - Digit-based market sentiment
- `check_direction` - Single direction check

### API Integration
- **Interface**: `TicksInterface.js`
- **Trade Engine**: `Ticks.js` class
- **WebSocket**: Real-time tick data feed

### Blockly Integration
- **Shape**: Hexagonal (boolean output)
- **Color**: Standard tick analysis colors
- **Connections**: Perfect for IF statements, AND/OR operators
- **Usage**: Condition blocks, logic gates, decision trees

## 🧪 Testing and Validation

### Debug Tools
Use the provided debug script `debug-last-ticks-direction.js`:
```javascript
// Test method availability
lastTicksDirectionDebugger.checkMethodAvailability();

// Test all direction patterns
await lastTicksDirectionDebugger.testAllPatterns();

// Test edge cases
await lastTicksDirectionDebugger.testEdgeCases();

// Run comprehensive test
await lastTicksDirectionDebugger.runComprehensiveTest();
```

### Manual Testing
```javascript
// Test in browser console
await Bot.checkLastTicksDirection(3, 'rise');   // Returns: true/false
await Bot.checkLastTicksDirection(5, 'fall');   // Returns: true/false
```

### Test Scenarios
1. **All Rising Pattern**: Generate strictly increasing ticks
2. **All Falling Pattern**: Generate strictly decreasing ticks
3. **Mixed Pattern**: Generate random movements
4. **Edge Cases**: Test with insufficient data, large counts

## 🎯 Best Practices

### 1. **Choose Appropriate Count**
- **Short-term Scalping**: 2-4 ticks for quick signals
- **Medium-term Swing**: 5-8 ticks for trend confirmation
- **Long-term Position**: 10+ ticks for strong momentum

### 2. **Combine with Other Indicators**
```blockly
IF [last 4 ticks are rise] AND [Even % of last 15 digits] > 70
  THEN Purchase [CALL ▼]
  // Strong momentum + supporting digit pattern
```

### 3. **Risk Management Integration**
```blockly
IF [last 3 ticks are fall] AND [current position profit] > 50
  THEN Sell position  // Lock in profits on momentum shift
```

### 4. **Market Context Awareness**
- **Trending Markets**: Use shorter counts (3-5 ticks)
- **Range-bound Markets**: Use longer counts (6-10 ticks)
- **Volatile Markets**: Combine with volatility filters

## 🚨 Important Considerations

### Sensitivity
- **High Sensitivity**: Any single opposing move breaks the pattern
- **Use Case**: Best for detecting strong, consistent momentum
- **Caution**: May generate false signals in choppy markets

### Market Conditions
- **Trending Markets**: Excellent for momentum confirmation
- **Sideways Markets**: May produce many false signals
- **News Events**: High effectiveness during strong directional moves

### Time Frames
- **Scalping**: 2-3 tick patterns for quick entries
- **Day Trading**: 4-6 tick patterns for swing positions
- **Position Trading**: 8+ tick patterns for trend following

## 📞 Support and Updates

For issues, improvements, or questions regarding the Last Ticks Direction block:
- Use debug tools for real-time testing
- Combine with percentage-based blocks for confirmation
- Test different tick counts for your trading style
- Validate with historical data before live trading

This block provides precise momentum detection capabilities, enabling traders to identify and act on strong directional price movements with high confidence. The boolean output makes it perfect for conditional logic in complex trading strategies.

## 🚀 Quick Start

1. **Add Block**: Drag from "binaryfx" category in Bot Builder
2. **Configure**: Set tick count and select direction (rise/fall)
3. **Connect**: Link to IF statement for conditional trading
4. **Test**: Use debug tools to validate before live trading
5. **Deploy**: Integrate into comprehensive trading strategy

**Example Strategy:**
```blockly
IF [last 3 ticks are rise] AND [balance] > 50
  THEN Purchase [CALL ▼] amount [10 ▼]
ELSE IF [last 3 ticks are fall] AND [balance] > 50  
  THEN Purchase [PUT ▼] amount [10 ▼]
```

Start building momentum-based strategies with precise directional detection today!
