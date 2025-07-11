# Digit Comparison Block Documentation

## Overview
The `digit_comparison` block allows you to compare the last N digits against a specific value using various comparison operators (=, >, <, ≥, ≤).

## Block Structure
```
last [5] digits are [equal to (=) ▼] [7]
```

## Parameters
1. **Count** (Number): How many recent digits to analyze (e.g., 5, 10, 20)
2. **Operator** (Dropdown): The comparison operation to perform
   - `equal to (=)` - All digits must be exactly equal to the target
   - `greater than (>)` - All digits must be greater than the target  
   - `less than (<)` - All digits must be less than the target
   - `greater or equal (≥)` - All digits must be greater than or equal to the target
   - `less or equal (≤)` - All digits must be less than or equal to the target
3. **Digit** (Number): The target digit to compare against (0-9)

## Output
- **Type**: Boolean (true/false)
- **Shape**: Round (compatible with IF conditions)
- **Returns**: `true` if ALL specified digits meet the comparison condition, `false` otherwise

## API Method
```javascript
Bot.checkDigitComparison(count, operator, digit)
```

## Examples

### Basic Usage
```blockly
IF [last 5 digits are equal to 7]
  THEN purchase DIGITEVEN
```

### Advanced Patterns
```blockly
IF [last 3 digits are greater than 6]
  THEN purchase DIGITHIGH
```

```blockly
IF [last 10 digits are less or equal to 4]
  THEN purchase DIGITLOW
```

## 🔄 Using in Conditional Logic

### Direct IF Statement Usage
```blockly
IF [last 5 digits are equal to 3]
  THEN purchase DIGITODD
```

### Logical Operations
```javascript
// AND combination
if (checkDigitComparison(5, 'equal', 7) && getEvenOddPercentage('even', 10) > 60) {
    // Strong 7 pattern AND high even percentage
}

// OR combination  
if (checkDigitComparison(3, 'greater', 8) || checkDigitComparison(3, 'less', 2)) {
    // Either all high digits (9s) or all low digits (0s, 1s)
}

// NOT operation
if (!checkDigitComparison(8, 'equal', 5)) {
    // When digits are NOT all 5s
}
```

## Use Cases

### 1. Strong Single Digit Patterns
- **Pattern**: `last 5 digits are equal to 7`
- **Strategy**: Detect when a specific digit appears consistently
- **Action**: Bet on the continuation of that digit

### 2. High/Low Digit Clusters  
- **Pattern**: `last 3 digits are greater than 6` (7, 8, 9 only)
- **Strategy**: Identify high digit concentration
- **Action**: Purchase HIGH digit contracts

### 3. Low Digit Clusters
- **Pattern**: `last 4 digits are less than 4` (0, 1, 2, 3 only)
- **Strategy**: Identify low digit concentration  
- **Action**: Purchase LOW digit contracts

### 4. Range-Based Patterns
- **Pattern**: `last 6 digits are greater or equal to 3` AND `last 6 digits are less or equal to 7`
- **Strategy**: Detect middle-range digit stability
- **Action**: Avoid extreme HIGH/LOW bets

## Algorithm Details

### Digit Extraction
1. Gets the last N ticks from the price feed
2. Extracts the last digit of each tick price
3. Forms an array of digits for comparison

### Comparison Logic
```javascript
switch (operator) {
    case 'equal':
        result = digits.every(digit => digit === target);
        break;
    case 'greater':  
        result = digits.every(digit => digit > target);
        break;
    case 'less':
        result = digits.every(digit => digit < target);
        break;
    case 'greater_equal':
        result = digits.every(digit => digit >= target);
        break;
    case 'less_equal':
        result = digits.every(digit => digit <= target);
        break;
}
```

## Trading Strategy Examples

### Strategy 1: Pure Digit Repetition
```javascript
// Wait for strong single digit patterns
if (checkDigitComparison(5, 'equal', 7)) {
    purchase('DIGITEVEN'); // 7 is odd, but betting on pattern continuation
}
```

### Strategy 2: High Digit Momentum
```javascript  
// Detect high digit clusters for HIGH betting
if (checkDigitComparison(4, 'greater', 6)) {
    purchase('DIGITHIGH'); // All digits are 7, 8, or 9
}
```

### Strategy 3: Low Digit Momentum
```javascript
// Detect low digit clusters for LOW betting  
if (checkDigitComparison(3, 'less', 4)) {
    purchase('DIGITLOW'); // All digits are 0, 1, 2, or 3
}
```

### Strategy 4: Exclusion Patterns
```javascript
// Avoid middle digits, bet on extremes
if (checkDigitComparison(5, 'less_equal', 2) || checkDigitComparison(5, 'greater_equal', 8)) {
    // All very low (0,1,2) or very high (8,9) digits
    purchase('DIGITEXTREME');
}
```

## Performance Notes
- **Complexity**: O(n) where n is the number of digits to check
- **Efficiency**: Uses JavaScript's `every()` method for optimal performance
- **Memory**: Minimal - only processes the required number of recent ticks

## Troubleshooting

### Common Issues
1. **No ticks available**: Returns `false` when tick history is empty
2. **Invalid target digit**: Ensure target is between 0-9
3. **Large count values**: Be mindful of available tick history length

### Debug Tips
```javascript
// Check current tick digits
console.log('Last 5 digits:', Bot.getLastDigitList(5));

// Verify comparison manually  
console.log('Equal to 7:', Bot.checkDigitComparison(5, 'equal', 7));
```

## Integration with Other Blocks
- ✅ Combines well with `even_odd_percentage` for multi-factor analysis
- ✅ Works with `over_under_percentage` for comprehensive digit profiling  
- ✅ Pairs with `digit_frequency_rank` for frequency + comparison insights
- ✅ Compatible with `all_same_pattern` for layered pattern detection
