# Smart Trading: Tick Direction Condition Feature

## 📊 Overview
Added an advanced tick direction condition to the **Rise/Fall** strategy in Smart Trading. This feature allows traders to add an additional condition that checks whether the last X ticks are consistently rising, falling, or showing no change.

## ✨ New Features

### Tick Direction Condition
The Rise/Fall strategy now supports checking the direction of recent ticks before executing a trade:

- **Enable/Disable Toggle**: Checkbox to activate the tick direction condition
- **Tick Count**: Specify how many recent ticks to analyze (1-20 ticks)
- **Direction Type**: Choose from three options:
  - **Rising**: All checked ticks must be higher than the previous tick
  - **Falling**: All checked ticks must be lower than the previous tick
  - **No Change**: All checked ticks must be equal to the previous tick

## 🎯 How It Works

### Condition Logic
The tick direction condition works as an **AND** condition with the probability condition:

```
Trade Execution = (Probability Condition) AND (Tick Direction Condition)
```

**Example:**
- **Probability Condition**: Rise Prob > 65%
- **Tick Direction Condition**: Last 3 ticks are Rising
- **Action**: Buy Rise

The trade will only execute when BOTH conditions are true:
1. The rise probability is greater than 65%
2. The last 3 ticks show a consistent rising pattern

### Tick Direction Validation
The system analyzes recent price data to validate the tick direction:

```typescript
// Example for "rising" direction with 3 ticks
// Prices: [100.50, 100.55, 100.60, 100.65]
// Checks:
//   100.55 > 100.50 ✅
//   100.60 > 100.55 ✅
//   100.65 > 100.60 ✅
// Result: All ticks rising = TRUE
```

## 🎨 UI Components

### New Controls in Rise/Fall Strategy Card

```
Trading Condition
├─ If [Rise Prob ▼] [> ▼] [65] %
├─ Then [Buy Rise ▼]
└─ ☑ And last [3] ticks are [Rising ▼]
```

### Control Elements
1. **Checkbox**: Enable/disable the tick direction condition
2. **Number Input**: Set how many ticks to check (1-20)
3. **Dropdown**: Select direction type (Rising/Falling/No Change)

## 🔧 Technical Implementation

### Interface Updates
```typescript
interface TradeSettings {
    // ... existing properties
    
    // New tick direction properties
    tickDirectionEnabled?: boolean;     // Enable/disable feature
    tickDirectionCount?: number;        // Number of ticks (1-20)
    tickDirectionCountInput?: string;   // UI input handling
    tickDirectionType?: string;         // 'rise', 'fall', 'no-change'
}
```

### Strategy Initialization
```typescript
{
    id: 'rise-fall',
    name: 'Rise/Fall',
    settings: {
        stake: 0.5,
        ticks: 1,
        martingaleMultiplier: 1,
        conditionType: 'rise',
        conditionOperator: '>',
        conditionValue: 65,
        conditionAction: 'Rise',
        // New defaults
        tickDirectionEnabled: false,
        tickDirectionCount: 3,
        tickDirectionType: 'rise'
    }
}
```

### Condition Evaluation
The `isConditionMet()` function now includes tick direction validation:

```typescript
// 1. Check probability condition
const probabilityConditionMet = /* probability logic */;

// 2. Check tick direction if enabled
if (tickDirectionEnabled) {
    const recentPrices = analysis.recentPrices.slice(-(tickDirectionCount + 1));
    
    // Validate each tick against previous tick
    for (let i = 1; i < recentPrices.length; i++) {
        const prev = parseFloat(recentPrices[i - 1]);
        const curr = parseFloat(recentPrices[i]);
        
        // Check direction based on type
        if (tickDirectionType === 'rise' && curr <= prev) return false;
        if (tickDirectionType === 'fall' && curr >= prev) return false;
        if (tickDirectionType === 'no-change' && curr !== prev) return false;
    }
}

// 3. Return combined result
return probabilityConditionMet && tickConditionMet;
```

## 📝 Handler Functions

### Event Handlers Added
1. **`handleTickDirectionEnabledChange`**: Toggle feature on/off
2. **`handleTickDirectionCountChange`**: Update tick count while typing
3. **`handleTickDirectionCountBlur`**: Validate and clamp tick count on blur
4. **`handleTickDirectionTypeChange`**: Change direction type

## 🎨 Styling

### CSS Classes Added
```scss
.condition-row.tick-direction-row {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border-normal);
    
    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: var(--brand-red-coral);
    }
}
```

## 📊 Data Requirements

### Analysis Data Structure
The feature requires `recentPrices` array in the analysis data:

```typescript
analysis = {
    riseRatio: "67.50",
    fallRatio: "32.50",
    recentPrices: [100.50, 100.55, 100.60, 100.65], // Required for tick direction
    // ... other properties
}
```

**Note**: The system requires `tickDirectionCount + 1` prices to properly evaluate the condition.

## 🚀 Usage Examples

### Example 1: Confirmation Strategy
```
Probability: Rise Prob > 70%
Tick Direction: Last 5 ticks are Rising
Action: Buy Rise

Purpose: Wait for strong probability AND confirmed upward momentum
```

### Example 2: Counter-Trend Strategy
```
Probability: Rise Prob > 65%
Tick Direction: Last 3 ticks are Falling
Action: Buy Rise

Purpose: Enter when probability suggests rise but price is temporarily falling
```

### Example 3: Breakout Strategy
```
Probability: Fall Prob > 60%
Tick Direction: Last 2 ticks are No Change
Action: Buy Fall

Purpose: Trade when probability suggests fall after price consolidation
```

## ⚙️ Configuration Options

### Tick Count Range
- **Minimum**: 1 tick
- **Maximum**: 20 ticks
- **Default**: 3 ticks
- **Recommended**: 3-5 ticks for most strategies

### Direction Types
1. **Rising**: Each tick > previous tick (strict uptrend)
2. **Falling**: Each tick < previous tick (strict downtrend)
3. **No Change**: Each tick = previous tick (consolidation)

## 🔍 Debugging

The feature includes comprehensive logging:

```
📈 [TICK DIRECTION] Checking last 3 ticks for rise
📈 [TICK DIRECTION] Recent prices: [100.50, 100.55, 100.60, 100.65]
📈 [TICK DIRECTION] Tick condition met: true
📈 [DETAILED] Final Rise/Fall condition result: true (probability: true && ticks: true)
```

## ⚠️ Important Notes

1. **Data Dependency**: Feature requires sufficient tick data from the volatility analyzer
2. **Strict Matching**: ALL ticks must match the selected direction (no exceptions)
3. **Performance**: Disabled by default to avoid affecting existing strategies
4. **Cooldown**: Works with existing trade cooldown and settlement logic

## 🎯 Benefits

1. **Enhanced Precision**: Reduce false signals by confirming momentum
2. **Flexible Strategies**: Support multiple trading approaches
3. **Risk Management**: Add extra confirmation before executing trades
4. **User Control**: Enable/disable based on market conditions

## 📅 Implementation Date
**October 19, 2025**

## 📁 Modified Files
- `src/pages/chart/smart-trading-display.tsx` - Main logic and UI
- `src/pages/chart/smart-trading-display.scss` - Styling

---

**Status**: ✅ Fully Implemented and Ready for Testing
