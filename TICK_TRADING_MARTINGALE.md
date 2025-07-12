# Tick Trading Martingale Configuration

## 🎯 Overview
When using tick trading mode (`trade each tick: Yes`), the system includes built-in basic martingale functionality. You can also define custom martingale logic for more sophisticated strategies.

## 🛠️ Built-in Martingale Behavior

### Default Logic
- **On Loss**: Doubles the stake amount
- **On Win**: Resets stake to initial amount
- **Initial Stake**: Automatically stored when tick trading begins

### Example
```
Initial stake: $1.00
Trade 1: LOSS → Next stake: $2.00
Trade 2: LOSS → Next stake: $4.00  
Trade 3: WIN → Next stake: $1.00 (reset)
```

## 🎨 Custom Martingale Configuration

### Method 1: Global Function
Define a global function to override default behavior:

```javascript
// Add this to your bot's "Initialization" section or before purchase conditions
window.handleMartingaleForTickTrading = function(isWin, profit, tradeOptions) {
    if (isWin) {
        // Win logic: Reset to initial
        tradeOptions.amount = 1.00;
        console.log('WIN: Reset stake to $1.00');
    } else {
        // Loss logic: Custom progression
        if (tradeOptions.amount < 1.00) {
            tradeOptions.amount = 1.50;  // First loss
        } else if (tradeOptions.amount < 2.00) {
            tradeOptions.amount = 3.00;  // Second loss
        } else if (tradeOptions.amount < 5.00) {
            tradeOptions.amount = 7.00;  // Third loss
        } else {
            tradeOptions.amount = 1.00;  // Reset after big losses
        }
        console.log(`LOSS: New stake $${tradeOptions.amount}`);
    }
};
```

### Method 2: Advanced Martingale Strategies

#### Fibonacci Martingale
```javascript
window.handleMartingaleForTickTrading = function(isWin, profit, tradeOptions) {
    // Initialize Fibonacci sequence if not exists
    if (!window.fibSequence) {
        window.fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
        window.fibIndex = 0;
        window.initialStake = tradeOptions.amount;
    }
    
    if (isWin) {
        // Reset to beginning of sequence
        window.fibIndex = 0;
        tradeOptions.amount = window.initialStake;
    } else {
        // Move to next Fibonacci number
        if (window.fibIndex < window.fibSequence.length - 1) {
            window.fibIndex++;
        }
        tradeOptions.amount = window.initialStake * window.fibSequence[window.fibIndex];
    }
    
    console.log(`Fibonacci ${isWin ? 'WIN' : 'LOSS'}: Stake $${tradeOptions.amount}`);
};
```

#### Percentage-Based Martingale
```javascript
window.handleMartingaleForTickTrading = function(isWin, profit, tradeOptions) {
    const initialStake = window.tickTradingInitialStake || 1.00;
    const winMultiplier = 1.0;    // Keep same on win
    const lossMultiplier = 1.5;   // Increase by 50% on loss
    const maxStake = 50.00;       // Maximum stake limit
    
    if (isWin) {
        tradeOptions.amount = initialStake * winMultiplier;
    } else {
        const newAmount = tradeOptions.amount * lossMultiplier;
        tradeOptions.amount = Math.min(newAmount, maxStake);
    }
    
    console.log(`${isWin ? 'WIN' : 'LOSS'}: Stake $${tradeOptions.amount}`);
};
```

#### Profit-Target Martingale
```javascript
window.handleMartingaleForTickTrading = function(isWin, profit, tradeOptions) {
    // Initialize session tracking
    if (!window.tickTradingSession) {
        window.tickTradingSession = {
            totalProfit: 0,
            initialStake: tradeOptions.amount,
            targetProfit: 10.00,  // Stop when we reach $10 profit
            maxLoss: -20.00       // Stop when we lose $20
        };
    }
    
    const session = window.tickTradingSession;
    session.totalProfit += profit;
    
    console.log(`Session profit: $${session.totalProfit.toFixed(2)}`);
    
    // Check stop conditions
    if (session.totalProfit >= session.targetProfit) {
        console.log('🎯 Profit target reached! Disabling tick trading.');
        // You could disable tick trading here or reset
        tradeOptions.amount = session.initialStake;
        session.totalProfit = 0;
        return;
    }
    
    if (session.totalProfit <= session.maxLoss) {
        console.log('🛑 Maximum loss reached! Resetting stake.');
        tradeOptions.amount = session.initialStake;
        session.totalProfit = 0;
        return;
    }
    
    // Normal martingale logic
    if (isWin) {
        tradeOptions.amount = session.initialStake;
    } else {
        tradeOptions.amount *= 2;
    }
};
```

## 📊 Monitoring and Debugging

### Console Logging
All tick trading operations are logged to console:

```
Purchase called with contract_type: DIGITEVEN trade_each_tick: true
Enabling tick trading mode
Stored initial stake for tick trading: 1
Tick trade executed, waiting for completion...
Tick trade result: LOSS, Profit: -1
Martingale: Increasing stake from 1 to 2
```

### Custom Logging
Add your own logging to track performance:

```javascript
window.handleMartingaleForTickTrading = function(isWin, profit, tradeOptions) {
    // Your martingale logic here...
    
    // Custom logging
    const logEntry = {
        timestamp: new Date().toISOString(),
        result: isWin ? 'WIN' : 'LOSS',
        profit: profit,
        oldStake: tradeOptions.amount,
        newStake: newAmount
    };
    
    // Store in browser console or local storage
    console.table(logEntry);
    
    // Or store for later analysis
    const logs = JSON.parse(localStorage.getItem('tickTradingLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('tickTradingLogs', JSON.stringify(logs));
};
```

## ⚠️ Important Considerations

### Risk Management
- Always set maximum stake limits
- Consider session profit/loss limits
- Monitor account balance before increasing stakes
- Be aware of broker minimum/maximum stake requirements

### Performance Impact
- Custom functions run on every tick trade completion
- Keep logic simple and fast
- Avoid complex calculations or external API calls
- Consider using timeouts for very high-frequency trading

### Testing
- Always test with demo accounts first
- Start with small initial stakes
- Monitor for several sessions before going live
- Verify your custom logic works as expected

## 🔄 Reset Functions

### Reset Session Data
```javascript
// Clear all tick trading session data
delete window.tickTradingSession;
delete window.fibSequence;
delete window.fibIndex;
delete window.tickTradingInitialStake;

// Clear logs
localStorage.removeItem('tickTradingLogs');

console.log('Tick trading session data cleared');
```

### Emergency Stop
```javascript
// Disable custom martingale (will use default)
delete window.handleMartingaleForTickTrading;

console.log('Custom martingale disabled - using default logic');
```

This configuration system gives you full control over how stakes are managed during aggressive tick trading while maintaining the speed and efficiency needed for high-frequency strategies.
