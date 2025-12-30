# Candlestick Chart Components Usage Guide

This guide explains how to use the new candlestick chart components built on top of the `CandlestickChartCanvas` component.

---

## Components Overview

### 1. **LiveCandlestickChart** - Real-time Game Chart
Live trading chart with real-time updates for the current crash game.

**Location**: `/client/src/components/trading/LiveCandlestickChart.tsx`

**Features**:
- Real-time price updates
- Dynamic candle formation
- Game status indicators (countdown, connecting, playing, crashed)
- Current multiplier display
- Game ID badge
- Auto-expanding Y-axis
- Rug drop animation
- "GAME OVER" text on crash

**Usage**:
```tsx
import { LiveCandlestickChart } from '@/components/trading/LiveCandlestickChart';

export function TradingPage() {
  return (
    <div className="container">
      <LiveCandlestickChart />
    </div>
  );
}
```

**Props**: None (uses `useAdvancedCrashGame` hook internally)

---

### 2. **CandlestickGameHistory** - Game History Gallery
Displays a grid of historical games with mini candlestick charts.

**Location**: `/client/src/components/crash/CandlestickGameHistory.tsx`

**Features**:
- Grid layout (responsive: 2-5 columns)
- Mini candlestick charts for each game
- Peak multiplier display
- Rug indicator (💥)
- Game ID display
- Auto-merges candles to 10 per game
- Hover effects

**Usage**:
```tsx
import { CandlestickGameHistory } from '@/components/crash/CandlestickGameHistory';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function HistoryPanel() {
  const { crashHistory } = useWebSocket();

  return <CandlestickGameHistory history={crashHistory} />;
}
```

**Props**:
```typescript
interface CandlestickGameHistoryProps {
  history: GameHistoryItem[];
}

interface GameHistoryItem {
  gameId: string;
  peakMultiplier: number;
  rugged: boolean;
  candles: CandleData[];
  timestamp: string;
}

interface CandleData {
  open: number;
  close?: number;
  max: number;
  min: number;
}
```

---

### 3. **GameDetailChart** - Detailed Game View
Full-size detailed view of a single game's candlestick chart.

**Location**: `/client/src/components/crash/GameDetailChart.tsx`

**Features**:
- Large detailed chart
- Header with game ID, peak, and rug status
- Optional bet/volume statistics
- Footer with OHLC (Open, High, Low, Close) stats
- Duration display
- Candle count
- Customizable height
- Auto-merges to 25 candles for readability

**Usage**:
```tsx
import { GameDetailChart } from '@/components/crash/GameDetailChart';

export function GameDetailPage({ gameId }: { gameId: string }) {
  const [gameData, setGameData] = useState(null);

  // Fetch game data...

  return (
    <div className="container">
      <GameDetailChart game={gameData} height="h-96" />
    </div>
  );
}
```

**Props**:
```typescript
interface GameDetailChartProps {
  game: GameData;
  height?: string; // Tailwind class (default: 'h-96')
}

interface GameData {
  gameId: string;
  peakMultiplier: number;
  rugged: boolean;
  candles: CandleData[];
  timestamp: string;
  totalBets?: number;
  totalVolume?: number;
}
```

---

### 4. **GameComparison** - Side-by-Side Comparison
Compare multiple games side-by-side in a grid layout.

**Location**: `/client/src/components/crash/GameComparison.tsx`

**Features**:
- Responsive grid (1-4 columns)
- Medium-sized charts for comparison
- Game headers with ID and timestamp
- Peak multiplier display
- Rug indicators
- OHLC mini stats
- Duration and candle count
- Auto-merges to 15 candles per game

**Usage**:
```tsx
import { GameComparison } from '@/components/crash/GameComparison';

export function ComparisonPage() {
  const topGames = [game1, game2, game3, game4];

  return <GameComparison games={topGames} columns={2} />;
}
```

**Props**:
```typescript
interface GameComparisonProps {
  games: GameData[];
  columns?: 2 | 3 | 4; // Default: 2
}
```

---

## Example Use Cases

### Use Case 1: Trading Dashboard
Combine live chart with history:

```tsx
import { LiveCandlestickChart } from '@/components/trading/LiveCandlestickChart';
import { CandlestickGameHistory } from '@/components/crash/CandlestickGameHistory';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function TradingDashboard() {
  const { crashHistory } = useWebSocket();

  return (
    <div className="space-y-4">
      {/* Live Game */}
      <LiveCandlestickChart />

      {/* Recent History */}
      <CandlestickGameHistory history={crashHistory.slice(0, 10)} />
    </div>
  );
}
```

### Use Case 2: Game Detail Modal
Show detailed view when clicking a history item:

```tsx
import { GameDetailChart } from '@/components/crash/GameDetailChart';
import { Dialog } from '@/components/ui/dialog';

export function GameHistoryWithModal() {
  const [selectedGame, setSelectedGame] = useState(null);

  return (
    <>
      <CandlestickGameHistory
        history={history}
        onGameClick={setSelectedGame}
      />

      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        {selectedGame && (
          <GameDetailChart game={selectedGame} height="h-[500px]" />
        )}
      </Dialog>
    </>
  );
}
```

### Use Case 3: Top Games Comparison
Compare the highest multiplier games:

```tsx
import { GameComparison } from '@/components/crash/GameComparison';

export function TopGames() {
  const { crashHistory } = useWebSocket();

  const topGames = [...crashHistory]
    .sort((a, b) => b.peakMultiplier - a.peakMultiplier)
    .slice(0, 4);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Top 4 Games Today</h2>
      <GameComparison games={topGames} columns={4} />
    </div>
  );
}
```

### Use Case 4: Recent Rugs Analysis
Show only rugged games:

```tsx
import { GameComparison } from '@/components/crash/GameComparison';

export function RuggedGames() {
  const { crashHistory } = useWebSocket();

  const ruggedGames = crashHistory.filter(game => game.rugged);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recent Rugs</h2>
      <GameComparison games={ruggedGames.slice(0, 6)} columns={3} />
    </div>
  );
}
```

---

## Integration with Existing Code

### Don't Replace Existing Components
These new components are **additions**, not replacements:

- ✅ **Keep** `TradingChart.tsx` (uses `AdvancedCandlestickCanvas`)
- ✅ **Keep** `GameHistory.tsx` (uses custom `MiniCandlestickChart`)
- ✅ **Add** `LiveCandlestickChart.tsx` (uses `CandlestickChartCanvas`)
- ✅ **Add** `CandlestickGameHistory.tsx` (uses `CandlestickChartCanvas`)
- ✅ **Add** `GameDetailChart.tsx` (uses `CandlestickChartCanvas`)
- ✅ **Add** `GameComparison.tsx` (uses `CandlestickChartCanvas`)

### Switching Between Components
You can choose which component to use based on your needs:

```tsx
// Option 1: Original component
import { TradingChart } from '@/components/trading/TradingChart';

// Option 2: New candlestick component
import { LiveCandlestickChart } from '@/components/trading/LiveCandlestickChart';

export function StandardMode() {
  const [useNewChart, setUseNewChart] = useState(false);

  return (
    <div>
      <button onClick={() => setUseNewChart(!useNewChart)}>
        Toggle Chart Type
      </button>

      {useNewChart ? <LiveCandlestickChart /> : <TradingChart />}
    </div>
  );
}
```

---

## Component Comparison

| Component | Size | Purpose | Candle Merge | Best For |
|-----------|------|---------|--------------|----------|
| `LiveCandlestickChart` | Large (h-80) | Real-time game | None | Active trading |
| `CandlestickGameHistory` | Mini (h-16) | History grid | 10 candles | Quick overview |
| `GameDetailChart` | Customizable | Single game detail | 25 candles | Analysis |
| `GameComparison` | Medium (h-40) | Side-by-side | 15 candles | Comparison |

---

## Styling Customization

All components use consistent styling that can be customized:

### Colors
```typescript
// Edit CandlestickChartCanvas.tsx for global color changes:
const greenColor = '#26a69a';    // Bullish candles
const redColor = '#ef5350';      // Bearish candles
const backgroundColor = '#0a0a0f'; // Chart background
const gridColor = '#1a1e24';     // Grid lines
const priceLineColor = '#58a6ff'; // Current price line
const gameOverColor = '#aa1122';  // Game over text
```

### Card Backgrounds
```tsx
// Customize in each component:
<Card className="bg-[#14141f] border-white/5">
```

---

## Performance Notes

1. **LiveCandlestickChart**: Updates at 60 FPS during active game
2. **CandlestickGameHistory**: Static rendering after initial load
3. **GameDetailChart**: Static rendering with auto-merge
4. **GameComparison**: Static rendering with auto-merge

All components use canvas rendering for optimal performance with large datasets.

---

## Files Structure

```
client/src/components/
├── trading/
│   ├── TradingChart.tsx              # Original (keep)
│   └── LiveCandlestickChart.tsx      # New (candlestick)
└── crash/
    ├── GameHistory.tsx               # Original (keep)
    ├── CandlestickChartCanvas.tsx    # Base component
    ├── CandlestickChartExample.tsx   # Example usage
    ├── CandlestickGameHistory.tsx    # New (candlestick)
    ├── GameDetailChart.tsx           # New (candlestick)
    └── GameComparison.tsx            # New (candlestick)
```

---

## Next Steps

1. **Import and test** each component individually
2. **Choose** which components fit your UI needs
3. **Customize** styling to match your design
4. **Add** interactive features (click handlers, modals, etc.)
5. **Integrate** with your existing WebSocket context

---

**Last Updated**: December 28, 2024
**Version**: 1.0
**Base Component**: `CandlestickChartCanvas` (see `CANDLESTICK_CHART_COMPONENT.md`)
