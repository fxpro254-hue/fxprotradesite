# 🐛 Debug Guide: Tick Trading with Conditions

## The Critical Fix Applied

### What Was Broken
When tick trading was enabled with conditional logic, the `purchaseInProgress` check was **blocking subsequent purchases**:

```javascript
// OLD CODE (BROKEN):
if (botState.purchaseInProgress || this.pendingPurchase) {
    return Promise.resolve({ skipped: true, reason: 'Purchase already in progress' });
}
```

**Result:** 
- First condition executes ✅
- On next tick, conditions re-evaluate but purchase is BLOCKED ❌
- Only the first matching condition ever executes

### What's Fixed Now
```javascript
// NEW CODE (FIXED):
// Allow purchases to proceed during tick trading mode (for conditional logic re-evaluation)
if (!this.tickTradeEnabled && (botState.purchaseInProgress || this.pendingPurchase)) {
    return Promise.resolve({ skipped: true, reason: 'Purchase already in progress' });
}
```

**Result:**
- First condition executes ✅
- On next tick, conditions re-evaluate and new purchase ALLOWED ✅
- Different conditions can execute based on current market state ✅

## 📊 How to Verify It's Working

### Step 1: Open Browser Console
1. Right-click on your bot page → "Inspect" or press F12
2. Go to the "Console" tab
3. Clear any existing logs (trash icon)

### Step 2: Start Your Bot with Conditional Logic

Example setup:
```blockly
IF [even percentage > 70]
  THEN Purchase [DIGITEVEN] trade each tick [Yes]
ELSE IF [odd percentage > 70]
  THEN Purchase [DIGITODD] trade each tick [Yes]
ELSE
  Purchase [CALL] trade each tick [Yes]
```

### Step 3: Watch for These Log Patterns

#### ✅ Working Correctly - You Should See:

**On First Tick:**
```
🚀 Enabling tick trading mode for the first time
   Initial contract type: DIGITEVEN
📊 Tick received for tick trading
   Tick trading enabled: true
   Stored contract: DIGITEVEN
🔍 Re-evaluating purchase conditions on new tick...
✅ Calling BinaryBotPrivateBeforePurchase() to re-check conditions
```

**On Subsequent Ticks (Conditions Change):**
```
📊 Tick received for tick trading
🔍 Re-evaluating purchase conditions on new tick...
✅ Calling BinaryBotPrivateBeforePurchase() to re-check conditions
🔄 Tick trading already enabled - executing trade from condition evaluation
   Contract type from condition: DIGITODD  ← CHANGED!
   Previous contract: DIGITEVEN
```

**On Next Tick (Conditions Change Again):**
```
📊 Tick received for tick trading
🔍 Re-evaluating purchase conditions on new tick...
✅ Calling BinaryBotPrivateBeforePurchase() to re-check conditions
🔄 Tick trading already enabled - executing trade from condition evaluation
   Contract type from condition: CALL  ← CHANGED AGAIN!
   Previous contract: DIGITODD
```

#### ❌ Still Broken - You Would See:

```
📊 Tick received for tick trading
Purchase skipped - another purchase is already in progress  ← BAD!
```

This means the fix didn't apply correctly.

### Step 4: Check Your Conditions Are Being Evaluated

Add this to console while bot is running:
```javascript
// Test your condition manually
window.Bot.getEvenOddPercentage('Even', 10).then(percent => {
    console.log('Current Even %:', percent);
    if (percent > 70) console.log('✅ Should execute DIGITEVEN');
    else console.log('❌ Should NOT execute DIGITEVEN');
});
```

### Step 5: Verify Different Contracts Execute

Watch your **transaction history** - you should see:
- Different contract types appearing (DIGITEVEN, DIGITODD, CALL, etc.)
- Contract types changing based on your conditions
- Multiple trades per minute (on tick-based symbols)

## 🔍 Common Issues & Solutions

### Issue 1: "Purchase skipped - not in BEFORE_PURCHASE scope"

**Cause:** Bot is not running or in wrong state

**Solution:**
1. Make sure bot is started (green "Run" button)
2. Check bot hasn't stopped due to errors
3. Restart the bot

### Issue 2: "Purchase skipped - another purchase is already in progress"

**Cause:** The fix wasn't applied correctly or code was reverted

**Solution:**
1. Verify the Purchase.js file has the updated code
2. Clear browser cache and reload page
3. Check the line around line 61 in Purchase.js

### Issue 3: Same contract executes every tick

**Cause:** Conditions aren't changing OR not being re-evaluated

**Solution:**
1. Check console for "Re-evaluating purchase conditions" messages
2. Verify `BinaryBotPrivateBeforePurchase()` is being called
3. Test your conditions manually (see Step 4 above)
4. Make sure conditions can actually change (use analysis blocks that update)

### Issue 4: No purchases happening at all

**Cause:** All conditions evaluate to false

**Solution:**
1. Check your condition logic
2. Test each condition manually
3. Add an ELSE block with no conditions to catch all cases
4. Simplify conditions for testing (e.g., just `IF [true] THEN Purchase...`)

## 🧪 Test Cases

### Test 1: Simple Toggle
```blockly
IF [even percentage of last 5 > 50]
  THEN Purchase [DIGITEVEN] trade each tick [Yes]
ELSE
  Purchase [DIGITODD] trade each tick [Yes]
```

**Expected:** Should alternate between DIGITEVEN and DIGITODD as percentage crosses 50%

### Test 2: Three-Way Logic
```blockly
IF [even percentage > 70]
  THEN Purchase [DIGITEVEN] trade each tick [Yes]
ELSE IF [odd percentage > 70]
  THEN Purchase [DIGITODD] trade each tick [Yes]
ELSE
  Purchase [CALL] trade each tick [Yes]
```

**Expected:** Should use all three contract types at different times

### Test 3: Barrier Switching
```blockly
IF [digit comparison last 5 > 3]
  THEN Purchase [DIGITOVER] [7] trade each tick [Yes]
ELSE
  Purchase [DIGITOVER] [3] trade each tick [Yes]
```

**Expected:** Should switch between barrier 7 and barrier 3

## 📈 Performance Monitoring

Monitor these in console:

```javascript
// Count how many times conditions are evaluated
window.conditionEvalCount = 0;

// Wrap your condition evaluation (add to console)
const original = window.BinaryBotPrivateBeforePurchase;
window.BinaryBotPrivateBeforePurchase = function() {
    window.conditionEvalCount++;
    console.log(`Condition evaluation #${window.conditionEvalCount}`);
    return original();
};
```

After 10 ticks, check:
```javascript
console.log('Evaluations:', window.conditionEvalCount); // Should be 10+
```

## 🎯 Success Criteria

Your tick trading with conditions is working if:

1. ✅ Console shows "Re-evaluating purchase conditions" on EVERY tick
2. ✅ Console shows different contract types being executed
3. ✅ Transaction history shows variety of contract types
4. ✅ No "Purchase skipped - already in progress" messages during tick trading
5. ✅ Bot responds to changing market conditions in real-time

## 🆘 Still Not Working?

If you've verified all of the above and it's still not working:

1. **Check Purchase.js Line ~61:**
   ```javascript
   if (!this.tickTradeEnabled && (botState.purchaseInProgress || this.pendingPurchase)) {
   ```
   Should have `!this.tickTradeEnabled &&` at the beginning

2. **Check Purchase.js Line ~127:**
   ```javascript
   window.BinaryBotPrivateBeforePurchase();
   ```
   Should be called in the tick callback

3. **Clear everything and restart:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard reload (Ctrl+F5)
   - Stop and restart bot
   - Close and reopen browser

4. **Share console logs** - Copy the full console output and we can diagnose further

---

**Remember:** Conditions are re-evaluated on EVERY tick, so make sure your conditions can actually change based on market data! 🚀
