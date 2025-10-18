# Decimal Places Fix - Implementation Notes

## Issue Addressed
Previously, the last digit extraction was not accounting for the proper number of decimal places, which could cause digit 0 to be skipped when prices ended with trailing zeros (e.g., `123.450` would be treated as `123.45`).

## Solution

### 1. Dynamic Decimal Place Detection
Added a `detectDecimalPlaces()` function that analyzes the tick history to determine the maximum number of decimal places used by each volatility index:

```typescript
const detectDecimalPlaces = (prices: number[]): number => {
    if (prices.length === 0) return 2;
    
    const decimalCounts = prices.map(price => {
        const priceStr = price.toString();
        const decimalPart = priceStr.split('.')[1] || '';
        return decimalPart.length;
    });
    
    return Math.max(...decimalCounts, 2);
};
```

### 2. Proper Last Digit Extraction
Updated `getLastDigit()` to accept a `decimalPlaces` parameter and pad the decimal string with zeros to ensure the correct digit position is read:

```typescript
const getLastDigit = (price: number, decimalPlaces: number = 2): number => {
    const priceStr = price.toString();
    const parts = priceStr.split('.');
    let decimals = parts[1] || '';
    
    // Pad with zeros if needed to match decimal places
    while (decimals.length < decimalPlaces) {
        decimals += '0';
    }
    
    // Get the last digit at the specified decimal place
    return Number(decimals.charAt(decimalPlaces - 1));
};
```

### 3. Instance-Level Decimal Tracking
Added `decimalPlaces` property to `AnalysisInstance` interface:

```typescript
interface AnalysisInstance {
    id: string;
    symbol: SymbolType;
    tickCount: number;
    tickHistory: number[];
    ws?: WebSocket;
    isActive: boolean;
    decimalPlaces: number;  // NEW: Tracks decimal places for this instance
}
```

### 4. Persistent Decimal Places Reference
Used a `useRef` to maintain decimal places mapping across WebSocket messages, preventing stale closure issues:

```typescript
const instanceDecimalPlacesRef = useRef<Map<string, number>>(new Map());
```

This ref stores the detected decimal places for each instance ID, ensuring real-time tick updates use the correct decimal precision.

### 5. WebSocket Handler Updates
Modified the WebSocket message handler to:
- Detect decimal places from initial tick history
- Store decimal places in both state and ref
- Use stored decimal places for real-time tick updates
- Log detected decimal places for debugging

```typescript
if (data.history) {
    const decimalPlaces = detectDecimalPlaces(data.history.prices);
    instanceDecimalPlacesRef.current.set(instance.id, decimalPlaces);
    setInstances(prev => prev.map(inst => 
        inst.id === instance.id ? { ...inst, decimalPlaces } : inst
    ));
    const digits = data.history.prices.map((price: number) => 
        getLastDigit(price, decimalPlaces)
    );
    updateInstanceTicks(instance.id, digits);
}
```

## Examples

### Before Fix:
```
Price: 123.450 → Extracted as "45" → Last digit: 5 ❌
Price: 100.230 → Extracted as "23" → Last digit: 3 ❌
```

### After Fix:
```
Price: 123.450 (3 decimals) → Padded: "450" → Last digit: 0 ✅
Price: 100.230 (3 decimals) → Padded: "230" → Last digit: 0 ✅
Price: 456.7 (1 decimal)    → Padded: "700" → Last digit: 0 ✅
```

## Volatility Index Decimal Places

Different volatility indices may use different decimal precisions:

| Symbol | Typical Decimal Places |
|--------|----------------------|
| R_10   | 2-4 decimals        |
| R_25   | 2-4 decimals        |
| R_50   | 2-4 decimals        |
| R_75   | 2-4 decimals        |
| R_100  | 2-4 decimals        |
| 1HZ*V  | 2-4 decimals        |

The system now auto-detects and adapts to each symbol's actual decimal precision.

## Benefits

1. ✅ **Accurate Digit 0 Detection**: No more skipped zeros
2. ✅ **Symbol-Specific Precision**: Each volatility uses its own decimal places
3. ✅ **Dynamic Adaptation**: Automatically detects decimal places from data
4. ✅ **Consistent Analysis**: Same digit extraction logic for history and real-time
5. ✅ **No Assumptions**: Doesn't assume all symbols use 2 decimals

## Testing

To verify the fix:

1. Add an instance for any volatility (e.g., R_100)
2. Check console for: `"R_100 detected decimal places: X"`
3. Observe digit distribution - digit 0 should appear
4. Monitor recent digits display - zeros should be visible
5. Compare even/odd percentages - should include zeros in calculation

## Technical Notes

- Default decimal places is 2 (fallback)
- Detection happens once per instance on initial data load
- Real-time ticks use the detected decimal places
- Decimal places are stored in both state (for UI) and ref (for WebSocket closure)
- Instance removal cleans up the decimal places ref entry

## Cleanup

When an instance is removed, both the WebSocket connection and the decimal places mapping are properly cleaned up:

```typescript
instanceDecimalPlacesRef.current.delete(instanceId);
```

This prevents memory leaks from accumulating unused decimal place entries.
