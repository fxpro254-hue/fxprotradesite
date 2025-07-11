# Bot Builder Block System Analysis

## Overview

The Deriv Bot Builder uses a sophisticated block-based system built on top of Google Blockly to create trading strategies. This analysis covers how blocks are created, structured, how they function, and how they execute trades, with a focus on indicators and the new even/odd percentage analysis block.

## Block Architecture

### 1. Block Structure

Each block in the system is defined using a standard pattern:

```javascript
window.Blockly.Blocks.block_name = {
    init() {
        this.jsonInit(this.definition());
    },
    definition() {
        return {
            message0: 'Block display text with %1 %2',
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'FIELD_NAME',
                    options: [['Option 1', 'value1'], ['Option 2', 'value2']]
                },
                {
                    type: 'input_value',
                    name: 'INPUT_NAME',
                    check: 'Number'
                }
            ],
            output: 'Number', // or null for statement blocks
            colour: window.Blockly.Colours.Base.colour,
            category: window.Blockly.Categories.Tick_Analysis,
        };
    },
    meta() {
        return {
            display_name: 'Human readable name',
            description: 'Detailed description for help system'
        };
    }
};
```

### 2. Code Generation

Each block has a corresponding code generator that defines what JavaScript code is produced:

```javascript
window.Blockly.JavaScript.javascriptGenerator.forBlock.block_name = block => {
    const fieldValue = block.getFieldValue('FIELD_NAME');
    const inputValue = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 'INPUT_NAME', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    );
    
    const code = `Bot.someMethod('${fieldValue}', ${inputValue})`;
    return [code, window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC];
};
```

## Block Categories

### 1. Trade Definition Blocks
- **Purpose**: Define trading parameters (symbol, contract type, duration, amount)
- **Examples**: `trade_definition`, `trade_definition_market`, `trade_definition_tradeoptions`
- **Function**: Set up the basic trading configuration

### 2. Purchase Condition Blocks
- **Purpose**: Define when and how to place trades
- **Examples**: `before_purchase`, `purchase`
- **Function**: Execute logic before placing trades and specify trade direction

### 3. Sell Condition Blocks
- **Purpose**: Define when to close positions early
- **Examples**: `during_purchase`, `sell_at_market`
- **Function**: Monitor open positions and execute early exit strategies

### 4. Analysis Blocks

#### Indicators
- **Purpose**: Calculate technical indicators for market analysis
- **Examples**: `sma_statement`, `ema_statement`, `rsi_statement`, `bb_statement`
- **Structure**: Use a statement-based pattern with required child blocks:
  ```
  SMA Block
  ├── input_list (data source)
  └── period (calculation period)
  ```

#### Tick Analysis
- **Purpose**: Analyze real-time price data and last digits
- **Examples**: `tick_analysis`, `last_digit`, `even_odd_percentage`
- **Function**: Process tick data for pattern recognition and statistical analysis

## Data Flow Architecture

### 1. Tick Data Processing

```
WebSocket API → TicksService → TradeEngine → Analysis Blocks → Strategy Logic
```

1. **WebSocket Connection**: Real-time price data received from Deriv API
2. **TicksService**: Processes and stores tick data with symbol-specific handling
3. **TradeEngine**: Manages tick data access and provides analysis methods
4. **Analysis Blocks**: Process tick data to extract insights
5. **Strategy Logic**: Uses analysis results to make trading decisions

### 2. Block Execution Flow

```
Strategy Compilation → JavaScript Generation → Interpreter Execution → API Calls
```

1. **Compilation**: Blockly converts visual blocks into JavaScript code
2. **Interpretation**: Custom interpreter executes the generated code with sandbox controls
3. **API Integration**: Bot interface methods communicate with Deriv API
4. **Trade Execution**: Purchase and sell orders are placed based on strategy logic

## Symbol Analyzer Implementation

### Purpose
The new Symbol Analyzer service provides comprehensive tick data analysis for trading symbols, enabling sophisticated pattern recognition and statistical analysis.

### Key Features

#### 1. Digit Analysis
- **Frequency Distribution**: Tracks occurrence of each last digit (0-9)
- **Even/Odd Statistics**: Calculates percentage distribution of even vs odd digits
- **Over/Under Analysis**: Analyzes digits above/below configurable barriers

#### 2. Streak Detection
- **Current Streak**: Identifies ongoing even/odd digit sequences
- **Historical Streaks**: Tracks longest even/odd streaks in history
- **Pattern Recognition**: Detects recurring digit patterns

#### 3. Volatility Metrics
- **Price Range**: Measures price movement range over time
- **Direction Bias**: Identifies overall rise/fall tendencies
- **Average Change**: Calculates mean price change per tick

### Integration Points

#### 1. Data Collection
```javascript
// Automatic tick integration
symbolAnalyzer.addTick('R_100', {
    time: Date.now(),
    quote: 123.456,
    last_digit: 6
});
```

#### 2. Analysis Retrieval
```javascript
// Get comprehensive analysis
const analysis = symbolAnalyzer.getAnalysis('R_100');
// Specific even/odd percentage
const evenOdd = symbolAnalyzer.getEvenOddPercentage('R_100', 50);
```

## Even/Odd Percentage Block

### Block Definition
The new `even_odd_percentage` block provides dynamic analysis of digit patterns:

**Visual Interface**:
```
[Even/Odd ▼] % of last [10] digits
```

**Parameters**:
- **Pattern**: Dropdown selection (Even/Odd)
- **Count**: Number of recent ticks to analyze (dynamic input)

### Implementation Details

#### 1. Block Structure
```javascript
window.Blockly.Blocks.even_odd_percentage = {
    definition() {
        return {
            message0: localize('{{ pattern }} % of last {{ count }} digits'),
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'PATTERN',
                    options: [['Even', 'even'], ['Odd', 'odd']]
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

#### 2. Code Generation
```javascript
window.Blockly.JavaScript.javascriptGenerator.forBlock.even_odd_percentage = block => {
    const pattern = block.getFieldValue('PATTERN');
    const count = window.Blockly.JavaScript.javascriptGenerator.valueToCode(
        block, 'COUNT', window.Blockly.JavaScript.javascriptGenerator.ORDER_ATOMIC
    ) || '10';
    
    return [`Bot.getEvenOddPercentage('${pattern}', ${count})`, ORDER_ATOMIC];
};
```

#### 3. Backend Implementation
```javascript
// In Ticks.js
getEvenOddPercentage(pattern, count) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            const recentTicks = ticks.slice(-count);
            const digits = this.getLastDigitsFromList(recentTicks);
            
            let matchingCount = 0;
            digits.forEach(digit => {
                const isEven = digit % 2 === 0;
                if ((pattern === 'even' && isEven) || (pattern === 'odd' && !isEven)) {
                    matchingCount++;
                }
            });
            
            const percentage = digits.length > 0 ? (matchingCount / digits.length) * 100 : 0;
            resolve(percentage);
        });
    });
}
```

## Trading Strategy Execution

### 1. Strategy Compilation Process

1. **Block Assembly**: User drags and connects blocks in the visual editor
2. **Validation**: System checks for required blocks and valid connections
3. **Code Generation**: Blockly generates JavaScript code from blocks
4. **Optimization**: Code is optimized for execution efficiency

### 2. Runtime Execution

1. **Interpreter Setup**: Custom JavaScript interpreter with sandboxed execution
2. **API Integration**: Bot interface provides secure access to trading functions
3. **Real-time Processing**: Continuous tick data processing and analysis
4. **Trade Execution**: Automated trade placement based on strategy conditions

### 3. Error Handling and Recovery

- **Block Validation**: Prevents invalid block combinations
- **Runtime Errors**: Graceful error handling with user notifications
- **Connection Recovery**: Automatic reconnection to data feeds
- **Trade Monitoring**: Continuous monitoring of open positions

## Advanced Usage Patterns

### 1. Multi-Indicator Strategies
```
SMA(20) > SMA(50) AND RSI < 30 AND Even% of last 10 > 60% → BUY
```

### 2. Pattern-Based Trading
```
IF Even% of last 5 = 100% AND Current Streak > 3 → SELL
```

### 3. Volatility Adaptation
```
IF Price Range > Average Range * 1.5 → Reduce Position Size
```

## Performance Considerations

### 1. Data Management
- **Tick History Limits**: Maximum 1000 ticks per symbol to manage memory
- **Efficient Storage**: Optimized data structures for fast access
- **Garbage Collection**: Automatic cleanup of old data

### 2. Calculation Optimization
- **Lazy Evaluation**: Analysis performed only when needed
- **Caching**: Results cached for repeated calculations
- **Batch Processing**: Multiple calculations combined for efficiency

### 3. Real-time Performance
- **Asynchronous Processing**: Non-blocking tick data processing
- **Worker Threads**: Heavy calculations offloaded when possible
- **Rate Limiting**: Prevents API overload during high-frequency updates

## Conclusion

The Deriv Bot Builder provides a powerful and flexible framework for creating sophisticated trading strategies through its block-based visual programming interface. The addition of the Symbol Analyzer and Even/Odd Percentage block enhances the platform's analytical capabilities, enabling traders to implement more nuanced strategies based on detailed statistical analysis of market data.

The system's modular architecture allows for easy extension and customization, while maintaining robust error handling and performance optimization to ensure reliable real-time trading execution.
