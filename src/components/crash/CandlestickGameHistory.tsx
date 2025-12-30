'use client';

import { Card } from '@/components/ui/card';
import { CandlestickChartCanvas, CandleGroup } from '@/components/crash/CandlestickChartCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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

interface CandlestickGameHistoryProps {
  history: GameHistoryItem[];
}

const MAX_VISIBLE_HISTORY = 20;

export function CandlestickGameHistory({ history }: CandlestickGameHistoryProps) {
  const [newGameId, setNewGameId] = useState<string | null>(null);
  const previousGameIdRef = useRef<string | null>(null);

  // Limit history to MAX_VISIBLE_HISTORY items
  const limitedHistory = history.slice(0, MAX_VISIBLE_HISTORY);

  // Reverse order: most recent game first (leftmost)
  const reversedHistory = [...limitedHistory].reverse();

  // Track new games for glow effect
  useEffect(() => {
    if (limitedHistory.length > 0) {
      const latestGameId = limitedHistory[0].gameId;

      // Check if this is a new game (different from previous)
      if (previousGameIdRef.current && previousGameIdRef.current !== latestGameId) {
        setNewGameId(latestGameId);

        // Remove glow after 2 seconds
        const timeout = setTimeout(() => {
          setNewGameId(null);
        }, 2000);

        return () => clearTimeout(timeout);
      }

      previousGameIdRef.current = latestGameId;
    }
  }, [limitedHistory]);

  if (!history || history.length === 0) {
    return (
      <Card className="border-white/5 p-2 m-4 mb-0">
        <h3 className="text-sm text-gray-400">Game History</h3>
        <div className="text-xs text-gray-500 text-center py-4">
          No game history available
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-white/5 h-full overflow-hidden gap-0! p-2! m-4 mb-0">
      <div className="flex gap-2 overflow-x-auto overflow-hidden h-full">
        <AnimatePresence initial={false} mode="popLayout">
          {reversedHistory.map((game, idx) => {
            const isNew = game.gameId === newGameId;
            // Animation index: most recent game (last in reversed array) should animate as index 0
            const animationIndex = reversedHistory.length - 1 - idx;

            return (
              <MiniGameBlock
                key={game.gameId}
                game={game}
                index={animationIndex}
                isNew={isNew}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}

interface MiniGameBlockProps {
  game: GameHistoryItem;
  index: number;
  isNew: boolean;
}

function MiniGameBlock({ game, index, isNew }: MiniGameBlockProps) {
  const isRugged = game.rugged;

  // Calculate gradient color from gray (0.00) to green (10.00+)
  const getMultiplierColor = (multiplier: number): string => {
    // if (isRugged) return '#ef4444'; // Red for rugged

    // Normalize multiplier to 0-1 range (0.00 = 0, 10.00 = 1)
    const normalized = Math.min(multiplier / 10.0, 1.0);

    // Interpolate between gray (156,163,175) and pure green (0,255,0)
    const r = Math.round(156 + (0 - 156) * normalized);
    const g = Math.round(163 + (255 - 163) * normalized);
    const b = Math.round(175 + (0 - 175) * normalized);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const multiplierColor = getMultiplierColor(game.peakMultiplier);

  // Convert CandleData to CandleGroup format
  const candleGroups: CandleGroup[] = game.candles.map((candle, idx) => ({
    open: candle.open,
    close: candle.close ?? candle.open,
    max: candle.max,
    min: candle.min,
    valueList: [],
    startTime: Date.now() - (game.candles.length - idx) * 1000,
    durationMs: 1000,
    isComplete: true,
  }));

  // Calculate Y-range to fill 100% of canvas height
  // Normalize each graph from its min to max regardless of absolute values
  const yRange = game.candles.length > 0 ? (() => {
    const minValue = Math.min(...game.candles.map(c => c.min));
    const maxValue = Math.max(...game.candles.map(c => c.max));
    const range = maxValue - minValue;

    // Tiny padding (2%) to prevent candles from touching edges
    const padding = range * 0.02;

    return {
      min: minValue - padding,
      max: maxValue + padding,
    };
  })() : { min: 0.5, max: 1.5 };

  return (
    <motion.div
      layout
      initial={index === 0 ? {
        scaleY: 0,
        opacity: 0,
        originY: 1, // Grow from bottom
      } : false}
      animate={{
        scaleY: 1,
        opacity: 1,
      }}
      exit={{
        scaleY: 0,
        opacity: 0,
        originY: 1,
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          delay: index * 0.02, // Stagger slide animation
        },
        scaleY: {
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.4,
        },
        opacity: {
          duration: 0.3,
        },
      }}
      className={`rounded-lg border transition-all shrink-0 relative ${
        isNew
          ? 'border-green-400/50 shadow-lg shadow-green-500/20'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      {/* Candlestick Chart Canvas - Square aspect ratio */}
      <motion.div
        className="aspect-square w-24 relative overflow-hidden"
        initial={index === 0 ? { height: 0, width: 0 } : false}
        animate={{ height: 96, width: 96 }} // w-24 = 6rem = 96px
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.4,
        }}
      >
        <CandlestickChartCanvas
          previousCandles={candleGroups}
          currentCandle={undefined}
          currentPrice={0}
          gameEnded={true}
          isHistoryMode={true}
          historyMergeCount={10}
          fixedYRange={yRange}
          showYAxis={false}
        />
      </motion.div>

      {/* Peak Value */}
      <motion.div
        className="text-center text-xs font-bold absolute bottom-1 left-0 right-0"
        style={{ color: multiplierColor }}
        initial={index === 0 ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        {isRugged ? (
          <span className="flex items-center justify-center gap-1">
            {game.peakMultiplier.toFixed(2)}x
          </span>
        ) : (
          `${game.peakMultiplier.toFixed(2)}x`
        )}
      </motion.div>
    </motion.div>
  );
}
