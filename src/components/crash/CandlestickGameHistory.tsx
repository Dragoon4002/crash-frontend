'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CandleGroup {
  open: number;
  close: number;
  max: number;
  min: number;
  valueList?: number[];
  startTime?: number;
  durationMs?: number;
  isComplete?: boolean;
}

interface GameHistoryItem {
  gameId: string;
  peakMultiplier: number;
  rugged: boolean;
  candles?: CandleGroup[];
  timestamp: string;
}

interface CandlestickGameHistoryProps {
  history: GameHistoryItem[];
}

export function CandlestickGameHistory({ history }: CandlestickGameHistoryProps) {
  const [displayedHistory, setDisplayedHistory] = useState<GameHistoryItem[]>([]);
  const [newGameIds, setNewGameIds] = useState<Set<string>>(new Set());
  const previousHistoryRef = useRef<GameHistoryItem[]>([]);

  // Detect new games and add them with animation
  useEffect(() => {
    if (!history || history.length === 0) {
      setDisplayedHistory([]);
      return;
    }

    const currentGameIds = new Set(previousHistoryRef.current.map(g => g.gameId));
    const newGames: GameHistoryItem[] = [];

    // Find new games
    history.forEach(game => {
      if (!currentGameIds.has(game.gameId)) {
        newGames.push(game);
      }
    });

    if (newGames.length > 0) {
      // Mark new games for animation
      const newIds = new Set(newGames.map(g => g.gameId));
      setNewGameIds(newIds);

      // Remove animation class after animation completes
      setTimeout(() => {
        setNewGameIds(new Set());
      }, 600);
    }

    setDisplayedHistory(history.slice(0, 10));
    previousHistoryRef.current = history;
  }, [history]);

  if (!displayedHistory || displayedHistory.length === 0) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Games</h3>
        <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
          No game history yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">
        Recent Games ({displayedHistory.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayedHistory.map((game, index) => (
          <MiniGameBlock
            key={game.gameId || index}
            game={game}
            isNew={newGameIds.has(game.gameId)}
          />
        ))}
      </div>
    </div>
  );
}

function MiniGameBlock({ game, isNew }: { game: GameHistoryItem; isNew?: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = 120;
    const height = 80;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, width, height);

    // Check if we have candle data
    if (!game.candles || !Array.isArray(game.candles) || game.candles.length === 0) {
      // Draw a simple peak indicator if no candle data
      drawSimplePeakIndicator(ctx, width, height, game.peakMultiplier, game.rugged);
      return;
    }

    // Convert CandleGroup data to simplified format for mini chart
    const candleGroups: CandleGroup[] = game.candles.map((candle) => ({
      open: candle.open || 1.0,
      close: candle.close ?? candle.open ?? 1.0,
      max: candle.max || 1.0,
      min: candle.min || 1.0,
      isComplete: candle.isComplete ?? true,
    }));

    drawMiniCandlestickChart(ctx, width, height, candleGroups, game.rugged);
  }, [game]);

  // Determine color based on peak
  const peakColor = game.rugged 
    ? '#ef4444' 
    : game.peakMultiplier >= 10 
    ? '#10b981' 
    : game.peakMultiplier >= 2 
    ? '#3b82f6' 
    : '#8b949e';

  return (
    <div className={`bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden hover:border-[#58a6ff] transition-all group cursor-pointer ${
      isNew ? 'animate-slideInScale' : ''
    }`}>
      {/* Canvas */}
      <div className="relative h-20">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
        
        {/* Overlay info */}
        <div className="absolute top-1 right-1 bg-black/50 px-1.5 py-0.5 rounded text-xs font-mono">
          <span style={{ color: peakColor }}>
            {game.peakMultiplier.toFixed(2)}x
          </span>
        </div>

        {game.rugged && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
            <span className="text-red-500 text-xs font-bold">RUGGED</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1.5 border-t border-[#30363d] bg-[#161b22]">
        <div className="text-xs text-gray-500 truncate font-mono">
          {game.gameId ? `#${game.gameId.slice(-8)}` : 'Game'}
        </div>
      </div>
    </div>
  );
}

// Draw mini candlestick chart
function drawMiniCandlestickChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  candles: CandleGroup[],
  rugged: boolean
) {
  if (candles.length === 0) return;

  const padding = { top: 5, right: 5, bottom: 5, left: 5 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate Y-axis range
  const allValues = candles.flatMap(c => [c.open, c.close, c.max, c.min]);
  const minValue = Math.min(...allValues, 0.5);
  const maxValue = Math.max(...allValues, 1.5);
  const range = maxValue - minValue;
  const yMin = Math.max(0, minValue - range * 0.1);
  const yMax = maxValue + range * 0.1;

  // Helper: value to Y coordinate
  const valueToY = (value: number): number => {
    const normalized = (value - yMin) / (yMax - yMin);
    return padding.top + chartHeight * (1 - normalized);
  };

  // Draw candles with fixed width and centered layout
  const fixedCandleWidth = 3; // Fixed small width for all candles
  const fixedSpacing = 1.5;   // Fixed spacing between candles
  const totalCandlesWidth = candles.length * fixedCandleWidth + (candles.length - 1) * fixedSpacing;
  const startX = padding.left + (chartWidth - totalCandlesWidth) / 2; // Center the candles

  candles.forEach((candle, index) => {
    const x = startX + index * (fixedCandleWidth + fixedSpacing);
    
    const isGreen = candle.close >= candle.open;
    const color = rugged && index === candles.length - 1 
      ? '#ef4444' 
      : isGreen 
      ? '#26a69a' 
      : '#ef5350';

    const yOpen = valueToY(candle.open);
    const yClose = valueToY(candle.close);
    const yHigh = valueToY(candle.max);
    const yLow = valueToY(candle.min);

    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);

    // Draw wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + fixedCandleWidth / 2, yHigh);
    ctx.lineTo(x + fixedCandleWidth / 2, yLow);
    ctx.stroke();

    // Draw body
    ctx.fillStyle = color;
    ctx.fillRect(x, bodyTop, fixedCandleWidth, bodyHeight);
  });

  // Draw 1.0x reference line
  if (yMin <= 1.0 && yMax >= 1.0) {
    const y1 = valueToY(1.0);
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(padding.left, y1);
    ctx.lineTo(padding.left + chartWidth, y1);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// Draw simple peak indicator when no candle data available
function drawSimplePeakIndicator(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  peak: number,
  rugged: boolean
) {
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Draw a simple line from 1.0x to peak
  const startY = padding.top + chartHeight;
  const peakY = padding.top + chartHeight * (1 - Math.min(peak / 10, 1));
  
  const color = rugged ? '#ef4444' : peak >= 10 ? '#10b981' : '#3b82f6';

  // Draw line
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, startY);
  ctx.lineTo(padding.left + chartWidth, peakY);
  ctx.stroke();

  // Draw start point
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(padding.left, startY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw end point
  ctx.beginPath();
  ctx.arc(padding.left + chartWidth, peakY, 3, 0, Math.PI * 2);
  ctx.fill();

  if (rugged) {
    // Draw crash effect
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left + chartWidth, peakY);
    ctx.lineTo(padding.left + chartWidth, startY);
    ctx.stroke();
  }
}