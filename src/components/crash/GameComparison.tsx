'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CandlestickChartCanvas, CandleGroup } from '@/components/crash/CandlestickChartCanvas';

interface CandleData {
  open: number;
  close?: number;
  max: number;
  min: number;
}

interface GameData {
  gameId: string;
  peakMultiplier: number;
  rugged: boolean;
  candles: CandleData[];
  timestamp: string;
}

interface GameComparisonProps {
  games: GameData[];
  columns?: 2 | 3 | 4;
}

export function GameComparison({ games, columns = 2 }: GameComparisonProps) {
  if (!games || games.length === 0) {
    return (
      <Card className="bg-[#14141f] border-white/5 p-4">
        <h3 className="text-sm text-gray-400 mb-3">Game Comparison</h3>
        <div className="text-xs text-gray-500 text-center py-4">
          No games to compare
        </div>
      </Card>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <Card className="bg-[#14141f] border-white/5 p-4">
      <h3 className="text-sm text-gray-400 mb-4">Game Comparison ({games.length} Games)</h3>

      <div className={`grid ${gridCols} gap-4`}>
        {games.map((game, idx) => (
          <GameComparisonCard key={game.gameId || idx} game={game} />
        ))}
      </div>
    </Card>
  );
}

function GameComparisonCard({ game }: { game: GameData }) {
  // Convert CandleData to CandleGroup format
  const candleGroups: CandleGroup[] = game.candles.map((candle, idx) => ({
    open: candle.open,
    close: candle.close ?? candle.open,
    max: candle.max,
    min: candle.min,
    valueList: [],
    startTime: new Date(game.timestamp).getTime() + idx * 1000,
    durationMs: 1000,
    isComplete: true,
  }));

  const isRugged = game.rugged;
  const peakColor = isRugged ? 'text-red-400' : game.peakMultiplier > 10 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="bg-[#0a0a0f]/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5 bg-[#14141f]/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 font-mono">#{game.gameId.slice(-8)}</span>
          {isRugged && <span className="text-xs text-red-500">💥</span>}
        </div>
        <div className={`text-lg font-bold ${peakColor}`}>
          {game.peakMultiplier.toFixed(2)}x
        </div>
        <div className="text-[10px] text-gray-500">
          {new Date(game.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 relative">
        <CandlestickChartCanvas
          previousCandles={candleGroups}
          currentCandle={undefined}
          currentPrice={0}
          gameEnded={true}
          isHistoryMode={true}
          historyMergeCount={15}
        />
      </div>

      {/* Stats */}
      <div className="px-3 py-2 border-t border-white/5 bg-[#14141f]/30">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Duration: </span>
            <span className="text-white font-mono">{game.candles.length}s</span>
          </div>
          <div>
            <span className="text-gray-400">Candles: </span>
            <span className="text-white font-mono">{game.candles.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Low: </span>
            <span className="text-red-400 font-mono">
              {Math.min(...game.candles.map(c => c.min)).toFixed(2)}x
            </span>
          </div>
          <div>
            <span className="text-gray-400">High: </span>
            <span className="text-green-400 font-mono">
              {game.peakMultiplier.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
