# CandlestickChartCanvas Component Documentation

A high-performance candlestick chart component designed for real-time crash game visualization with WebSocket integration.

---

## Overview

The `CandlestickChartCanvas` component renders a professional trading-style candlestick chart with:
- Real-time price updates via WebSocket
- Dynamic Y-axis scaling
- Two modes: Live (real-time game) and History (past games)
- Smooth animations and game-over effects
- Automatic candle merging for history mode

---

## Installation & Usage

### Basic Import

```typescript
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';
import { CandlestickChartExample } from '@/components/crash/CandlestickChartExample';
```

### Quick Start (Live Mode)

```tsx
<CandlestickChartExample />
```

### Advanced Usage

```tsx
import { CandlestickChartCanvas, CandleGroup } from '@/components/crash/CandlestickChartCanvas';

function MyComponent() {
  const [previousCandles, setPreviousCandles] = useState<CandleGroup[]>([]);
  const [currentCandle, setCurrentCandle] = useState<CandleGroup | undefined>();
  const [currentPrice, setCurrentPrice] = useState(1.0);
  const [gameEnded, setGameEnded] = useState(false);

  // ... WebSocket logic to update state ...

  return (
    <div className="w-full h-96">
      <CandlestickChartCanvas
        previousCandles={previousCandles}
        currentCandle={currentCandle}
        currentPrice={currentPrice}
        gameEnded={gameEnded}
        isHistoryMode={false}
        historyMergeCount={20}
      />
    </div>
  );
}
```

---

## Props

### CandlestickChartCanvas

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `previousCandles` | `CandleGroup[]` | ✅ | - | Array of completed candles |
| `currentCandle` | `CandleGroup \| undefined` | ❌ | `undefined` | Currently forming candle (live mode) |
| `currentPrice` | `number` | ✅ | - | Current price/multiplier |
| `gameEnded` | `boolean` | ✅ | - | Whether game has ended |
| `isHistoryMode` | `boolean` | ❌ | `false` | Enable history mode (no live candle) |
| `historyMergeCount` | `number` | ❌ | `20` | Target candle count for history mode |

### CandlestickChartExample

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `wsUrl` | `string` | ❌ | `'ws://localhost:8080/ws'` | WebSocket server URL |
| `isHistoryMode` | `boolean` | ❌ | `false` | Enable history mode |
| `historyMergeCount` | `number` | ❌ | `20` | Target candle count |

---

## Data Structures

### CandleGroup Interface

```typescript
interface CandleGroup {
  open: number;           // Opening price
  close?: number;         // Closing price (undefined for incomplete)
  max: number;            // Highest price in candle
  min: number;            // Lowest price in candle
  valueList: number[];    // All price points (for incomplete candles)
  startTime: number;      // Unix timestamp (ms)
  durationMs: number;     // Candle duration in milliseconds
  isComplete: boolean;    // Whether candle is finalized
}
```

### WebSocket Message Format

```typescript
{
  type: 'price_update',
  data: {
    tick: number,
    price: number,
    multiplier: number,
    gameEnded: boolean,
    currentCandle?: CandleGroup,
    previousCandles: CandleGroup[]
  }
}
```

---

## Features

### 1. Dynamic Current Candle

The current candle updates in real-time as new prices arrive:

```typescript
// Current candle valueList grows: [1.0, 1.05, 1.08, 1.12]
// Max/min adjust automatically
// Color changes based on current price vs open
```

**Behavior**:
- Green if current price ≥ open
- Red if current price < open
- Wick extends to show full range (min to max)
- Body shows open to current close

### 2. Dynamic Y-Axis Range

**Initial Range**: 0.5 to 1.5 (1.0 centered)

**Auto-Expansion**:
- Triggers when price within 15% of edge
- Expands by 20% when triggered
- Never goes below 0

**Example**:
```
Initial:  [0.5 - 1.5]
Price hits 1.4 (within 15% of 1.5):
Expanded: [0.5 - 2.0]

Price hits 0.6 (within 15% of 0.5):
Expanded: [0.3 - 2.0]  (clamped to 0 minimum → [0.0 - 2.0])
```

### 3. Current Price Line

- **Style**: Horizontal dotted blue line (`#58a6ff`)
- **Spans**: Full chart width
- **Label**: Price displayed 10px above line
- **Updates**: Every render (smooth animation)

```
           2.45x ← Label (10px above)
    ━━━━━━━━━━━━━━━  ← Dotted line
```

### 4. Grid Lines

**Horizontal Lines**:
- 8 price levels evenly spaced
- Color: `#1a1e24` (subtle)
- Helps identify price levels

**Vertical Lines**:
- 10 time divisions
- Creates grid pattern

### 5. Game Over Effect

When `gameEnded = true`:

1. **Rug Drop Animation** (500ms):
   - Current price drops from current value to 0
   - Smooth interpolation over 500ms

2. **"GAME OVER" Text**:
   - Font: Bold 72px monospace
   - Color: `#aa1122`
   - Tilt: 10° counter-clockwise (left)
   - Opacity: 30% (appears behind candles)
   - Position: Center of canvas

```
     ╱ GAME OVER ╱  ← Tilted 10° left, semi-transparent
```

---

## Modes

### Live Mode (`isHistoryMode = false`)

**Purpose**: Real-time game visualization

**Displays**:
- ✅ Previous candles (completed)
- ✅ Current candle (updating live)
- ✅ Current price line
- ✅ Rug drop animation on game end
- ✅ "GAME OVER" text

**Use Case**: Active crash game

```tsx
<CandlestickChartCanvas
  previousCandles={prevCandles}
  currentCandle={liveCandle}
  currentPrice={2.45}
  gameEnded={false}
  isHistoryMode={false}
/>
```

### History Mode (`isHistoryMode = true`)

**Purpose**: Display past game results

**Displays**:
- ✅ Previous candles (merged to target count)
- ❌ No current candle
- ❌ No price line
- ❌ No rug animation
- ❌ No "GAME OVER" text

**Use Case**: Game history panel, analytics

```tsx
<CandlestickChartCanvas
  previousCandles={pastGameCandles}
  currentCandle={undefined}
  currentPrice={0}
  gameEnded={true}
  isHistoryMode={true}
  historyMergeCount={15}  // Show 15 candles
/>
```

### Candle Merging (History Mode)

When `previousCandles.length > historyMergeCount`, candles are merged:

**Algorithm**:
```typescript
// Merge pairs until count ≤ target
[C1, C2, C3, C4, C5, C6] → target 3
  ↓
[C1+C2, C3+C4, C5+C6]

Merged candle:
- open = first.open
- close = second.close
- max = Math.max(first.max, second.max)
- min = Math.min(first.min, second.min)
- durationMs = first.durationMs + second.durationMs
```

**Example**:
```
Input: 40 candles, target: 20
Round 1: 40 → 20 (merged pairs)
Output: 20 candles

Input: 50 candles, target: 20
Round 1: 50 → 25
Round 2: 25 → 13 (12 pairs + 1 odd)
Output: 13 candles (close to target)
```

---

## Performance Optimizations

### 1. Selective Re-rendering

```typescript
// Previous candles only re-render when:
// - Y-axis range changes
// - Merge count changes (history mode)
// - New candle completes

// Current candle re-renders every frame (60 FPS)
```

### 2. Canvas Optimization

- Uses `requestAnimationFrame` for smooth 60 FPS
- Only redraws when data changes
- Efficient value-to-pixel calculations

### 3. Data Efficiency

**Live Mode**:
- ~100ms update rate
- 20-25 previous candles typical
- Current candle updates only

**History Mode**:
- Merges to target count on mount
- Static rendering (no animation)

---

## Styling & Colors

### Candle Colors

```typescript
// Green (Bullish): close >= open
const greenColor = '#26a69a';

// Red (Bearish): close < open
const redColor = '#ef5350';
```

### UI Elements

```typescript
Background: '#0a0a0f'
Grid lines: '#1a1e24'
Y-axis text: '#8b949e'
Price line: '#58a6ff'
Game over: '#aa1122'
```

### Current Candle Glow

Active candle has subtle glow effect:
```typescript
ctx.globalAlpha = 0.3;
ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
```

---

## Examples

### Example 1: Live Game Chart

```tsx
import { CandlestickChartExample } from '@/components/crash/CandlestickChartExample';

export function LiveGame() {
  return (
    <div className="h-96 w-full">
      <CandlestickChartExample />
    </div>
  );
}
```

### Example 2: Game History Gallery

```tsx
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';

export function GameHistoryGallery({ games }: { games: PastGame[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {games.map((game) => (
        <div key={game.id} className="h-40 border rounded">
          <CandlestickChartCanvas
            previousCandles={game.candles}
            currentCandle={undefined}
            currentPrice={0}
            gameEnded={true}
            isHistoryMode={true}
            historyMergeCount={10}
          />
          <p className="text-center text-sm">
            Peak: {game.peakMultiplier.toFixed(2)}x
          </p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Custom WebSocket Integration

```tsx
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function CustomChart() {
  const { currentCrashGame } = useWebSocket();

  const data = currentCrashGame?.data || {};

  return (
    <div className="h-96">
      <CandlestickChartCanvas
        previousCandles={data.previousCandles || []}
        currentCandle={data.currentCandle}
        currentPrice={data.multiplier || 1.0}
        gameEnded={data.gameEnded || false}
      />
    </div>
  );
}
```

### Example 4: Side-by-Side Comparison

```tsx
export function Comparison() {
  return (
    <div className="grid grid-cols-2 gap-4 h-96">
      {/* Live game */}
      <div>
        <h3>Live</h3>
        <CandlestickChartExample isHistoryMode={false} />
      </div>

      {/* Historical data */}
      <div>
        <h3>History</h3>
        <CandlestickChartExample isHistoryMode={true} historyMergeCount={15} />
      </div>
    </div>
  );
}
```

---

## Troubleshooting

### Candles Not Updating

**Problem**: Candles appear frozen

**Solutions**:
1. Check WebSocket connection: `ws.readyState === WebSocket.OPEN`
2. Verify message format matches expected structure
3. Check console for errors in message parsing

### Y-Axis Not Expanding

**Problem**: Candles cut off at top/bottom

**Solutions**:
1. Ensure `currentPrice` is being updated
2. Check that candle `max`/`min` values are correct
3. Verify Y-range calculation logic

### Game Over Not Showing

**Problem**: "GAME OVER" text not appearing

**Solutions**:
1. Ensure `gameEnded = true` is set
2. Check `isHistoryMode = false` (game over only in live mode)
3. Wait 500ms for rug animation to complete

### Performance Issues

**Problem**: Choppy animation

**Solutions**:
1. Reduce number of candles (use merging)
2. Ensure canvas size is reasonable (<2000px)
3. Check if other animations are running simultaneously

---

## API Reference

### Functions

#### `getMergedCandles(candles, targetCount)`

Merges candles to target count.

**Parameters**:
- `candles`: `CandleGroup[]` - Input candles
- `targetCount`: `number` - Target candle count

**Returns**: `CandleGroup[]` - Merged candles

**Example**:
```typescript
const merged = getMergedCandles(allCandles, 20);
// 50 candles → ~20 candles
```

### Helper Functions

#### `valueToY(value)`

Converts price to Y-coordinate.

**Parameters**:
- `value`: `number` - Price value

**Returns**: `number` - Y pixel coordinate

---

## Integration with Existing System

### With `useAdvancedCrashGame` Hook

```tsx
import { useAdvancedCrashGame } from '@/hooks/useAdvancedCrashGame';
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';

export function IntegratedChart() {
  const { currentValue, groups, status } = useAdvancedCrashGame();

  // Split groups into previous and current
  const previousCandles = groups.filter(g => g.isComplete);
  const currentCandle = groups.find(g => !g.isComplete);

  return (
    <CandlestickChartCanvas
      previousCandles={previousCandles}
      currentCandle={currentCandle}
      currentPrice={currentValue}
      gameEnded={status === 'crashed'}
    />
  );
}
```

### With Game History

```tsx
import { useWebSocket } from '@/contexts/WebSocketContext';
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';

export function HistoryPanel() {
  const { crashHistory } = useWebSocket();

  return (
    <div className="grid grid-cols-5 gap-2">
      {crashHistory.slice(0, 10).map((game) => (
        <div key={game.gameId} className="h-32">
          <CandlestickChartCanvas
            previousCandles={game.candles}
            currentCandle={undefined}
            currentPrice={0}
            gameEnded={true}
            isHistoryMode={true}
            historyMergeCount={10}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## Future Enhancements

Potential improvements:

1. **Zoom/Pan**: Allow users to zoom into specific time ranges
2. **Tooltips**: Show exact OHLC values on hover
3. **Volume Bars**: Display bet volume below candles
4. **Indicators**: Add SMA, EMA, Bollinger Bands
5. **Custom Themes**: Support light/dark mode switching
6. **Export**: Save chart as image (PNG/SVG)

---

## Files

**Component**: `/client/src/components/crash/CandlestickChartCanvas.tsx`
**Example**: `/client/src/components/crash/CandlestickChartExample.tsx`
**Documentation**: `/client/CANDLESTICK_CHART_COMPONENT.md`

---

**Last Updated**: December 28, 2024
**Version**: 1.0
