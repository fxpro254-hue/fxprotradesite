# 🌐 All Markets Feature Documentation

## 📋 Overview
The "All Markets" feature allows traders to diversify their trades across multiple symbols automatically without manually changing the symbol selection for each trade.

## 🎯 How It Works

### 1. **Symbol Selection**
When "All Markets" is selected in the trade parameters symbol dropdown, the bot will randomly choose from these 13 symbols:

#### Volatility Indices:
- **R_10** - Volatility 10 Index
- **R_25** - Volatility 25 Index  
- **R_50** - Volatility 50 Index
- **R_75** - Volatility 75 Index
- **R_100** - Volatility 100 Index

#### 1Hz Volatility Indices:
- **1HZ10V** - Volatility 10 (1s) Index
- **1HZ15V** - Volatility 15 (1s) Index
- **1HZ25V** - Volatility 25 (1s) Index
- **1HZ30V** - Volatility 30 (1s) Index
- **1HZ50V** - Volatility 50 (1s) Index
- **1HZ75V** - Volatility 75 (1s) Index
- **1HZ90V** - Volatility 90 (1s) Index
- **1HZ100V** - Volatility 100 (1s) Index

### 2. **Random Selection Process**
- Each time a trade is executed, a new random symbol is selected
- Equal probability for all 13 symbols
- No memory of previous selections (true randomness)

### 3. **Compatibility**
- ✅ Works with **all contract types** (Rise/Fall, Digits, Touch/No Touch, etc.)
- ✅ Works with **normal trading** mode
- ✅ Works with **tick trading** mode
- ✅ Works with **conditional strategies** (IF/ELSE blocks)
- ✅ Works with **all built-in strategies** (Martingale, D'Alembert, etc.)

## 🚀 Usage Examples

### Example 1: Basic Strategy
```blockly
Trade Definition:
  Market: [All Markets ▼]
  Trade Type: Rise/Fall
  Contract Type: Both

Purchase [Rise ▼] trade each tick [No ▼]
```
**Result**: Each trade will execute on a different random symbol

### Example 2: Tick Trading
```blockly
Purchase [Digit Even ▼] trade each tick [Yes ▼]
```
**Result**: Each tick will potentially trade on a different symbol

### Example 3: Conditional Strategy
```blockly
IF [analysis condition]
  THEN Purchase [Rise ▼] trade each tick [No ▼]
  ELSE Purchase [Fall ▼] trade each tick [No ▼]
```
**Result**: Both purchase blocks will use random symbols independently

## 🔧 Technical Implementation

### Frontend Changes
- Added "All Markets" option to symbol dropdown in `active-symbols.js`
- Option appears at the top of the symbol list for easy access

### Backend Changes
- Enhanced `Purchase.js` class to detect `ALL_MARKETS` symbol value
- Added random symbol selection logic in `getRandomAvailableSymbol()` method
- Updated both normal trading and tick trading modes

### Code Generation
The Blockly blocks generate the same JavaScript code:
```javascript
Bot.purchase('CALL', false); // Normal trading
Bot.purchase('DIGITEVEN', true); // Tick trading
```
The symbol randomization happens transparently in the backend.

## 🎲 Benefits

1. **Automatic Diversification**: Spreads risk across multiple markets
2. **No Manual Intervention**: Set once, trades everywhere
3. **Strategy Compatibility**: Works with any existing strategy
4. **Market Coverage**: Access to both regular and high-frequency volatility indices
5. **True Randomness**: Each trade is independent

## 📊 Statistics

- **Total Symbols**: 13 different markets
- **Selection Probability**: ~7.69% chance for each symbol per trade
- **Market Types**: 5 regular volatility + 8 high-frequency volatility indices
- **Fallback**: If any error occurs, defaults to R_100

## ⚠️ Important Notes

- Random selection occurs **per trade execution**, not per strategy run
- Tick trading mode selects a new symbol for each tick
- The feature is designed for synthetic indices (volatility markets)
- Logs show which symbol was selected for debugging purposes

## 🧪 Testing

Run the test file to verify functionality:
```bash
node test-all-markets-feature.js
```

This will simulate 10 random selections and show the distribution.