# Instances Analysis - Technical Documentation

## Architecture Overview

### Component Hierarchy
```
main.tsx
  └── Analysis Tool Tab
      └── Instances Button
          └── InstancesAnalysis Component
              └── Instance Cards (dynamic)
                  ├── Digit Grid
                  ├── Parity Stats
                  └── Recent Digits
```

## Data Flow

```
User Action (Add Instance)
    ↓
Create AnalysisInstance Object
    ↓
Initialize WebSocket Connection
    ↓
Request Tick History (count: tickCount)
    ↓
WebSocket Returns Initial History
    ↓
Extract Last Digits from Prices
    ↓
Update Instance State
    ↓
Subscribe to Real-Time Ticks
    ↓
On Each New Tick:
    ↓
Extract Last Digit
    ↓
Add to History (maintain last N ticks)
    ↓
Recalculate Statistics
    ↓
Update UI (React re-render)
```

## Key Interfaces

### AnalysisInstance
```typescript
interface AnalysisInstance {
    id: string;                    // Unique identifier
    symbol: SymbolType;            // Volatility index
    tickCount: number;             // Target number of ticks
    tickHistory: number[];         // Array of last digits
    ws?: WebSocket;                // WebSocket connection
    isActive: boolean;             // Pause/resume state
}
```

### DigitStats
```typescript
interface DigitStats {
    digit: number;                 // 0-9
    count: number;                 // Occurrences
    percentage: number;            // Percentage of total
}
```

## State Management

### Component State
```typescript
// Array of all instances
const [instances, setInstances] = useState<AnalysisInstance[]>([]);

// Selected symbol for new instance
const [selectedSymbol, setSelectedSymbol] = useState<SymbolType>('R_10');

// Tick count for new instance
const [tickCount, setTickCount] = useState<number>(100);

// Auto-incrementing ID counter
const instanceIdCounter = useRef(0);
```

## Core Functions

### 1. Instance Management

#### addInstance()
```typescript
const addInstance = () => {
    // Create new instance object
    const newInstance: AnalysisInstance = {
        id: `instance-${instanceIdCounter.current++}`,
        symbol: selectedSymbol,
        tickCount: tickCount,
        tickHistory: [],
        isActive: true
    };

    // Create WebSocket connection
    const ws = createInstanceWebSocket(newInstance);
    newInstance.ws = ws;

    // Add to instances array
    setInstances(prev => [...prev, newInstance]);
};
```

#### removeInstance(instanceId)
```typescript
const removeInstance = (instanceId: string) => {
    setInstances(prev => {
        // Find instance and close WebSocket
        const instance = prev.find(inst => inst.id === instanceId);
        if (instance?.ws) {
            instance.ws.close();
        }
        // Remove from array
        return prev.filter(inst => inst.id !== instanceId);
    });
};
```

#### toggleInstance(instanceId)
```typescript
const toggleInstance = (instanceId: string) => {
    setInstances(prev => prev.map(inst => {
        if (inst.id !== instanceId) return inst;

        if (inst.isActive && inst.ws) {
            // Pause: close WebSocket
            inst.ws.close();
        } else if (!inst.isActive) {
            // Resume: create new WebSocket
            const ws = createInstanceWebSocket(inst);
            return { ...inst, ws, isActive: true };
        }

        return { ...inst, isActive: !inst.isActive };
    }));
};
```

### 2. WebSocket Management

#### createInstanceWebSocket(instance)
```typescript
const createInstanceWebSocket = (instance: AnalysisInstance) => {
    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    ws.onopen = () => {
        // Request tick history
        ws.send(JSON.stringify({
            ticks_history: instance.symbol,
            count: instance.tickCount,
            end: 'latest',
            style: 'ticks',
            subscribe: 1
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.history) {
            // Initial history
            const digits = data.history.prices.map((price: number) => 
                getLastDigit(price)
            );
            updateInstanceTicks(instance.id, digits);
        } else if (data.tick) {
            // Real-time tick
            const digit = getLastDigit(data.tick.quote);
            updateInstanceTicks(instance.id, [digit], true);
        }
    };

    return ws;
};
```

### 3. Data Processing

#### getLastDigit(price)
```typescript
const getLastDigit = (price: number): number => {
    const priceStr = price.toString();
    const parts = priceStr.split('.');
    const decimals = parts[1] || '0';
    return Number(decimals.slice(-1));
};
```

#### calculateDigitStats(digits)
```typescript
const calculateDigitStats = (digits: number[]): DigitStats[] => {
    if (digits.length === 0) return [];

    // Count occurrences of each digit (0-9)
    const counts = Array(10).fill(0);
    digits.forEach(digit => counts[digit]++);

    // Calculate percentages
    return counts.map((count, digit) => ({
        digit,
        count,
        percentage: (count / digits.length) * 100
    }));
};
```

#### calculateParity(digits)
```typescript
const calculateParity = (digits: number[]): { even: number; odd: number } => {
    if (digits.length === 0) return { even: 0, odd: 0 };

    const evenCount = digits.filter(d => d % 2 === 0).length;
    return {
        even: (evenCount / digits.length) * 100,
        odd: ((digits.length - evenCount) / digits.length) * 100
    };
};
```

### 4. UI Rendering

#### renderInstanceCard(instance)
```typescript
const renderInstanceCard = (instance: AnalysisInstance) => {
    // Calculate statistics
    const digitStats = calculateDigitStats(instance.tickHistory);
    const parity = calculateParity(instance.tickHistory);
    const maxStat = Math.max(...digitStats.map(s => s.percentage));
    const minStat = Math.min(...digitStats.map(s => s.percentage));
    const currentDigit = instance.tickHistory[instance.tickHistory.length - 1];

    return (
        <div className="instance-card">
            {/* Header with title and controls */}
            {/* Digit grid with color coding */}
            {/* Parity statistics */}
            {/* Recent digits display */}
        </div>
    );
};
```

## CSS Architecture

### BEM Naming Convention
```scss
.instances-analysis              // Block
  &__header                      // Element
  &__controls                    // Element
  &__grid                        // Element

.instance-card                   // Block
  &__header                      // Element
  &__actions                     // Element
  &__digits                      // Element
  &--paused                      // Modifier

.digit-stat                      // Block
  &__number                      // Element
  &__percentage                  // Element
  &.highest                      // State
  &.lowest                       // State
  &.current                      // State
```

### Theme Variables Used
```scss
--general-main-1                 // Main background
--general-section-1              // Section background
--general-section-2              // Border color
--text-general                   // Primary text
--text-less-prominent            // Secondary text
--brand-red-coral                // Primary action color
--status-success                 // Success state
--status-danger                  // Danger state
```

## Performance Considerations

### Optimization Strategies

1. **React.memo / observer**: Component wrapped with mobx observer
2. **WebSocket Per Instance**: Independent connections prevent interference
3. **Limited History**: Only stores last N digits (not full tick objects)
4. **Efficient Updates**: Array slicing for maintaining tick count
5. **Conditional Rendering**: Loading states prevent unnecessary renders

### Memory Management
```typescript
// Cleanup on unmount
useEffect(() => {
    return () => {
        instances.forEach(instance => {
            if (instance.ws) {
                instance.ws.close();
            }
        });
    };
}, []);
```

### Best Practices
- Maximum 10 active instances recommended
- Pause unused instances to reduce bandwidth
- Use reasonable tick counts (50-1000 for most cases)
- Close WebSockets properly on cleanup

## API Integration

### Binary.com WebSocket API

**Endpoint:**
```
wss://ws.binaryws.com/websockets/v3?app_id=1089
```

**Request Format (Initial History):**
```json
{
    "ticks_history": "R_100",
    "count": 100,
    "end": "latest",
    "style": "ticks",
    "subscribe": 1
}
```

**Response Format (History):**
```json
{
    "history": {
        "prices": [123.45, 123.46, 123.44, ...],
        "times": [1634567890, 1634567891, ...]
    }
}
```

**Response Format (Real-time Tick):**
```json
{
    "tick": {
        "quote": 123.47,
        "epoch": 1634567892,
        "symbol": "R_100"
    }
}
```

## Error Handling

### WebSocket Errors
```typescript
ws.onerror = (error) => {
    console.error(`WebSocket error for ${instance.symbol}:`, error);
    // UI shows error state
};

ws.onclose = () => {
    console.log(`WebSocket closed for ${instance.symbol}`);
    // Instance can be resumed manually
};
```

### Data Validation
```typescript
// Validate tick count input
onChange={(e) => setTickCount(Math.max(10, parseInt(e.target.value) || 100))}

// Ensure minimum 10, default 100
```

## Testing Strategy

### Unit Tests (Recommended)
```typescript
describe('getLastDigit', () => {
    it('extracts last digit correctly', () => {
        expect(getLastDigit(123.456)).toBe(6);
        expect(getLastDigit(100.00)).toBe(0);
    });
});

describe('calculateDigitStats', () => {
    it('calculates percentages correctly', () => {
        const digits = [1, 1, 2, 3, 1]; // 60% ones
        const stats = calculateDigitStats(digits);
        expect(stats[1].percentage).toBe(60);
    });
});
```

### Integration Tests
- WebSocket connection establishment
- Real-time tick updates
- Instance state management
- UI rendering with different data sets

### E2E Tests
- Add instance flow
- Pause/resume functionality
- Remove instance flow
- Multiple instances interaction

## Future Enhancements

### Planned Features
1. **Export Data**: CSV/JSON export functionality
2. **Pattern Alerts**: Notify on specific patterns
3. **Charts**: Trend visualization
4. **Saved Presets**: Save/load configurations
5. **Advanced Stats**: Mean, median, standard deviation
6. **Comparison View**: Side-by-side analysis

### Code Extensibility
The component is designed for easy extension:
- Add new symbol types to `SymbolType` union
- Extend `AnalysisInstance` interface for new features
- Add calculation functions alongside existing ones
- Styling is modular and extensible

## Dependencies

```json
{
    "react": "^18.x",
    "@deriv-com/ui": "latest",
    "mobx": "^6.x",
    "mobx-react-lite": "^3.x"
}
```

## File Locations

```
src/
├── components/
│   └── trading-hub/
│       ├── instances-analysis.tsx       // Main component (390 lines)
│       └── instances-analysis.scss      // Styling (350 lines)
└── pages/
    └── main/
        └── main.tsx                     // Integration point (modified)
```

## Conclusion

The Instances Analysis component provides a robust, scalable solution for multi-market analysis with excellent performance characteristics and user experience. The architecture supports future enhancements while maintaining simplicity and reliability.
