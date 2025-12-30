# Current Candle Test Summary

This document explains the current candle logging and test case implementation.

---

## Changes Made

### 1. Updated `useAdvancedCrashGame` Hook
**File**: `/client/src/hooks/useAdvancedCrashGame.ts`

**Changes**:
- ✅ Added `currentCandle` to return type interface
- ✅ Added `currentCandle` state variable
- ✅ Added detailed logging for current candle updates
- ✅ Updated message handlers to track `currentCandle` from server
- ✅ Resets `currentCandle` on game start/end

**Key Logs Added**:
```typescript
// Game start
console.log('🎮 [useAdvancedCrashGame] Game start:', message.data.gameId);

// Current candle update (every price update)
console.log('📊 [useAdvancedCrashGame] Current candle:', {
  open: message.data.currentCandle.open,
  close: message.data.currentCandle.close,
  max: message.data.currentCandle.max,
  min: message.data.currentCandle.min,
  valueListLength: message.data.currentCandle.valueList?.length || 0,
  isComplete: message.data.currentCandle.isComplete,
  durationMs: message.data.currentCandle.durationMs,
  valueList: message.data.currentCandle.valueList,
});

// Game end
console.log('💥 [useAdvancedCrashGame] Game end:', {
  peakMultiplier: message.data.peakMultiplier,
  rugged: message.data.rugged,
  totalTicks: message.data.totalTicks,
});
```

---

### 2. Updated `CandlestickChartCanvas` Component
**File**: `/client/src/components/crash/CandlestickChartCanvas.tsx`

**Changes**:
- ✅ Added Y-axis range reset when game restarts
- ✅ Added Y-axis range reset when candles are cleared
- ✅ Added logging for Y-axis reset events

**Key Feature**:
When a new game starts, the Y-axis automatically resets from whatever expanded range it had (e.g., [0, 5]) back to the default [0.5, 1.5].

**Logs Added**:
```typescript
// Reset on game restart
console.log('🔄 [CandlestickChartCanvas] Game restarted - resetting Y-axis range');

// Reset on candles cleared
console.log('🔄 [CandlestickChartCanvas] Candles cleared - resetting Y-axis range');
```

---

### 3. Updated `LiveCandlestickChart` Component
**File**: `/client/src/components/trading/LiveCandlestickChart.tsx`

**Changes**:
- ✅ Uses `currentCandle` directly from hook instead of filtering
- ✅ Added logging for current candle updates
- ✅ More efficient: only filters `previousCandles` once

**Log Added**:
```typescript
console.log('🔍 [LiveCandlestickChart] Received currentCandle from hook:', {
  open: currentCandle.open,
  close: currentCandle.close,
  max: currentCandle.max,
  min: currentCandle.min,
  valueListLength: currentCandle.valueList?.length || 0,
  isComplete: currentCandle.isComplete,
});
```

---

### 4. Created `CurrentCandleTest` Component
**File**: `/client/src/components/crash/CurrentCandleTest.tsx`

**Purpose**: Comprehensive test case demonstrating current candle behavior

**Features**:
- Real-time display of current candle data
- OHLC values (Open, High, Low, Close)
- Value list preview (last 10 values)
- Update counter (tracks how many times current candle updates)
- Last update timestamp
- Visual indicators (green badge when current candle is active)
- Status display (connecting, countdown, running, crashed)
- Previous candle count
- Detailed console logging
- Test instructions

**UI Sections**:
1. **Header**: Status, game ID, candle counts
2. **Current Candle Data**: Live OHLC, value list length, completion status
3. **Value List Preview**: Shows last 10 values from valueList array
4. **Update Stats**: Number of updates and last update time
5. **Chart**: Full candlestick chart with current candle
6. **Instructions**: How to use the test case

---

### 5. Updated Demo Page
**File**: `/client/src/app/candlestick-demo/page.tsx`

**Changes**:
- ✅ Added `CurrentCandleTest` component at the top
- ✅ Highlighted with yellow border to draw attention
- ✅ Added clear description of what it tests

---

## What the Current Candle Contains

Based on the server's WebSocket message structure:

```typescript
interface CandleGroup {
  open: number;           // Opening price of the candle
  close?: number;         // Closing price (undefined while forming)
  max: number;            // Highest price reached
  min: number;            // Lowest price reached
  valueList: number[];    // Array of all price values in this candle
  startTime: number;      // Unix timestamp when candle started
  durationMs: number;     // Duration of the candle in milliseconds
  isComplete: boolean;    // false for current candle, true for completed
}
```

### Example Current Candle During Game:
```javascript
{
  open: 1.000,
  close: undefined,        // Not closed yet
  max: 1.523,              // Highest so far
  min: 0.998,              // Lowest so far
  valueList: [1.000, 1.012, 1.045, 1.098, 1.234, 1.456, 1.523],
  startTime: 1735392000000,
  durationMs: 1000,
  isComplete: false        // Still forming
}
```

### Key Observations:
1. **valueList grows**: Each price update adds to the array
2. **max/min adjust**: Updated as new highs/lows occur
3. **close is undefined**: Only set when candle completes
4. **isComplete is false**: Current candle is always incomplete

---

## How to Test

### 1. Start the Development Server
```bash
cd client
npm run dev
```

### 2. Open the Demo Page
Navigate to: `http://localhost:3000/candlestick-demo`

### 3. Open Browser Console
Press `F12` or `Ctrl+Shift+J` (Chrome/Edge) to open DevTools

### 4. Watch the Test Case
The test case is at the top with a yellow border.

### 5. What to Look For

**During Countdown (10s before game)**:
- Status: COUNTDOWN
- Current Candle: ✗ None
- Console: Game start log

**During Game (Active)**:
- Status: RUNNING
- Current Candle: ✓ Active (green badge)
- Console: Multiple current candle updates (~10-50 per second)
- Watch `valueListLength` grow (e.g., 1 → 5 → 10 → 25 → 50)
- Watch `max` increase as game progresses
- Watch `min` stay near 1.0 initially, may drop if game drops

**When Game Crashes**:
- Status: CRASHED
- Current Candle: ✗ None
- Console: Game end log
- Chart: "GAME OVER" text appears
- Chart: Rug drop animation (500ms)

**When New Game Starts**:
- Console: "🔄 Game restarted - resetting Y-axis range"
- Y-axis resets to [0.5, 1.5]
- Previous game's expanded range is cleared

---

## Console Log Examples

### Game Start
```
🎮 [useAdvancedCrashGame] Game start: 67890abc1234def5
```

### Current Candle Updates (during game)
```
📊 [useAdvancedCrashGame] Current candle: {
  open: 1,
  close: undefined,
  max: 1.234,
  min: 0.999,
  valueListLength: 15,
  isComplete: false,
  durationMs: 1000,
  valueList: [1, 1.01, 1.023, 1.045, ..., 1.234]
}

🔍 [LiveCandlestickChart] Received currentCandle from hook: {
  open: 1,
  close: undefined,
  max: 1.234,
  min: 0.999,
  valueListLength: 15,
  isComplete: false
}

📊 [CurrentCandleTest] Current candle update #23 {
  open: 1,
  close: undefined,
  max: 1.456,
  min: 0.998,
  valueList: [1, 1.01, ..., 1.456],
  valueListLength: 30,
  isComplete: false,
  durationMs: 1000,
  startTime: "10:30:15 AM"
}
```

### Game End
```
💥 [useAdvancedCrashGame] Game end: {
  peakMultiplier: 2.34,
  rugged: true,
  totalTicks: 234
}
```

### Y-Axis Reset
```
🔄 [CandlestickChartCanvas] Game restarted - resetting Y-axis range
```

---

## Visual Indicators in Test Component

### Status Colors
- 🟢 **Green**: RUNNING (game active)
- 🔴 **Red**: CRASHED (game ended)
- 🟡 **Yellow**: COUNTDOWN/CONNECTING

### Current Candle Badge
- ✓ Active (green) = Current candle exists
- ✗ None (gray) = No current candle

### OHLC Value Colors
- **White**: Open, Close
- **Green**: Max (high)
- **Red**: Min (low)
- **Blue**: Value List

### Data Sections
- **Gray background boxes**: Individual data points (open, close, max, min, etc.)
- **Dark background**: Value list preview
- **Yellow box**: Update statistics

---

## Expected Behavior Timeline

```
[Game Start]
  ↓
Status: COUNTDOWN (10s)
Current Candle: None
Console: 🎮 Game start
  ↓
[Countdown ends]
  ↓
Status: RUNNING
Current Candle: Active ✓
Console: 📊 Current candle updates start (10-50/sec)
  - valueList: [1.0]
  - valueList: [1.0, 1.01]
  - valueList: [1.0, 1.01, 1.02, ...]
  - max/min adjust continuously
  ↓
[Game Crashes or Reaches Peak]
  ↓
Status: CRASHED
Current Candle: None
Console: 💥 Game end
Chart: Rug animation + "GAME OVER"
  ↓
[New Game Starts]
  ↓
Console: 🔄 Y-axis reset
Y-axis: [expanded range] → [0.5, 1.5]
Status: COUNTDOWN
[Loop back to start]
```

---

## Data Flow Diagram

```
WebSocket Server (Go)
  │
  ├─ game_start message
  │    └─> useAdvancedCrashGame
  │          └─> setCurrentCandle(undefined)
  │          └─> console.log('🎮 Game start')
  │
  ├─ price_update message (10-50/sec)
  │    │  {
  │    │    currentCandle: {
  │    │      open, max, min, valueList, ...
  │    │    }
  │    │  }
  │    └─> useAdvancedCrashGame
  │          └─> setCurrentCandle(data.currentCandle)
  │          └─> console.log('📊 Current candle', ...)
  │                │
  │                ├─> LiveCandlestickChart
  │                │     └─> console.log('🔍 Received currentCandle')
  │                │
  │                └─> CurrentCandleTest
  │                      └─> console.log('📊 Current candle update #N')
  │                      └─> Update UI (OHLC, valueList, counter)
  │                      └─> CandlestickChartCanvas
  │                            └─> Render current candle
  │
  └─ game_end message
       └─> useAdvancedCrashGame
             └─> setCurrentCandle(undefined)
             └─> console.log('💥 Game end')
             └─> CandlestickChartCanvas
                   └─> Rug animation
                   └─> "GAME OVER" text
```

---

## Files Modified/Created

### Modified (3 files)
1. `/client/src/hooks/useAdvancedCrashGame.ts` - Added currentCandle tracking and logging
2. `/client/src/components/crash/CandlestickChartCanvas.tsx` - Added Y-axis reset
3. `/client/src/components/trading/LiveCandlestickChart.tsx` - Use currentCandle from hook

### Created (2 files)
4. `/client/src/components/crash/CurrentCandleTest.tsx` - Test case component
5. `/client/CURRENT_CANDLE_TEST_SUMMARY.md` - This documentation

### Updated (1 file)
6. `/client/src/app/candlestick-demo/page.tsx` - Added test case to demo

---

## Troubleshooting

### Issue: No current candle logs
**Solution**: Check WebSocket connection, ensure server is sending `currentCandle` in `price_update` messages

### Issue: valueList is empty
**Solution**: Server may not be populating valueList - check Go server code

### Issue: Y-axis doesn't reset
**Solution**: Check console for "🔄 Y-axis reset" log, ensure gameEnded prop changes from true to false

### Issue: Current candle not rendering
**Solution**:
1. Check that `currentCandle.isComplete === false`
2. Ensure `currentCandle` is passed to CandlestickChartCanvas
3. Check that `isHistoryMode === false`

---

## Next Steps

1. ✅ Test with live WebSocket connection
2. ✅ Verify logs appear in console
3. ✅ Watch current candle data update in UI
4. ✅ Confirm Y-axis resets on new game
5. ⬜ Add current candle visualization in advanced mode
6. ⬜ Add historical currentCandle replay feature
7. ⬜ Add current candle statistics (avg update rate, etc.)

---

**Created**: December 28, 2024
**Status**: Ready for testing
**Demo**: http://localhost:3000/candlestick-demo
