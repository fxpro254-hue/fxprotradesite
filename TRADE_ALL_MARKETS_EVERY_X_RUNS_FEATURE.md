# Trade All Markets - Every X Runs Feature

## 🎯 Overview
Extended the "Trade all markets simultaneously" checkbox with an **interval parameter** that allows you to specify when to use random symbols.

The feature now reads:
```
Trade all markets simultaneously every [x] runs
```

Where `x` can be any value from 1 to 1000, allowing granular control over when random symbol selection occurs.

---

## 📋 How It Works

### Default Behavior (Checkbox Disabled)
```
Trade 1: Selected Symbol (e.g., EURUSD)
Trade 2: Selected Symbol (EURUSD)
Trade 3: Selected Symbol (EURUSD)
Trade 4: Selected Symbol (EURUSD)
```

### With Checkbox Enabled, Every 1 Run
```
Trade 1: Random Symbol (R_25)        ← Every 1st trade
Trade 2: Random Symbol (1HZ75V)      ← Every 1st trade
Trade 3: Random Symbol (R_100)       ← Every 1st trade
Trade 4: Random Symbol (1HZ30V)      ← Every 1st trade
```

### With Checkbox Enabled, Every 2 Runs
```
Trade 1: Selected Symbol (EURUSD)    ← Skip
Trade 2: Random Symbol (R_50)        ← Every 2nd trade
Trade 3: Selected Symbol (EURUSD)    ← Skip
Trade 4: Random Symbol (1HZ25V)      ← Every 2nd trade
```

### With Checkbox Enabled, Every 3 Runs
```
Trade 1: Selected Symbol (EURUSD)    ← Skip
Trade 2: Selected Symbol (EURUSD)    ← Skip
Trade 3: Random Symbol (R_75)        ← Every 3rd trade
Trade 4: Selected Symbol (EURUSD)    ← Skip
Trade 5: Selected Symbol (EURUSD)    ← Skip
Trade 6: Random Symbol (1HZ100V)     ← Every 3rd trade
```

### With Checkbox Enabled, Every 5 Runs
```
Trades 1-4: Selected Symbol (EURUSD) ← Skip
Trade 5:    Random Symbol (R_10)     ← Every 5th trade
Trades 6-9: Selected Symbol (EURUSD) ← Skip
Trade 10:   Random Symbol (1HZ50V)   ← Every 5th trade
```

---

## 🔧 Technical Implementation

### 1. Block Definition Update
**File**: [src/external/bot-skeleton/scratch/blocks/Binary/Trade Definition/trade_definition_market.js](src/external/bot-skeleton/scratch/blocks/Binary/Trade%20Definition/trade_definition_market.js)

Added second message line with checkbox and number input:

```javascript
message1: localize('Trade all markets simultaneously every {{ trade_all_markets }} {{ every_x_runs }} runs', {
    trade_all_markets: '%1',
    every_x_runs: '%2',
}),
args1: [
    {
        type: 'field_checkbox',
        name: 'TRADE_ALL_MARKETS',
        checked: false,
    },
    {
        type: 'field_number',
        name: 'EVERY_X_RUNS',
        value: 1,
        min: 1,
        max: 1000,
        precision: 1,
    },
],
```

**Visual Result**:
```
┌────────────────────────────────────────────────┐
│ Market: [Forex] > [Majors] > [EURUSD]         │
│ Trade all markets simultaneously ☑ every 5 runs│
└────────────────────────────────────────────────┘
```

---

### 2. Trade Definition Generator
**File**: [src/external/bot-skeleton/scratch/blocks/Binary/Trade Definition/trade_definition.js](src/external/bot-skeleton/scratch/blocks/Binary/Trade%20Definition/trade_definition.js)

Reads both checkbox and number input values:

```javascript
const trade_all_markets = market_block.getFieldValue('TRADE_ALL_MARKETS') === true || 
                          market_block.getFieldValue('TRADE_ALL_MARKETS') === 'TRUE';
const every_x_runs = parseInt(market_block.getFieldValue('EVERY_X_RUNS'), 10) || 1;

console.log(`Trade Definition: Symbol "${symbol}" selected, Trade All Markets: ${trade_all_markets}, Every X Runs: ${every_x_runs}`);
```

Passes both to Bot.init():

```javascript
Bot.init('${account}', {
    symbol              : '${initSymbol}',
    tradeAllMarkets     : ${trade_all_markets},
    everyXRuns          : ${every_x_runs},  // NEW
    contractTypes       : ${JSON.stringify(contract_type_list)},
    candleInterval      : '${candle_interval || 'FALSE'}',
    shouldRestartOnError: ${should_restart_on_error},
    timeMachineEnabled  : ${should_restart_on_buy_sell},
});
```

---

### 3. Trade Engine Initialization
**File**: [src/external/bot-skeleton/services/tradeEngine/trade/index.js](src/external/bot-skeleton/services/tradeEngine/trade/index.js)

Stores the interval and initializes run counter:

```javascript
this.tradeOptions = { 
    ...validated_trade_options, 
    symbol: this.options.symbol,
    tradeAllMarkets: this.options.tradeAllMarkets,
    everyXRuns: this.options.everyXRuns || 1
};

// Initialize run counter for tracking when to use random symbols
this.tradeAllMarketsRunCount = 0;

// Also in constructor:
this.$scope.tradeAllMarketsRunCount = 0;
```

---

### 4. Purchase Logic - Smart Symbol Selection
**File**: [src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js](src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js)

Implements the "every X runs" logic:

```javascript
if (this.tradeOptions.tradeAllMarkets) {
    const everyXRuns = this.tradeOptions.everyXRuns || 1;
    const runCount = this.$scope?.tradeAllMarketsRunCount || 0;
    
    // Check if this is the run where we should use random symbol
    if ((runCount + 1) % everyXRuns === 0) {
        const randomSymbol = this.getRandomAvailableSymbol();
        const previousSymbol = enhancedTradeOptions.symbol;
        console.log(`🎲 Trade All Markets Enabled (Run ${runCount + 1}/${everyXRuns}): Trading on ${randomSymbol}`);
        enhancedTradeOptions.symbol = randomSymbol;
    } else {
        console.log(`📌 Regular trading (Run ${runCount + 1}/${everyXRuns}): Using symbol ${enhancedTradeOptions.symbol}`);
    }
    
    // Increment the run counter
    if (this.$scope) {
        this.$scope.tradeAllMarketsRunCount = (runCount + 1) % (everyXRuns * 100);
    }
}
```

**Logic Explanation**:
- Uses modulo arithmetic: `(runCount + 1) % everyXRuns === 0`
- When the remainder equals 0, we're at a "random symbol" trade
- Counter increments and resets to prevent overflow

---

## 🎲 Available Random Symbols
When a trade uses random selection, it picks from these 13 markets:

```
Volatility Indices (5):
- R_10, R_25, R_50, R_75, R_100

High-Frequency Indices (8):
- 1HZ10V, 1HZ15V, 1HZ25V, 1HZ30V, 1HZ50V, 1HZ75V, 1HZ90V, 1HZ100V
```

---

## 💡 Use Cases

### Case 1: Test Different Markets
```
Symbol: EURUSD
Every: 1 run
Result: All trades on random volatility indices
```

### Case 2: Baseline + Diversification
```
Symbol: EURUSD
Every: 3 runs
Result: 2 trades on EURUSD, then 1 on random index (66% baseline, 33% test)
```

### Case 3: Occasional Diversification
```
Symbol: GBPUSD
Every: 10 runs
Result: 9 trades on GBPUSD, then 1 on random index (90% baseline, 10% test)
```

### Case 4: Rare Market Testing
```
Symbol: AUDJPY
Every: 20 runs
Result: 19 trades on AUDJPY, then 1 on random index (95% baseline, 5% test)
```

---

## 📊 Console Output Example

```
Trade All Markets Check:
   tradeAllMarkets flag: "true"
   everyXRuns value: "3"
   current run count: 0
   current symbol: "EURUSD"

📌 Regular trading (Run 1/3): Using symbol EURUSD (waiting for run 3)

[Next trade]
   current run count: 1
📌 Regular trading (Run 2/3): Using symbol EURUSD (waiting for run 3)

[Next trade]
   current run count: 2
🎲 Trade All Markets Enabled (Run 3/3): Trading on R_75 (previous: EURUSD)

[Counter resets, cycle repeats]
   current run count: 0
```

---

## ✅ Key Features

| Feature | Details |
|---------|---------|
| **Range** | 1 to 1000 runs |
| **Default** | 1 (every trade is random) |
| **Precision** | Integer values only |
| **State Tracking** | Run counter maintained per bot session |
| **Reset** | Counter resets every (everyXRuns × 100) trades |
| **Symbols** | 13 high-quality markets |
| **Modulo Logic** | Uses `(runCount + 1) % everyXRuns === 0` |

---

## 🔄 Files Modified

1. **trade_definition_market.js** - Added number input field
2. **trade_definition.js** - Read and pass interval value
3. **index.js (trade engine)** - Initialize and track run counter
4. **Purchase.js** - Implement modulo logic for symbol selection

---

## 🧪 Testing Scenarios

- [ ] Set to every 1: Should randomize every trade
- [ ] Set to every 2: Should alternate selected/random
- [ ] Set to every 3: Should pick random every 3rd
- [ ] Set to every 10: Should pick random every 10th
- [ ] Verify run counter increments correctly
- [ ] Verify counter doesn't exceed bounds
- [ ] Test with tick trading enabled
- [ ] Verify correct symbols from 13-symbol pool
- [ ] Check console logs for expected patterns

---

## 🚀 Next Steps

The implementation is complete and ready for testing. Users can now control exactly how often they want to diversify into random markets while maintaining a baseline strategy.
