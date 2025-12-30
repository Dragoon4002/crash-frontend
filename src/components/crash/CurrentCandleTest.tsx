'use client';

import { Card } from '@/components/ui/card';
import { CandlestickChartCanvas } from '@/components/crash/CandlestickChartCanvas';
import { useAdvancedCrashGame } from '@/hooks/useAdvancedCrashGame';
import { useMemo, useEffect, useState } from 'react';

export function CurrentCandleTest() {
  const { status, currentValue, countdown, groups, currentCandle, gameId, rugged } = useAdvancedCrashGame();
  const [candleUpdateCount, setCandleUpdateCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Get previous candles (completed ones) from groups
  const previousCandles = useMemo(() => {
    return groups.filter(g => g.isComplete);
  }, [groups]);

  // Determine if game ended
  const gameEnded = status === 'crashed' || rugged;

  // Track current candle updates
  useEffect(() => {
    if (currentCandle) {
      setCandleUpdateCount(prev => prev + 1);
      setLastUpdateTime(new Date());

      console.log('📊 [CurrentCandleTest] Current candle update #' + (candleUpdateCount + 1), {
        open: currentCandle.open,
        close: currentCandle.close,
        max: currentCandle.max,
        min: currentCandle.min,
        valueList: currentCandle.valueList,
        valueListLength: currentCandle.valueList?.length || 0,
        isComplete: currentCandle.isComplete,
        durationMs: currentCandle.durationMs,
        startTime: new Date(currentCandle.startTime).toLocaleTimeString(),
      });
    }
  }, [currentCandle]);

  // Reset counter on new game
  useEffect(() => {
    if (status === 'countdown') {
      setCandleUpdateCount(0);
      setLastUpdateTime(null);
    }
  }, [status]);

  return (
    <Card className="bg-[#14141f] border-white/5 p-0 overflow-hidden">
      {/* Header with Debug Info */}
      <div className="px-4 py-3 border-b border-white/5 bg-[#1a1a2e]">
        <h3 className="text-lg font-bold text-white mb-2">Current Candle Test Case</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Status:</span>
            <span className={`font-semibold ${
              status === 'running' ? 'text-green-400' :
              status === 'crashed' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Game ID:</span>
            <span className="text-blue-400 font-mono">{gameId.slice(-8) || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Previous Candles:</span>
            <span className="text-white font-mono">{previousCandles.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Current Candle:</span>
            <span className={`font-mono ${currentCandle ? 'text-green-400' : 'text-gray-600'}`}>
              {currentCandle ? '✓ Active' : '✗ None'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Candle Details */}
      {currentCandle && (
        <div className="px-4 py-3 border-b border-white/5 bg-[#0f0f1e]">
          <h4 className="text-xs font-bold text-gray-400 mb-2">CURRENT CANDLE DATA:</h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Open</div>
              <div className="text-white font-mono font-bold">{currentCandle.open.toFixed(3)}x</div>
            </div>
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Close</div>
              <div className="text-white font-mono font-bold">
                {currentCandle.close ? currentCandle.close.toFixed(3) + 'x' : 'N/A'}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Max</div>
              <div className="text-green-400 font-mono font-bold">{currentCandle.max.toFixed(3)}x</div>
            </div>
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Min</div>
              <div className="text-red-400 font-mono font-bold">{currentCandle.min.toFixed(3)}x</div>
            </div>
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Value List</div>
              <div className="text-blue-400 font-mono font-bold">
                {currentCandle.valueList?.length || 0} values
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 mb-1">Complete</div>
              <div className={`font-mono font-bold ${
                currentCandle.isComplete ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {currentCandle.isComplete ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Value List Preview */}
          {currentCandle.valueList && currentCandle.valueList.length > 0 && (
            <div className="mt-3 bg-[#1a1a2e] p-2 rounded">
              <div className="text-gray-500 text-xs mb-1">Value List (last 10):</div>
              <div className="text-xs font-mono text-blue-300 break-all">
                {currentCandle.valueList.slice(-10).map(v => v.toFixed(3)).join(', ')}
              </div>
            </div>
          )}

          {/* Update Stats */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Updates Received:</span>
              <span className="text-white font-bold">{candleUpdateCount}</span>
            </div>
            {lastUpdateTime && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Last Update:</span>
                <span className="text-white font-mono">{lastUpdateTime.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Current Candle Message */}
      {!currentCandle && status === 'running' && (
        <div className="px-4 py-3 border-b border-white/5 bg-[#0f0f1e]">
          <div className="text-xs text-yellow-400">
            ⚠️ No current candle received from server
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div className="relative h-80 bg-[#0a0a0f]/30">
        {/* Game Status Overlay */}
        {status === 'countdown' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
            <div className="text-6xl font-bold text-white mb-2">{countdown}</div>
            <div className="text-lg text-gray-400">Next game starting...</div>
          </div>
        )}

        {status === 'connecting' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
            <div className="text-lg text-gray-400 mb-3">Connecting to server...</div>
          </div>
        )}

        {/* Candlestick Chart with Current Candle */}
        <CandlestickChartCanvas
          previousCandles={previousCandles}
          currentCandle={currentCandle}
          currentPrice={currentValue}
          gameEnded={gameEnded}
          isHistoryMode={false}
        />

        {/* Current Candle Indicator */}
        {currentCandle && (
          <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/50 px-3 py-1.5 rounded-lg">
            <span className="text-xs text-green-400 font-bold">CURRENT CANDLE ACTIVE</span>
          </div>
        )}

        {/* Game ID Badge */}
        {gameId && (
          <div className="absolute top-4 left-4 bg-[#14141f]/90 px-3 py-1.5 rounded-lg border border-white/10">
            <span className="text-xs text-gray-400">Game: </span>
            <span className="text-xs text-blue-400 font-mono">{gameId.slice(-8)}</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 border-t border-white/5 bg-[#0f0f1e]">
        <h4 className="text-xs font-bold text-gray-400 mb-2">TEST INSTRUCTIONS:</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Watch console logs for detailed current candle updates</li>
          <li>• Current candle should update during game (valueList grows)</li>
          <li>• Check that max/min values adjust as the game progresses</li>
          <li>• Verify Y-axis resets to [0.5-1.5] when new game starts</li>
          <li>• Current candle should be undefined during countdown/crashed</li>
        </ul>
      </div>
    </Card>
  );
}
