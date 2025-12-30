'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface CandleData {
  open: number;
  close?: number;
  max: number;
  min: number;
}

interface GameHistoryItem {
  gameId: string;
  peakMultiplier: number;
  rugged: boolean;
  candles: CandleData[];
  timestamp: string;
}

interface GameHistoryProps {
  history: GameHistoryItem[];
}

export function GameHistory({ history }: GameHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="bg-[#14141f] border-white/5 p-4">
        <h3 className="text-sm text-gray-400 mb-3">Game History</h3>
        <div className="text-xs text-gray-500 text-center py-4">
          No game history available
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#14141f] border-white/5 p-4">
      <h3 className="text-sm text-gray-400 mb-3">Game History (Last 10 Games)</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {history.map((game, idx) => (
          <MiniGameBlock key={game.gameId || idx} game={game} />
        ))}
      </div>
    </Card>
  );
}

function MiniGameBlock({ game }: { game: GameHistoryItem }) {
  const isRugged = game.rugged;
  const peakColor = isRugged ? 'text-red-400' : game.peakMultiplier > 10 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="bg-[#0a0a0f]/50 rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors">
      {/* Mini Candlestick Chart */}
      <div className="h-16 mb-2 relative">
        <MiniCandlestickChart candles={game.candles} isRugged={isRugged} />
      </div>

      {/* Peak Value */}
      <div className={`text-center text-xs font-bold ${peakColor}`}>
        {isRugged ? (
          <span className="flex items-center justify-center gap-1">
            <span className="text-red-500">💥</span>
            {game.peakMultiplier.toFixed(2)}x
          </span>
        ) : (
          `${game.peakMultiplier.toFixed(2)}x`
        )}
      </div>
    </div>
  );
}

function MiniCandlestickChart({ candles, isRugged }: { candles: CandleData[]; isRugged: boolean }) {
  if (!candles || candles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-[10px] text-gray-600">No data</span>
      </div>
    );
  }

  // Find min and max for scaling
  const allValues = candles.flatMap(c => [c.open, c.close ?? c.open, c.max, c.min]);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  // Scale value to canvas height (0-100%)
  const scaleValue = (value: number) => {
    return ((maxValue - value) / range) * 100;
  };

  const candleWidth = 100 / Math.max(candles.length, 1);

  return (
    <div className="w-full h-full relative">
      {candles.map((candle, idx) => {
        const closeValue = candle.close ?? candle.open;
        const isGreen = closeValue >= candle.open;

        const bodyTop = Math.min(scaleValue(candle.open), scaleValue(closeValue));
        const bodyBottom = Math.max(scaleValue(candle.open), scaleValue(closeValue));
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

        const wickTop = scaleValue(candle.max);
        const wickBottom = scaleValue(candle.min);

        const color = isRugged ? '#ef4444' : isGreen ? '#22c55e' : '#ef4444';
        const wickColor = isRugged ? '#dc2626' : isGreen ? '#16a34a' : '#dc2626';

        return (
          <div
            key={idx}
            className="absolute"
            style={{
              left: `${idx * candleWidth}%`,
              width: `${candleWidth}%`,
              height: '100%',
            }}
          >
            {/* Wick */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: `${wickTop}%`,
                height: `${wickBottom - wickTop}%`,
                width: '1px',
                backgroundColor: wickColor,
              }}
            />
            {/* Body */}
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-sm"
              style={{
                top: `${bodyTop}%`,
                height: `${bodyHeight}%`,
                width: '60%',
                minWidth: '2px',
                backgroundColor: color,
                opacity: 0.9,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
