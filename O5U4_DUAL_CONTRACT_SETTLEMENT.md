# O5U4 Dual Contract Settlement Logic

## Overview
Modified the O5U4 bot to only apply martingale when BOTH contracts (over 5 and under 4) are lost, not when just one contract is lost.

## Key Changes Made

### 1. Enhanced Contract Tracking
- Used the existing `o5u4ActiveContracts` ref to properly track both contracts
- Added contract IDs and results for both over 5 and under 4 trades
- Added `bothSettled` flag to ensure dual settlement logic runs only once

### 2. Modified executeO5U4Trade Function
- Added proper tracking of both contracts in `o5u4ActiveContracts.current`
- Added check to prevent new trades when O5U4 contracts are already active
- Both over 5 and under 4 contracts are now properly tracked from creation

### 3. Updated Contract Settlement Logic
- **Contract Update Interval**: Added special handling for O5U4 dual contracts
  - Checks both contracts separately via API calls
  - Updates results for each contract when settled
  - Only processes combined result when both contracts are settled
  - Applies martingale only if both contracts lose
  - Resets stake if at least one contract wins

- **Contract Settlement Handler**: Added O5U4-specific logic
  - Detects when O5U4 contracts are settled via event handler
  - Updates individual contract results
  - Processes combined result only when both are settled
  - Prevents interference with regular single-contract bots

### 4. Updated Trading Logic
- Modified immediate trade execution checks to include O5U4 contract state
- Updated trading interval skip logic to prevent new trades when O5U4 contracts are active
- Added O5U4 contract reset in stopTrading function

### 5. Martingale Application Rules
- **Previous Logic**: Martingale applied when any single contract lost
- **New Logic**: Martingale only applied when BOTH O5U4 contracts lose
- **Win Condition**: If either contract wins, stake is reset to initial value
- **Loss Condition**: Only if both contracts lose, martingale is applied

## Technical Implementation

### Contract State Management
```typescript
o5u4ActiveContracts.current = {
    over5ContractId: string | null,
    under4ContractId: string | null,
    over5Result: 'pending' | 'win' | 'loss' | null,
    under4Result: 'pending' | 'win' | 'loss' | null,
    bothSettled: boolean
}
```

### Settlement Decision Logic
```typescript
if (over5Won || under4Won) {
    // At least one contract won - reset stake
    manageStake('reset');
} else {
    // Both contracts lost - apply martingale
    manageStake('martingale');
}
```

## Benefits
1. **Correct Martingale Application**: Only applies when both contracts lose
2. **No Interference**: Doesn't affect other bot types (differ, over/under)
3. **Robust Tracking**: Prevents duplicate trades and ensures proper settlement
4. **Detailed Logging**: Clear console output for debugging and monitoring

## Testing Recommendations
1. Verify that O5U4 trades create two contracts (over 5 and under 4)
2. Test scenarios where one wins and one loses (should reset stake)
3. Test scenarios where both lose (should apply martingale)
4. Test scenarios where both win (should reset stake)
5. Ensure no interference with other bot types
6. Verify that new O5U4 trades don't start until previous contracts are settled
