# Trading Hub Architecture & Trade Execution Analysis

## 📋 Executive Summary
The trading hub is a sophisticated multi-layered system that handles trade execution across different modes (normal, tick trading, O5U4, Matches, Over/Under, Digit Differ). It includes advanced risk management with Stop Loss/Take Profit protection and multiple conditional execution paths.

---

## 🏗️ System Architecture Overview

### High-Level Components
```
┌─────────────────────────────────────────────────────────────┐
│               TRADING HUB DISPLAY (React Component)         │
│  - State Management                                          │
│  - UI Controls (Start/Stop, Stakes, Barriers)               │
│  - Mode Selection (O5U4, Matches, Over/Under, etc.)         │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Purchase.js     │  │ Market Analyzer  │
│  (Trade Engine)  │  │ (Analysis)       │
└──────────────────┘  └──────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   API Base / WS     │
        │  (WebSocket API)    │
        └─────────────────────┘
```

---

## 🔄 Trading Flow - Two Primary Modes

### Mode 1: Normal Trading (Single Trade)
```
1. User initiates trade (UI button click)
   ↓
2. TradingHubDisplay calls Purchase.purchase()
   - Passes: contract_type, trade_each_tick=false
   ↓
3. Purchase.executeSingleTrade(contract_type)
   - Validates trade options
   - Applies barriers/predictions if provided
   - Handles Trade All Markets (random symbol selection)
   ↓
4. Creates Buy Request & Sends to API
   - Uses doUntilDone() wrapper for retry logic
   - Parameters: symbol, duration, amount, contract_type
   ↓
5. API Returns Result
   - Contract ID assigned
   - Trade tracked in activeContracts
   ↓
6. Monitor Contract State
   - Set via purchaseInProgress flag
   ↓
7. Contract Completes or Expires
   - Profit/Loss calculated
   - UI updated with result
```

### Mode 2: Tick Trading (Continuous Per-Tick Execution)
```
1. User sets contract with trade_each_tick=true
   ↓
2. Purchase.purchase() called with trade_each_tick=true
   ↓
3. Check if Tick Trading Already Enabled?
   
   NO (First time)           YES (Condition re-evaluation)
   ↓                         ↓
   enableTickTrading()       executeSingleTrade()
   │                         (just execute, no new listener)
   ├─ Set tickTradeEnabled=true
   ├─ Register tick listener via ticksService.monitor()
   ├─ Execute first trade immediately
   └─ Return
   
   ↓
4. Tick Listener Active
   - Monitors symbol for each new tick
   
   ↓
5. On Each New Tick
   
   Call BinaryBotPrivateBeforePurchase()
        ↓
   Re-evaluate ALL IF/ELSE conditions ✅
        ↓
   Execute appropriate purchase (may be different contract)
        ↓
   Wait for contract completion (max 30 seconds)
        ↓
   Call BinaryBotPrivateAfterPurchase()
        ↓
   Check "Trade Again" restart conditions
        ├─ If Trade Again = Yes → Continue to next tick
        └─ If Trade Again = No  → Stop tick trading ⛔

6. Tick Trading Stops When:
   - After Purchase returns false (Trade Again = No)
   - Manual stop via UI
   - SL/TP triggered
```

---

## 🎯 Key Trading Modes

### 1. O5U4 (Over 5 / Under 4 Dual Strategy)
**File:** [src/components/trading-hub/trading-hub-display.tsx](src/components/trading-hub/trading-hub-display.tsx#L2716)

**How It Works:**
- Monitors market conditions via market analyzer
- Executes TWO simultaneous trades:
  - Over 5: Predicts price will end over 5 digits
  - Under 4: Predicts price will end under 4 digits
- Covers 80% of possible outcomes (only 5 is risk)
- Trades combined for higher win rate

**Execution Flow:**
```
1. checkO5U4Conditions() evaluates market state
2. If conditions met, executeO5U4Trade()
3. Creates 2 simultaneous buy proposals:
   - Contract type: DIGITOVER, Barrier: 5
   - Contract type: DIGITUNDER, Barrier: 4
4. Executes both via Promise.all()
5. Tracks both contract IDs
6. Calculates combined P&L
```

**Active Tracking:**
- `o5u4ActiveContracts.current` stores active contract IDs
- Prevents duplicate trades if contracts still active
- Combines results for reporting

---

### 2. Matches (Digit Matching Strategy)
**File:** [src/components/trading-hub/trading-hub-display.tsx](src/components/trading-hub/trading-hub-display.tsx#L1937)

**How It Works:**
- Analyzes tick data for repeating digit patterns
- Executes trades on ALL matching digits found
- Uses market analyzer to identify best symbols
- High frequency - rapid consecutive trades

**Execution Flow:**
```
1. checkMatchesConditions() checks pattern readiness
2. Market analyzer identifies matching digits (e.g., [2,5,7,9])
3. executeMatchesTrades()
   ├─ For each matching digit:
   │  ├─ Create price proposal for that digit
   │  ├─ Get quote price
   │  ├─ Send buy request
   │  └─ Track contract ID
   ├─ Wait for ALL trades via Promise.all()
   ├─ Validate all succeeded
   └─ Add to activeContracts
```

**Advantages:**
- Multiple simultaneous trades = multiple win opportunities
- Symbol auto-selected by analyzer
- Tick-based frequency = rapid execution

---

### 3. Over/Under (Price Range Strategy)
**File:** [src/components/trading-hub/trading-hub-display.tsx](src/components/trading-hub/trading-hub-display.tsx#L2507)

**How It Works:**
- Predicts if price will be over or under a barrier
- Simpler than O5U4, faster execution
- Barrier is configurable via UI

**Execution Flow:**
```
1. executeDigitOverTrade()
   ├─ Get market recommendation
   ├─ Create buy proposal with barrier
   ├─ Send to API
   └─ Track contract
```

---

### 4. Digit Differ (Difference Between Digits)
**File:** [src/components/trading-hub/trading-hub-display.tsx](src/components/trading-hub/trading-hub-display.tsx#L2428)

**Similar to Matches but:**
- Looks for price difference patterns
- Executes on differences found
- Different analysis logic than Matches

---

## 🔐 Stop Loss & Take Profit (13-Layer Protection)

### Core Protection Mechanism
**File:** [src/components/trading-hub/trading-hub-display.tsx](src/components/trading-hub/trading-hub-display.tsx#L2070)

### The 13 Protection Layers

```
LAYER 1: Pre-Trade Checks
├─ Before ANY execution
├─ if (slTpTriggeredRef.current || !isContinuousTradingRef.current)
└─ Return early if SL/TP already triggered

LAYER 2-4: Per-Mode Pre-Execution (Before Promise.all)
├─ executeO5U4Trade() - line ~2850
├─ executeMatchesTrades() - line ~1920
├─ executeDigitOverTrade() - line ~2580
└─ All check same conditions

LAYER 5-8: Post-Execution, Pre-Tracking (After Promise.all)
├─ After API returns but BEFORE contracts tracked
├─ Critical checkpoint: SL/TP could trigger during API call
├─ executeO5U4Trade() - line ~2890
├─ executeMatchesTrades() - line ~1960
├─ executeDigitOverTrade() - line ~2623
└─ executeDigitDifferTrade() - line ~2428

Layer check:
```typescript
if (slTpTriggeredRef.current || !isContinuousTradingRef.current) {
    console.log('🚫 Contracts purchased but not tracked - SL/TP triggered');
    setIsTradeInProgress(false);
    return; // ✅ Don't track contracts!
}
```

LAYER 9-10: State Flag Management
├─ slTpTriggeredRef.current (atomic, once true = stays true)
├─ isContinuousTradingRef.current (false = stop all trading)
└─ Both prevent race conditions

LAYER 11: Continuous Monitoring
├─ checkStopLossAndTakeProfit() called every 500ms
├─ Evaluates: cumulative profit vs SL/TP thresholds
├─ On trigger:
│  ├─ Set slTpTriggeredRef.current = true
│  ├─ Set isContinuousTradingRef.current = false
│  ├─ Clear all trading intervals
│  └─ Show notification to user
└─ Prevents any new trades starting

LAYER 12: Contract Monitoring
├─ As contracts close, profit updated
├─ cumulativeProfitRef updated in real-time
└─ SL/TP evaluated against running total

LAYER 13: UI State Sync
├─ setCumulativeProfit() updates UI
├─ stopLossTriggered/takeProfitTriggered set
├─ User sees immediately
└─ Can still close trades manually
```

### Why 13 Layers?

**The Problem:** Race conditions between:
- API calls (asynchronous)
- Multiple simultaneous trades (Promise.all)
- SL/TP checks (interval-based)
- Contract completion (event-based)

**The Solution:** Multi-point validation ensures:
1. **No trade starts after SL/TP** (Layer 1-4)
2. **No trade tracked if SL/TP during API** (Layer 5-8)
3. **No race condition from simultaneous trades** (Refs are atomic)
4. **Real-time monitoring** (Layer 11-12)
5. **User always sees current state** (Layer 13)

---

## 📊 Purchase.js - The Core Trade Engine

### Class Structure
**File:** [src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js](src/external/bot-skeleton/services/tradeEngine/trade/Purchase.js)

### Key Methods

#### 1. `purchase(contract_type, trade_each_tick = false, barrier, second_barrier, prediction, growth_rate, take_profit)`

**Purpose:** Main entry point for all trades

**Logic:**
```javascript
async purchase(contract_type, trade_each_tick = false, ...) {
    // Validate scope is BEFORE_PURCHASE
    if (currentScope !== BEFORE_PURCHASE) return {skipped: true};
    
    // Check if another purchase in progress
    if (!this.tickTradeEnabled && botState.purchaseInProgress) 
        return {skipped: true};
    
    // Store barrier values for later use
    this.currentBarrier = barrier;
    this.currentSecondBarrier = second_barrier;
    this.currentPrediction = prediction;
    
    // Route to appropriate mode
    if (trade_each_tick === true || trade_each_tick === 'true') {
        if (this.tickTradeEnabled) {
            // Already enabled - just execute (condition re-evaluation)
            return await this.executeSingleTrade(contract_type);
        } else {
            // First time - enable listener
            return await this.enableTickTrading(contract_type);
        }
    } else {
        // Normal mode
        await this.disableTickTrading();
        return await this.executeSingleTrade(contract_type);
    }
}
```

**Key Decisions:**
- ✅ Tick trading reuses listener (no duplicates)
- ✅ Normal mode disables any active tick trading
- ✅ Each mode stores its own barrier/prediction values

---

#### 2. `enableTickTrading(contract_type)`

**Purpose:** Set up continuous tick-based trading

**Flow:**
```javascript
async enableTickTrading(contract_type) {
    this.tickTradeEnabled = true;
    this.tickTradeContract = contract_type;
    
    // Set up tick listener
    const tickCallback = () => {
        // CRITICAL: Re-evaluate conditions every tick
        if (window.BinaryBotPrivateBeforePurchase) {
            window.BinaryBotPrivateBeforePurchase();
            
            // After trade, wait for completion
            this.waitForContractCompletion().then(() => {
                // Run after-purchase logic
                if (window.BinaryBotPrivateAfterPurchase) {
                    const shouldContinue = window.BinaryBotPrivateAfterPurchase();
                    if (shouldContinue === false) {
                        // User said "Trade Again = No"
                        this.disableTickTrading();
                    }
                }
            });
        }
    };
    
    // Register listener
    this.tickTradeListenerKey = await ticksService.monitor({
        symbol: this.tradeOptions.symbol,
        callback: tickCallback
    });
    
    // Execute first trade immediately
    return this.executeSingleTrade(contract_type);
}
```

**Critical Features:**
- ✅ Each tick re-evaluates conditions via `BinaryBotPrivateBeforePurchase()`
- ✅ Waits for contract completion before next tick
- ✅ Respects "Trade Again" restart conditions
- ✅ Automatic cleanup on stop

---

#### 3. `executeSingleTrade(contract_type)`

**Purpose:** Execute one actual trade (used by both normal and tick modes)

**Complexity Areas:**

**A. Trade All Markets (Random Symbol Selection)**
```javascript
if (this.tradeOptions.tradeAllMarkets) {
    const everyXRuns = this.tradeOptions.everyXRuns || 1;
    const runCount = this.$scope?.tradeAllMarketsRunCount || 0;
    
    // Pick new symbol every X runs
    if (runCount % everyXRuns === 0) {
        this.currentRandomSymbol = this.getRandomAvailableSymbol();
    }
    
    enhancedTradeOptions.symbol = this.currentRandomSymbol;
}
```

**Why Complex:**
- Rotates through different volatility indices
- Tracks run count to know when to pick new symbol
- Sticks with one symbol for X runs for consistency
- Available symbols: R_10, R_25, R_50, R_75, R_100, RDBEAR, RDBULL, 1HZ10V-100V

---

**B. Barrier Handling by Contract Type**
```
DIGITEVEN / DIGITODD
├─ NO barriers (auto-calculated)
└─ Barriers completely cleared

CALL / PUT / DIGITOVER / DIGITUNDER / DIGITMATCH / DIGITDIFF
├─ Barrier must be integer 0-9
├─ Stored in barrierOffset
└─ Example: Barrier=5 for DIGITOVER

ACCU (Accumulator)
├─ Uses growth_rate and take_profit
├─ limit_order format
└─ Completely different structure

OTHERS
└─ Generic barrier handling
```

**Code Example:**
```javascript
if (['DIGITEVEN', 'DIGITODD'].includes(contract_type)) {
    // Remove all barriers
    delete enhancedTradeOptions.barrier;
    delete enhancedTradeOptions.prediction;
} else if (['CALL', 'PUT'].includes(contract_type)) {
    // For digit contracts, barrier is 0-9
    const intBarrier = Math.round(barrierValue);
    if (intBarrier >= 0 && intBarrier <= 9) {
        enhancedTradeOptions.barrierOffset = intBarrier;
    }
}
```

---

**C. Building the Trade Object**
```javascript
const enhancedTradeOptions = {
    // Core
    symbol: selectedSymbol,
    amount: stake,
    currency: 'USD',
    basis: 'stake',
    
    // Duration
    duration: ticksOrTime,
    duration_unit: 't', // ticks, 's', 'm', 'h'
    
    // Contract specific
    contract_type: contract_type,
    barrierOffset: barrier, // if applicable
    secondBarrierOffset: second_barrier, // if applicable
    prediction: prediction, // for DIGITOVER/UNDER/MATCH/DIFF
    growth_rate: growth_rate, // for ACCU
    
    // From TradingHub
    martingale: multiplier, // for martingale scaling
    
    // Tracking
    tradeAllMarkets: boolean,
    everyXRuns: integer,
};
```

---

**D. API Call & Response Handling**
```javascript
const buyRequest = {
    buy: proposal.id,
    price: stake
};

// doUntilDone = retry wrapper with exponential backoff
const result = await doUntilDone(
    () => api_base.api.send(buyRequest),
    [],
    api_base
);

if (result.buy?.contract_id) {
    console.log('Trade executed:', result.buy.contract_id);
    // Trade successful - contract tracked
} else {
    console.error('No contract ID in response');
    // Trade failed
}
```

---

#### 4. `waitForContractCompletion()`

**Purpose:** Block until current contract closes

**Used By:** Tick trading to respect "Trade Again" conditions

**Logic:**
```javascript
async waitForContractCompletion() {
    return new Promise((resolve) => {
        // Check every 100ms if contract completed
        const checkInterval = setInterval(() => {
            const botState = this.store.getState();
            if (!botState.purchaseInProgress) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
        
        // Timeout after 30 seconds (safety)
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve(); // Continue anyway
        }, 30000);
    });
}
```

---

#### 5. `disableTickTrading()`

**Purpose:** Stop the tick listener and reset state

**Called When:**
- User stops bot
- "Trade Again = No" condition hit
- Switching to normal mode
- Trade halted by SL/TP

**Logic:**
```javascript
async disableTickTrading() {
    if (this.tickTradeListenerKey) {
        // Stop listening for ticks
        await ticksService.stopMonitor({
            symbol: this.tradeOptions.symbol,
            key: this.tickTradeListenerKey
        });
    }
    
    // Reset state
    this.tickTradeListenerKey = null;
    this.tickTradeEnabled = false;
    this.tickTradeContract = null;
}
```

---

## 🌊 Tick Listener Mechanism

### How Ticks Work

**Tick Definition:** A single price update for a symbol (updates several times per second)

**Tick Listener Registration:**
```javascript
ticksService.monitor({
    symbol: 'R_100',  // Which volatility to monitor
    callback: (ticks) => {
        // Called each time new tick received
        console.log('New tick price:', ticks[0].quote);
    }
});
// Returns: listenerKey (used for unregistering)
```

**Why Ticks Matter:**
- Per-tick trading = much faster execution
- Allows responsive strategy adjustments
- Can trade dozens of times per second vs 1x per minute
- Essential for analysis blocks (digit comparisons, patterns, etc.)

---

## 📈 State Management

### TradingHubDisplay State References
```typescript
// Trading modes (boolean flags)
isAutoDifferActive          // Digit Differ mode
isAutoOverUnderActive       // Over/Under mode
isAutoO5U4Active            // O5U4 mode
isAutoMatchesActive         // Matches mode

// Trade parameters
stake                       // Current trade amount
martingale                  // Loss multiplier (e.g., 2x)
currentBarrier              // For manual barrier trades
currentSymbol               // Selected symbol
currentStrategy             // Strategy type

// Risk management
cumulativeProfitRef         // Running P&L
stopLossAmountRef           // SL threshold
takeProfitAmountRef         // TP threshold
slTpTriggeredRef            // Has SL/TP hit? (atomic)
isContinuousTradingRef      // Should continue trading?

// Trade tracking
isTradeInProgress           // Currently executing trade?
activeContractRef           // Current contract ID
activeContractId            // UI display
o5u4ActiveContracts         // O5U4: both contracts
matchesActiveContracts      // Matches: all digit contracts

// Analysis
isAnalysisReady             // Market analyzer ready?
marketStats                 // Current analysis data
recommendation              // Recommended trade
analysisCount               // How many analyses done
```

---

## 🔄 Complete Trade Lifecycle Example

### Scenario: Conditional Logic with Tick Trading

**Bot Definition:**
```
IF (even percentage > 80%)
  THEN Purchase [DIGITOVER ▼] Barrier [5] trade each tick [YES ▼]
ELSE IF (even percentage > 60%)
  THEN Purchase [DIGITUNDER ▼] Barrier [4] trade each tick [YES ▼]
ELSE
  Purchase [DIGITEVEN ▼] trade each tick [YES ▼]
```

**Execution:**

```
TICK 1 (Even % = 85%):
├─ BinaryBotPrivateBeforePurchase() called
├─ Condition 1 evaluates: 85% > 80% ✅ TRUE
├─ Purchase.purchase('DIGITOVER', true, barrier=5)
│  ├─ tickTradeEnabled? NO
│  └─ enableTickTrading('DIGITOVER')
│     ├─ Set tickTradeEnabled = true
│     ├─ Register tick listener for 'R_100'
│     ├─ executeSingleTrade('DIGITOVER')
│     │  ├─ Apply barrier = 5
│     │  ├─ Build trade object
│     │  ├─ Send buy request via API
│     │  └─ Return contract ID #123
│     └─ Return
├─ Condition 2 and 3 NOT evaluated (already executed)
├─ waitForContractCompletion()
│  └─ Monitor purchaseInProgress flag
│     └─ When contract closes → resolve
├─ BinaryBotPrivateAfterPurchase() called
│  ├─ Check "Trade Again" blocks
│  ├─ Update martingale if lost
│  └─ Return true (continue trading)
└─ Waiting for next tick...

TICK 2 (Even % = 65%):
├─ BinaryBotPrivateBeforePurchase() called ✅
│  └─ Called AGAIN! (first trade still executing)
├─ Condition 1: 65% > 80%? ❌ FALSE
├─ Condition 2: 65% > 60%? ✅ TRUE
├─ Purchase.purchase('DIGITUNDER', true, barrier=4)
│  ├─ tickTradeEnabled? YES (already enabled)
│  └─ executeSingleTrade('DIGITUNDER')  ← Different contract!
│     ├─ Apply barrier = 4
│     ├─ Send buy request
│     └─ Return contract ID #124
├─ Condition 3 NOT evaluated
├─ waitForContractCompletion()
├─ BinaryBotPrivateAfterPurchase()
│  └─ Return true (continue)
└─ Waiting for next tick...

TICK 3 (Even % = 55%):
├─ BinaryBotPrivateBeforePurchase() called ✅
├─ Condition 1: 55% > 80%? ❌ FALSE
├─ Condition 2: 55% > 60%? ❌ FALSE
├─ Condition 3: (else) ✅ TRUE
├─ Purchase.purchase('DIGITEVEN', true)
│  └─ executeSingleTrade('DIGITEVEN')
│     ├─ No barrier needed (auto-calculated)
│     └─ Return contract ID #125
├─ BinaryBotPrivateAfterPurchase()
│  └─ Return false (stop trading)
└─ disableTickTrading()
   ├─ Stop tick listener
   ├─ tickTradeEnabled = false
   └─ Bot waits for next manual trigger

RESULT:
✅ All 3 purchases executed (each with different parameters)
✅ Conditions re-evaluated every tick
✅ Correct barriers applied to each
✅ Trading stopped when Trade Again = false
```

---

## 🐛 Common Issues & How They're Handled

### Issue 1: Barriers Not Applied
**Cause:** DIGITEVEN/DIGITODD don't support barriers

**Solution:**
```javascript
if (['DIGITEVEN', 'DIGITODD'].includes(contract_type)) {
    delete enhancedTradeOptions.barrier;
    console.log('Barrier cleared for', contract_type);
}
```

---

### Issue 2: SL/TP Race Condition
**Cause:** SL/TP triggers while trades executing via Promise.all

**Solution:** Layer 5-8 checks post-execution
```javascript
const results = await Promise.all(trades); // API returns

// Check AGAIN after API completes
if (slTpTriggeredRef.current || !isContinuousTradingRef.current) {
    return; // Don't track contracts
}

// Only now add to tracking
addContractsToUI(results);
```

---

### Issue 3: Duplicate Tick Listeners
**Cause:** purchase() called multiple times with trade_each_tick=true

**Solution:** Smart enableTickTrading check
```javascript
if (trade_each_tick === true) {
    if (this.tickTradeEnabled) {
        // Already listening - just execute
        return await this.executeSingleTrade(contract_type);
    } else {
        // First time - set up listener
        return await this.enableTickTrading(contract_type);
    }
}
```

---

### Issue 4: Conditions Never Re-evaluated in Tick Mode
**Cause:** Old code executed tick trade directly without checking conditions

**Solution:** Call BinaryBotPrivateBeforePurchase on each tick
```javascript
const tickCallback = () => {
    if (window.BinaryBotPrivateBeforePurchase) {
        window.BinaryBotPrivateBeforePurchase(); // ✅ Re-evaluate!
    }
};
```

---

## 📊 Data Flow Diagram

```
User Action
    │
    ▼
TradingHubDisplay.executeO5U4Trade()
    │
    ├─ checkStopLossAndTakeProfit() ◄─── Layer 1: Pre-check
    │
    ├─ isTradeInProgress? return if yes
    │
    ├─ checkO5U4Conditions()
    │    ├─ Analyze market
    │    └─ Determine barriers (e.g., 5 and 4)
    │
    ├─ checkStopLossAndTakeProfit() ◄─── Layer 2-4: Pre-execution
    │
    ├─ Create 2 Buy Proposals
    │    ├─ DIGITOVER with barrier 5
    │    └─ DIGITUNDER with barrier 4
    │
    ├─ Send Both via Promise.all()
    │    ├─ Buy 1 (API call async)
    │    └─ Buy 2 (API call async)
    │    
    ├─ Wait for both to return
    │
    ├─ checkStopLossAndTakeProfit() ◄─── Layer 5-8: Post-API
    │
    ├─ If SL/TP triggered → return (don't track)
    │
    ├─ Add to matchesActiveContracts[] ◄─ Layer 9: Tracking
    │
    ├─ Emit contract.purchase_received events
    │
    └─ Monitor for contract completion
         │
         ├─ Every tick update, recalculate P&L
         ├─ checkStopLossAndTakeProfit() ◄─ Layer 11-13
         │    │
         │    └─ When threshold hit:
         │        ├─ Set slTpTriggeredRef = true
         │        └─ Halt all new trades
         │
         └─ Contract expires → Remove from active
```

---

## 🎛️ Configuration & Customization

### Via TradingHubDisplay Props
- Stake amount
- Martingale multiplier
- Stop Loss threshold
- Take Profit threshold
- Symbol selection (single or Trade All Markets)
- Barrier values (for manual trades)

### Via Purchase.js Constants
```javascript
initialStake: null,           // Scaled by martingale
currentRandomSymbol: null,    // Rotated per X runs
tickTradeEnabled: false,      // Toggled by mode
```

### Via Market Analyzer (O5U4/Matches/etc.)
```javascript
marketAnalyzer.getLatestRecommendation()
    ├─ symbol: recommended market
    ├─ strategy: 'over' | 'under' | etc.
    ├─ barrier: recommended barrier
    └─ ...analysis data
```

---

## ✅ Summary

The trading hub is a **multi-layered, defensive system** that:

1. **Supports 4+ trading modes** with different execution strategies
2. **Handles tick-based conditions** with per-tick re-evaluation
3. **Protects via 13-layer SL/TP checks** against race conditions
4. **Manages complex state** including martingale, barriers, predictions
5. **Tracks multiple simultaneous trades** (O5U4, Matches, etc.)
6. **Respects user restart conditions** ("Trade Again" blocks)
7. **Implements retry logic** via doUntilDone wrapper
8. **Provides comprehensive logging** for debugging

**Key Innovation:** Tick trading with condition re-evaluation allows conditional logic to execute different trades on different ticks, adapting to market changes in real-time.
