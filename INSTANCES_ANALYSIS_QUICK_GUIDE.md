# Multi-Instance Analysis Tool - Quick Guide

## 🎯 What is it?
A powerful tool that lets you analyze multiple volatility indices simultaneously with different tick counts. Perfect for finding patterns and trading opportunities across multiple markets at once!

## 🚀 How to Access
1. Click on **Analysis Tool** tab in the main navigation
2. Click the **"Instances"** button (4th button in the sub-navigation)
3. You'll see the Multi-Instance Analysis interface

## 📊 Interface Layout

```
┌─────────────────────────────────────────────────────┐
│  Multi-Instance Analysis Tool                       │
│  Analyze multiple volatility indices...             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Select Volatility ▼]  [Tick Count: 100]          │
│                         [50][100][200][500][1000]   │
│                         [+ Add Instance]            │
│                                                      │
│  Active: 2  Total: 3                                │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Volatility   │  │ Volatility   │  │ V100 (1s) │ │
│  │ 100          │  │ 75           │  │           │ │
│  │ 45/100 ticks │  │ 200/200      │  │ 0/50      │ │
│  │ [⏸] [✕]     │  │ [▶] [✕]      │  │ [⏸] [✕]  │ │
│  ├──────────────┤  ├──────────────┤  ├───────────┤ │
│  │ 0  1  2  3  4│  │ Digit Grid   │  │ Loading.. │ │
│  │ 5  6  7  8  9│  │              │  │           │ │
│  │              │  │              │  │           │ │
│  │ Even: 52.3% │  │ Even: 48.7%  │  │           │ │
│  │ Odd:  47.7% │  │ Odd:  51.3%  │  │           │ │
│  │              │  │              │  │           │ │
│  │ Recent:      │  │ Recent:      │  │           │ │
│  │ 7 2 4 8 3... │  │ 1 9 5 6 0... │  │           │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
```

## 🎮 Controls

### Adding an Instance
1. **Select Volatility**: Choose from dropdown (13 options available)
   - Volatility 10, 25, 50, 75, 100
   - V10, V15, V25, V30, V50, V75, V90, V100 (1-second)

2. **Set Tick Count**: 
   - Click preset buttons (50, 100, 200, 500, 1000)
   - OR type custom value (10-5000)

3. **Click "+ Add Instance"**: New analysis card appears!

### Managing Instances
- **⏸ Pause**: Stop analysis temporarily (data preserved)
- **▶ Resume**: Continue analysis from where you left off
- **✕ Remove**: Delete instance permanently

## 📈 Understanding the Analysis Cards

### Digit Grid (0-9)
Each digit shows:
- **Number**: The digit (0-9)
- **Percentage**: How often it appears

**Color Coding:**
- 🟢 **Green Border**: Highest frequency digit
- 🔴 **Red Border**: Lowest frequency digit
- 🔵 **Blue Glow**: Current digit (last tick)

### Parity Statistics
- **Even**: Percentage of even digits (0,2,4,6,8)
- **Odd**: Percentage of odd digits (1,3,5,7,9)

### Recent Digits
- Shows last 10 digits
- 🔵 Blue = Even
- 🟠 Orange = Odd

### Progress Counter
- Shows: `45/100 ticks` = Collected 45 out of 100 target ticks
- Once full, maintains last 100 ticks with real-time updates

## 💡 Usage Examples

### Example 1: Quick Pattern Check
**Goal**: Find which digit appears most in V100

**Setup:**
1. Select "Volatility 100"
2. Choose 100 ticks (quick analysis)
3. Add instance
4. Wait for data to load
5. Check which digit has green border (highest)

### Example 2: Multi-Timeframe Analysis
**Goal**: See short vs long-term patterns in V100

**Setup:**
1. Add instance: V100 with 50 ticks (short-term)
2. Add instance: V100 with 500 ticks (medium-term)
3. Add instance: V100 with 1000 ticks (long-term)
4. Compare digit distributions across timeframes

### Example 3: Cross-Market Comparison
**Goal**: Compare patterns across different volatilities

**Setup:**
1. Add instance: V75 with 200 ticks
2. Add instance: V100 with 200 ticks
3. Add instance: V50 with 200 ticks
4. Identify which market has strongest digit bias

### Example 4: Even/Odd Hunting
**Goal**: Find market with strongest even/odd bias

**Setup:**
1. Add 5 instances: V10, V25, V50, V75, V100 (all 100 ticks)
2. Monitor parity percentages
3. Find market with highest deviation from 50/50
4. Trade accordingly!

## 🔥 Pro Tips

1. **Start Small**: Begin with 100 ticks for quick insights
2. **Compare Timeframes**: Same market, different tick counts reveals trends
3. **Pause Unused**: Pause instances you're not watching to save bandwidth
4. **Multiple Markets**: Compare 3-5 markets simultaneously
5. **Pattern Recognition**: Watch Recent Digits for streak patterns
6. **Current Digit**: Blue glow helps you track live market movement
7. **Mobile Friendly**: Works great on phones (cards stack vertically)

## 🎨 Visual Indicators Quick Reference

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green Border | Highest frequency digit |
| 🔴 Red Border | Lowest frequency digit |
| 🔵 Blue Glow | Current digit (live) |
| 🔵 Blue Number | Even digit in recent list |
| 🟠 Orange Number | Odd digit in recent list |
| ⏸ Gray Card | Paused instance |
| ▶ Normal Card | Active instance |

## ⚙️ Technical Info

- **Data Source**: Binary.com WebSocket API
- **Update Speed**: Real-time (sub-second)
- **Tick History**: Maintains last N ticks per instance
- **Max Ticks**: 5000 per instance
- **Connections**: One WebSocket per instance
- **Memory**: Lightweight (only stores digits, not full tick data)

## ❓ Troubleshooting

**Instance shows "Loading tick data..."**
- Normal for first few seconds
- WebSocket is connecting and fetching history
- Should populate within 5 seconds

**No data appearing**
- Check internet connection
- Try removing and re-adding instance
- Refresh page if persists

**Card shows gray/paused**
- Click ▶ button to resume
- Or remove and create new instance

**Too many instances slow down browser**
- Pause unused instances
- Keep active instances under 10 for best performance
- Remove instances you don't need

## 🚦 Best Practices

✅ **DO:**
- Start with 2-3 instances and add more as needed
- Use presets (50, 100, 200, etc.) for standard analysis
- Pause instances when not monitoring them
- Compare same tick counts across different markets

❌ **DON'T:**
- Create 20+ instances at once (browser lag)
- Set tick count above 2000 unless needed (slower loading)
- Keep instances running if not using them
- Forget to remove old instances

## 📱 Mobile Usage

On mobile devices:
- Cards stack vertically (one per row)
- Touch controls work perfectly
- Swipe to scroll through instances
- All features fully functional

## 🎓 Learning Path

**Beginner:**
1. Create one instance with 100 ticks
2. Watch it populate and update
3. Understand the digit grid and percentages

**Intermediate:**
1. Create 2-3 instances with same tick count, different markets
2. Compare patterns between markets
3. Use findings for trading decisions

**Advanced:**
1. Multi-timeframe analysis (3-5 instances, same market)
2. Cross-market pattern hunting (5-10 instances)
3. Combine with other analysis tools for complete strategy

## 🎉 Have Fun Analyzing!

This tool is designed to give you deep market insights quickly. Experiment with different configurations, find patterns, and use the data to inform your trading decisions!

Happy Trading! 🚀📊💰
