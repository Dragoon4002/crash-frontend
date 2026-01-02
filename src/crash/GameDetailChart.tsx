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
  totalBets?: number;
  totalVolume?: number;
}

interface GameDetailChartProps {
  game: GameData;
  height?: string;
}

export function GameDetailChart({ game, height = 'h-96' }: GameDetailChartProps) {
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

  return (
    <Card className="bg-[#14141f] border-white/5 p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-gray-400">Game ID: </span>
            <span className="text-sm text-blue-400 font-mono">{game.gameId.slice(-12)}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400">Peak: </span>
            <span className={`text-sm font-bold ${
              game.rugged ? 'text-red-400' :
              game.peakMultiplier > 10 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {game.peakMultiplier.toFixed(2)}x
            </span>
          </div>
          {game.rugged && (
            <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-semibold">
              RUGGED 💥
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {game.totalBets && (
            <div>
              <span>Bets: </span>
              <span className="text-white font-medium">{game.totalBets}</span>
            </div>
          )}
          {game.totalVolume && (
            <div>
              <span>Volume: </span>
              <span className="text-white font-medium">{game.totalVolume.toFixed(2)} MNT</span>
            </div>
          )}
          <div>
            <span>Time: </span>
            <span className="text-white font-medium">
              {new Date(game.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className={`relative ${height} bg-[#0a0a0f]/30`}>
        <CandlestickChartCanvas
          previousCandles={candleGroups}
          currentCandle={undefined}
          currentPrice={0}
          gameEnded={true}
          isHistoryMode={true}
          historyMergeCount={25}
        />

        {/* Watermark */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-600">
          {game.candles.length} candles
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center gap-6 px-4 py-2.5 border-t border-white/5 bg-[#0a0a0f]/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Open:</span>
          <span className="text-xs text-white font-mono">{game.candles[0]?.open.toFixed(2)}x</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">High:</span>
          <span className="text-xs text-green-400 font-mono">{game.peakMultiplier.toFixed(2)}x</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Low:</span>
          <span className="text-xs text-red-400 font-mono">
            {Math.min(...game.candles.map(c => c.min)).toFixed(2)}x
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Close:</span>
          <span className="text-xs text-white font-mono">
            {(game.candles[game.candles.length - 1]?.close ?? game.candles[game.candles.length - 1]?.open).toFixed(2)}x
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Duration:</span>
          <span className="text-xs text-white font-mono">{game.candles.length}s</span>
        </div>
      </div>
    </Card>
  );
}
