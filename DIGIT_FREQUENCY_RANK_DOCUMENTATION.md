# Digit Frequency Rank Block Documentation

## 📋 Overview

The **Digit Frequency Rank Block** is an advanced statistical analysis tool that identifies digits based on their frequency ranking in recent tick data. This block enables sophisticated pattern recognition by finding the most/least/second most/second least frequent digits, providing powerful insights for digit-based trading strategies.

## 🎯 Block Syntax

```
{{ most/least/second most/second least }} frequent digit in last {{ dynamic number }} digits
```

**Visual Representation:**
```
[Dropdown: Rank] frequent digit in last [Input: Count] digits
```

## 🔧 Parameters

| Parameter | Type | Description | Options | Default |
|-----------|------|-------------|---------|---------|
| **Rank** | Dropdown | Frequency ranking to return | `most`, `least`, `second_most`, `second_least` | `most` |
| **Count** | Number Input | Number of recent ticks to analyze | 10-100+ | 15 |

## ⚙️ Implementation Details

### Block Definition
- **File**: `src/external/bot-skeleton/scratch/blocks/Binary/Tick Analysis/digit_frequency_rank.js`
- **Category**: `Tick Analysis` and `binaryfx`
- **Output**: Number (digit 0-9, or -1 if insufficient data)
- **API Call**: `Bot.getDigitFrequencyRank(rank, count)`

### Backend Implementation
- **File**: `src/external/bot-skeleton/services/tradeEngine/trade/Ticks.js`
- **Method**: `getDigitFrequencyRank(rank, count)`
- **Return**: Promise<number> - Digit value (0-9)

### Algorithm Logic
```javascript
getDigitFrequencyRank(rank, count) {
    return new Promise(resolve => {
        this.getTicks().then(ticks => {
            const recentTicks = ticks.slice(-count);
            const digits = this.getLastDigitsFromList(recentTicks);
            
            // Count frequency of each digit (0-9)
            const digitCounts = new Array(10).fill(0);
            digits.forEach(digit => {
                digitCounts[digit]++;
            });
            
            // Create array of {digit, count} pairs and sort by frequency
            const digitFrequencies = digitCounts.map((count, digit) => ({
                digit, count
            }));
            
            // Sort by count (descending), then by digit (ascending) for ties
            digitFrequencies.sort((a, b) => {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.digit - b.digit;
            });
            
            // Return digit based on ranking
            let result = -1;
            switch (rank) {
                case 'most':
                    result = digitFrequencies[0].digit;
                    break;
                case 'least':
                    result = digitFrequencies[digitFrequencies.length - 1].digit;
                    break;
                case 'second_most':
                    if (digitFrequencies.length > 1) {
                        result = digitFrequencies[1].digit;
                    }
                    break;
                case 'second_least':
                    if (digitFrequencies.length > 1) {
                        result = digitFrequencies[digitFrequencies.length - 2].digit;
                    }
                    break;
            }
            
            resolve(result);
        });
    });
}
```

## 📊 Usage Examples

### Basic Examples

1. **Most Frequent Digit**
   ```javascript
   Bot.getDigitFrequencyRank('most', 20)
   // Returns the digit that appears most often in last 20 ticks
   ```

2. **Least Frequent Digit**
   ```javascript
   Bot.getDigitFrequencyRank('least', 15)
   // Returns the digit that appears least often in last 15 ticks
   ```

3. **Second Most Frequent**
   ```javascript
   Bot.getDigitFrequencyRank('second_most', 25)
   // Returns the second most common digit in last 25 ticks
   ```

4. **Second Least Frequent**
   ```javascript
   Bot.getDigitFrequencyRank('second_least', 30)
   // Returns the second least common digit in last 30 ticks
   ```

### Trading Strategy Examples

#### 1. **Dominant Digit Strategy**
```javascript
// Check for high digit dominance
const mostFrequent = await Bot.getDigitFrequencyRank('most', 20);
if (mostFrequent >= 7) {
    // High digits (7,8,9) are dominant
    // Consider "Over" trades
}
```

#### 2. **Rare Digit Avoidance**
```javascript
// Identify underrepresented digits
const leastFrequent = await Bot.getDigitFrequencyRank('least', 15);
if (leastFrequent === 0 || leastFrequent === 9) {
    // Extreme digits are rare
    // Avoid strategies targeting these digits
}
```

#### 3. **Frequency Spread Analysis**
```javascript
// Analyze frequency distribution
const most = await Bot.getDigitFrequencyRank('most', 25);
const least = await Bot.getDigitFrequencyRank('least', 25);
const spread = most - least;

if (spread >= 6) {
    // Wide spread indicates volatility
    // Use volatility-based strategies
} else if (spread <= 2) {
    // Narrow spread indicates consolidation
    // Use range-bound strategies
}
```

#### 4. **Secondary Pattern Detection**
```javascript
// Compare primary and secondary patterns
const primary = await Bot.getDigitFrequencyRank('most', 20);
const secondary = await Bot.getDigitFrequencyRank('second_most', 20);

if (Math.abs(primary - secondary) <= 1) {
    // Adjacent digits are most frequent
    // Range consolidation pattern
}
```

## 🎲 Frequency Ranking Explained

### Ranking System
The system sorts all digits (0-9) by their frequency of appearance:

```
Example: Digit counts in 20 ticks
[3, 1, 4, 2, 0, 1, 3, 2, 1, 3]  // Count for digits 0-9

Sorted by frequency:
1. Most: 2 (appears 4 times)
2. Second Most: 0, 6, 9 (appear 3 times each) → 0 (lowest digit wins tie)
3. ...
4. Second Least: 1, 5, 8 (appear 1 time each) → 8 (highest digit wins tie)
5. Least: 4 (appears 0 times)
```

### Tie-Breaking Rules
- **Descending frequency**: Higher frequency ranks higher
- **Ascending digit**: For equal frequencies, lower digit number wins
- **Consistent ordering**: Ensures predictable results

## 📈 Strategic Applications

### 1. **Market Sentiment Analysis**
- **High Digits Dominant** (most ≥ 7): Bullish market sentiment
- **Low Digits Dominant** (most ≤ 2): Bearish market sentiment
- **Mid Digits Dominant** (most 3-6): Neutral/balanced market

### 2. **Pattern Recognition**
- **Extreme Clustering**: Most and second most are 0,1 or 8,9
- **Range Concentration**: Most frequent digits within narrow range
- **Uniform Distribution**: Similar frequencies across all digits

### 3. **Volatility Assessment**
- **High Volatility**: Large spread between most and least frequent
- **Low Volatility**: Small spread, uniform distribution
- **Directional Bias**: Consistent high or low digit preference

### 4. **Entry/Exit Signals**
- **Trend Continuation**: Most frequent digit aligns with trend direction
- **Reversal Signals**: Sudden change in frequency leaders
- **Breakout Confirmation**: Extreme digits become dominant

## 🔍 Testing and Debugging

### Browser Console Testing
```javascript
// Test all rankings
await Bot.getDigitFrequencyRank('most', 15);
await Bot.getDigitFrequencyRank('second_most', 15);
await Bot.getDigitFrequencyRank('second_least', 15);
await Bot.getDigitFrequencyRank('least', 15);

// Comprehensive analysis
Promise.all([
    Bot.getDigitFrequencyRank('most', 20),
    Bot.getDigitFrequencyRank('least', 20)
]).then(([most, least]) => {
    console.log(`Frequency range: ${least} to ${most} (spread: ${most - least})`);
});
```

### Debug Tools Available
1. **test-digit-frequency-rank.html** - Interactive testing interface with visual charts
2. **debug-digit-frequency-rank.js** - Console debugging and monitoring tools
3. Built-in comprehensive test suite with frequency visualization

## ⚡ Performance Considerations

### Optimization Tips
- **Sample Size**: Use 15-30 ticks for statistical significance
- **Update Frequency**: Monitor changes in frequency leaders
- **Memory Efficiency**: Algorithms optimized for real-time calculation
- **Caching**: Results calculated fresh from current tick data

### Recommended Settings
- **Scalping**: 10-15 ticks for immediate patterns
- **Short-term**: 20-25 ticks for trend confirmation  
- **Medium-term**: 30-40 ticks for statistical reliability
- **Long-term**: 50+ ticks for robust frequency analysis

## 🚨 Error Handling

### Common Issues
1. **Insufficient Data**: Returns -1 if no ticks available
2. **Ranking Edge Cases**: Handles scenarios with identical frequencies
3. **Single Digit Scenarios**: Gracefully handles limited digit variety

### Error Prevention
```javascript
try {
    const mostFrequent = await Bot.getDigitFrequencyRank('most', 20);
    if (mostFrequent >= 0 && mostFrequent <= 9) {
        // Valid digit returned
    } else {
        // Handle insufficient data (-1)
    }
} catch (error) {
    console.error('Frequency analysis failed:', error);
}
```

## 🔗 Integration Points

### Block Categories
- **Primary**: "Tick and candle analysis"
- **Secondary**: "binaryfx"

### Related Blocks
- `even_odd_percentage` - Even/odd digit analysis
- `over_under_percentage` - Threshold-based digit analysis  
- `last_digit` - Current tick digit
- `stat` - Statistical functions

### API Integration
- **Interface**: `TicksInterface.js`
- **Trade Engine**: `Ticks.js` class
- **WebSocket**: Real-time tick data stream

## 📚 Advanced Examples

### Multi-Timeframe Analysis
```javascript
// Compare short vs long term frequency leaders
const shortTerm = await Bot.getDigitFrequencyRank('most', 10);
const longTerm = await Bot.getDigitFrequencyRank('most', 30);

if (shortTerm === longTerm) {
    // Consistent leader - strong trend
} else {
    // Different leaders - potential transition
}
```

### Frequency Momentum Strategy
```javascript
// Track changes in frequency leadership
const currentLeader = await Bot.getDigitFrequencyRank('most', 15);
// Store previous leader
if (currentLeader !== previousLeader) {
    // Leadership change detected
    // Potential trend shift signal
}
```

### Statistical Significance Check
```javascript
// Ensure meaningful frequency differences
const [most, secondMost] = await Promise.all([
    Bot.getDigitFrequencyRank('most', 25),
    Bot.getDigitFrequencyRank('second_most', 25)
]);

// Additional logic would be needed to get actual counts
// This is conceptual for strategy development
```

## 🎯 Best Practices

1. **Combine Rankings**: Use multiple rankings for comprehensive analysis
2. **Monitor Changes**: Track frequency leader transitions over time
3. **Statistical Validity**: Use sufficient sample sizes (20+ ticks)
4. **Context Awareness**: Consider market conditions and volatility
5. **Risk Management**: Don't rely solely on frequency analysis

## 📞 Support and Updates

For issues, improvements, or questions regarding the Digit Frequency Rank block:
- Use debug tools for real-time analysis
- Test with various sample sizes
- Monitor frequency stability over time
- Validate with historical data

This block provides sophisticated statistical analysis capabilities, enabling traders to identify and exploit digit frequency patterns for enhanced trading strategies. The ranking system offers multiple perspectives on digit distribution, from dominant patterns to rare occurrences, supporting diverse trading approaches.
