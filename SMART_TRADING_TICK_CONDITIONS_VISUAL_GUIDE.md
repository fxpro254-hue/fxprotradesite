# Smart Trading - Tick Conditions Visual Guide

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TICK CONDITIONS FEATURE SUITE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📈 RISE/FALL - Tick Direction                                             │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ ☑ and last [3] ticks are [Rise ▼]                                │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│  Purpose: Validate price movement direction                                │
│  Options: Rise | Fall | No Change                                          │
│  Example: "Last 5 ticks must all be rising"                               │
│                                                                             │
│  🎲 EVEN/ODD - Tick Digit Pattern                                          │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ ☑ and last [3] digits are [Even ▼]                               │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│  Purpose: Validate last digit parity pattern                               │
│  Options: Even | Odd                                                       │
│  Example: "Last 4 digits must all be even (0,2,4,6,8)"                    │
│                                                                             │
│  💰 OVER/UNDER - Tick Digit Comparison                                     │
│  ┌───────────────────────────────────────────────────────────────────┐     │
│  │ ☑ and last [3] digits are [Over ▼] [5]                           │     │
│  └───────────────────────────────────────────────────────────────────┘     │
│  Purpose: Validate last digit against barrier                              │
│  Options: Over | Under | Equal to (Barrier: 0-9)                          │
│  Example: "Last 3 digits must all be over 5 (6,7,8,9)"                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## How It Works - Step by Step

### Step 1: Primary Condition (Probability)
```
┌────────────────────────────────────────┐
│ If Rise Probability > 60%              │  ← Traditional condition
└────────────────────────────────────────┘
         ↓
    Check probability from analyzer
         ↓
    ✅ 65% > 60% → TRUE
```

### Step 2: Secondary Condition (Tick Pattern)
```
┌────────────────────────────────────────┐
│ and last 3 ticks are Rise              │  ← NEW tick condition
└────────────────────────────────────────┘
         ↓
    Get last 3 prices from buffer
         ↓
    Prices: [100.1, 100.2, 100.3]
         ↓
    Check direction:
    100.2 > 100.1 → Rise ✅
    100.3 > 100.2 → Rise ✅
         ↓
    ✅ ALL RISING → TRUE
```

### Step 3: Combine with AND Logic
```
┌────────────────────────────────────────┐
│  Probability: ✅ TRUE                  │
│  Tick Pattern: ✅ TRUE                 │
│  ─────────────────────────────────     │
│  Final Result: ✅ TRADE ALLOWED        │
└────────────────────────────────────────┘
```

## Visual Examples

### Example 1: Rise/Fall Strategy
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ If Rise Prob >= 60%                                 │
│ Then Buy Rise                                       │
│ ☑ and last 5 ticks are Rise                        │
└─────────────────────────────────────────────────────┘

Price History:
Time:  T-4    T-3    T-2    T-1     T
Price: 100.1  100.2  100.3  100.4  100.5
         │      │      │      │      │
         └──────┴──────┴──────┴──────┘
          ↗     ↗     ↗     ↗     (All rising)

Analysis:
✅ Rise Probability: 65% (65 >= 60)
✅ Tick Direction: All 5 ticks rising

Result: 🟢 TRADE ALLOWED
```

### Example 2: Even/Odd Strategy
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ If Even Prob > 55%                                  │
│ Then Buy Even                                       │
│ ☑ and last 4 digits are Even                       │
└─────────────────────────────────────────────────────┘

Price History:
Prices:  123.452  123.454  123.456  123.458
Digits:     2        4        6        8
           Even     Even     Even     Even

Analysis:
✅ Even Probability: 62% (62 > 55)
✅ Tick Digits: All 4 digits are even

Result: 🟢 TRADE ALLOWED
```

### Example 3: Over/Under Strategy
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ If Over Prob > 60%                                  │
│ Then Buy Over digit 5                               │
│ ☑ and last 3 digits are Over 5                     │
└─────────────────────────────────────────────────────┘

Price History:
Prices:  99.876  99.877  99.878
Digits:    6       7       8
          >5      >5      >5

Analysis:
✅ Over Probability: 67% (67 > 60)
✅ Tick Comparison: All 3 digits > 5

Result: 🟢 TRADE ALLOWED
```

## Blocking Scenarios (When Trades Don't Execute)

### Scenario 1: Probability Fails
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ If Rise Prob >= 60%                                 │
│ ☑ and last 3 ticks are Rise                        │
└─────────────────────────────────────────────────────┘

Analysis:
❌ Rise Probability: 45% (45 < 60) ← FAILS
✅ Tick Direction: All rising

Result: 🔴 TRADE BLOCKED
Reason: Probability condition not met
```

### Scenario 2: Tick Pattern Fails
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ If Rise Prob >= 60%                                 │
│ ☑ and last 3 ticks are Rise                        │
└─────────────────────────────────────────────────────┘

Price History:
Prices: 100.1  100.2  100.1  (Rise, Fall)
         ↗      ↘     ← MIXED DIRECTION

Analysis:
✅ Rise Probability: 65% (65 >= 60)
❌ Tick Direction: Not all rising ← FAILS

Result: 🔴 TRADE BLOCKED
Reason: Tick pattern condition not met
```

### Scenario 3: Insufficient Data
```
Configuration:
┌─────────────────────────────────────────────────────┐
│ ☑ and last 10 ticks are Even                       │
└─────────────────────────────────────────────────────┘

Price Buffer:
Available: 5 prices
Required:  10 prices
           ↑
        NOT ENOUGH DATA

Result: 🔴 TRADE BLOCKED
Reason: Need 10 prices, have only 5
Action: Wait for more price ticks
```

## UI Control Guide

### Checkbox States
```
☐ Disabled (unchecked)     → Feature OFF, only probability used
☑ Enabled (checked)        → Feature ON, both conditions required
☒ Disabled (trading active) → Cannot change during active trade
```

### Count Input
```
Input: [___]
Valid: 1 - 20
Default: 3

Examples:
[1]  → Check last 1 tick only
[3]  → Check last 3 ticks (default)
[10] → Check last 10 ticks (stricter)
[20] → Maximum allowed
```

### Type/Direction Dropdown
```
Rise/Fall:
┌──────────────┐
│ Rise       ▼ │ → All ticks must be rising
│ Fall         │ → All ticks must be falling
│ No Change    │ → All ticks must be unchanged
└──────────────┘

Even/Odd:
┌──────────────┐
│ Even       ▼ │ → All digits must be even (0,2,4,6,8)
│ Odd          │ → All digits must be odd (1,3,5,7,9)
└──────────────┘

Over/Under:
┌──────────────┐
│ Over       ▼ │ → All digits must be > barrier
│ Under        │ → All digits must be < barrier
│ Equal to     │ → All digits must equal barrier
└──────────────┘
```

### Barrier Input (Over/Under Only)
```
Input: [_]
Valid: 0 - 9
Default: 5

Examples:
[0] → Check if digits > 0 (all non-zero)
[5] → Check if digits > 5 (6,7,8,9)
[9] → Check if digits > 9 (impossible - always blocks)
```

## Console Logging Examples

### Successful Trade
```
📈 [RISE/FALL] Probability condition: 65 > 60 = true
📈 [TICK DIRECTION] ⚙️ Feature ENABLED - Checking last 3 ticks for rise
📈 [TICK DIRECTION] 📊 Analyzing recent prices: [100.1, 100.2, 100.3]
📈 [TICK DIRECTION] 🔍 Price changes detected: ['rise', 'rise']
📈 [TICK DIRECTION] ✅ All 2 price changes are rise
📈 [TICK DIRECTION] ✅ Direction condition: MET
📈 [DETAILED] ⚖️ Final Rise/Fall condition result: true
📈 [DETAILED] └─ Probability condition: ✅
📈 [DETAILED] └─ Direction condition: ✅
📈 [DETAILED] └─ Combined (AND): ✅ TRADE ALLOWED
```

### Blocked Trade - Pattern Failed
```
🎲 [EVEN/ODD] Probability condition: 62 > 55 = true
🎲 [TICK DIGIT] ⚙️ Feature ENABLED - Checking last 4 digits for even
🎲 [TICK DIGIT] 📊 Analyzing recent prices: [123.452, 123.453, 123.454, 123.456]
🎲 [TICK DIGIT] 🔢 Last digits extracted: [2, 3, 4, 6]
🎲 [TICK DIGIT] ✅ Digit 0: 2 is even
🎲 [TICK DIGIT] ❌ BLOCKING - Digit 1: 3 is NOT even (it's odd)
🎲 [TICK DIGIT] ❌ Digit pattern condition: NOT MET
🎲 [DETAILED] ⚖️ Final Even/Odd condition result: false
🎲 [DETAILED] └─ Probability condition: ✅
🎲 [DETAILED] └─ Digit pattern condition: ❌
🎲 [DETAILED] └─ Combined (AND): ❌ TRADE BLOCKED
```

### Blocked Trade - Insufficient Data
```
💰 [OVER/UNDER] Probability condition: 67 > 60 = true
💰 [TICK COMPARISON] ⚙️ Feature ENABLED - Checking last 10 digits over 5
💰 [TICK COMPARISON] ❌ BLOCKING TRADE - Insufficient price data
💰 [TICK COMPARISON] Need 10 prices, have 5
💰 [DETAILED] Final Over/Under condition result: false (probability: true && comparison: UNAVAILABLE)
```

## Common Use Cases

### 1. Momentum Confirmation (Rise/Fall)
```
Scenario: Only trade rises when momentum is strong
Configuration:
  - If Rise Prob >= 65%
  - and last 5 ticks are Rise
  
Benefit: Filters out weak signals with mixed price action
```

### 2. Streak Validation (Even/Odd)
```
Scenario: Only trade evens when there's a pattern
Configuration:
  - If Even Prob > 55%
  - and last 3 digits are Even
  
Benefit: Confirms statistical pattern with actual data
```

### 3. Barrier Confirmation (Over/Under)
```
Scenario: Only trade when recent digits support prediction
Configuration:
  - If Over Prob > 60%
  - and last 4 digits are Over 5
  
Benefit: Validates that recent price behavior aligns with prediction
```

## Troubleshooting Flowchart

```
                    ┌─────────────────┐
                    │ Trades not      │
                    │ executing?      │
                    └────────┬────────┘
                             ↓
              ┌──────────────┴──────────────┐
              │                             │
         Check checkbox              Check console
              ↓                             ↓
      ┌──────────────┐              ┌──────────────┐
      │ Is it ☑?     │              │ Any ❌ marks?│
      └──────┬───────┘              └──────┬───────┘
             ↓                              ↓
        ┌────┴─────┐                  ┌─────┴──────┐
        │          │                  │            │
      YES          NO               YES            NO
        │          │                  │            │
        ↓          ↓                  ↓            ↓
   Check logs   Feature        Read error     Check data
   for ❌       disabled        message        buffer
                 │                  │             │
                 ↓                  ↓             ↓
            All good!        Fix issue      Need more
            (Working as              │       ticks
             intended)               ↓           │
                              ┌──────────┐       ↓
                              │Probability│  Wait for
                              │or pattern │  buffer to
                              │failed     │  fill up
                              └──────────┘
```

## Quick Tips

### ✅ DO:
- Start with small tick counts (3-5) for testing
- Monitor console logs to understand behavior
- Use "No Change" for ranging markets (Rise/Fall)
- Combine with probability thresholds for best results
- Disable feature when not needed (reduces restrictions)

### ❌ DON'T:
- Set tick count too high (>10) without sufficient data
- Expect instant trades after enabling (need buffer fill)
- Ignore console warnings about insufficient data
- Use during highly volatile markets (patterns break quickly)
- Enable all three features simultaneously (may over-restrict)

## Settings Persistence

```
Storage Location: localStorage
Key Format: smart_trading_{strategyId}_{loginid}

Example:
┌──────────────────────────────────────────────────────┐
│ Key: smart_trading_rise-fall_CR123456                │
│ Value: {                                             │
│   "tickDirectionEnabled": true,                      │
│   "tickDirectionCount": 3,                           │
│   "tickDirectionType": "rise",                       │
│   ... other settings ...                             │
│ }                                                    │
└──────────────────────────────────────────────────────┘

Behavior:
- Settings saved automatically on change
- Settings loaded automatically on page load
- Settings are per-strategy per-account
- Clear browser data will reset to defaults
```

## Performance Impact

```
┌─────────────────────────────────────────────────┐
│ Component          │ Impact    │ Notes          │
├────────────────────┼───────────┼────────────────┤
│ Memory Usage       │ Minimal   │ ~200 bytes     │
│ CPU Usage          │ Negligible│ <1ms per check │
│ Network Traffic    │ None      │ Local only     │
│ UI Responsiveness  │ No impact │ Async updates  │
│ Trade Execution    │ No delay  │ Instant check  │
└─────────────────────────────────────────────────┘
```

## Summary Comparison Table

| Feature | Strategy | Check Type | Count Range | Options | Barrier |
|---------|----------|-----------|-------------|---------|---------|
| Tick Direction | Rise/Fall | Price movement | 1-20 | Rise/Fall/No-change | No |
| Tick Digit Pattern | Even/Odd | Last digit parity | 1-20 | Even/Odd | No |
| Tick Digit Comparison | Over/Under | Last digit vs barrier | 1-20 | Over/Under/Equals | 0-9 |

---

**Remember:** All three features use strict AND logic. Both the probability condition AND the tick pattern condition must be TRUE for trades to execute. This provides powerful filtering but may reduce trade frequency. Adjust settings based on your trading style and market conditions.
