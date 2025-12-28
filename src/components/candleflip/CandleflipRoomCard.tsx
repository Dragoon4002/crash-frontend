'use client';

import React, { useEffect } from 'react';
import { useCandleflipRoom } from '@/hooks/useCandleflipRoom';
import { CandleflipCanvas } from './CandleflipCanvas';
import { TrendType } from '@/types/candleflip';
import { Shield } from 'lucide-react';
import { getBotForRoom } from '@/utils/botNames';

interface CandleflipRoomCardProps {
  roomId: string;
  betAmount: number;
  trend: TrendType;
  onVerify: (gameId: string, serverSeed: string) => void;
  onFinished: (roomId: string) => void;
}

export function CandleflipRoomCard({ roomId, betAmount, trend, onVerify, onFinished }: CandleflipRoomCardProps) {
  const { countdownMessage, ...gameState } = useCandleflipRoom('ws://localhost:8080/candleflip', roomId);

  // Get bot opponent for this room (consistent per roomId)
  const bot = getBotForRoom(roomId);

  // Use roomId as userId placeholder (until WebSocket ID is available)
  const userId = `User-${roomId.slice(0, 8)}`;

  // Auto-delete room after game finishes (with delay to show result)
  useEffect(() => {
    if (gameState.status === 'finished') {
      // Wait 5 seconds to show the result, then remove the room
      const timer = setTimeout(() => {
        onFinished(roomId);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameState.status, roomId, onFinished]);

  const handleVerify = () => {
    if (gameState.gameId && gameState.serverSeed) {
      onVerify(gameState.gameId, gameState.serverSeed);
    } else {
      alert('Game has not ended yet. Please wait for the results.');
    }
  };

  const getUserResult = () => {
    if (!gameState.winner) return null;

    const won = (trend === 'bullish' && gameState.winner === 'GREEN') ||
                (trend === 'bearish' && gameState.winner === 'RED');

    return {
      won,
      payout: won ? betAmount * 2 : 0,
    };
  };

  const result = getUserResult();

  return (
    <div className="relative bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden">
      {/* Shield Icon - Top Right */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleVerify}
          className="p-2 bg-[#0d1117]/80 hover:bg-[#0d1117] border border-[#30363d] rounded-lg transition-colors"
          title="Verify Game"
        >
          <Shield className="w-5 h-5 text-[#58a6ff]" />
        </button>
      </div>

      {/* Top Banner - Bullish (User) */}
      <div
        className={`h-10 flex items-center justify-between px-4 font-bold text-sm border-b border-[#30363d] ${
          trend === 'bullish'
            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
            : 'bg-[#1f2428] text-gray-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>📈</span>
          <span>{userId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">BULLISH</span>
          {trend === 'bullish' && <span className="text-xs">({betAmount} MNT)</span>}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative h-64 bg-[#0d1117]">
        <CandleflipCanvas
          priceHistory={gameState.priceHistory}
          currentPrice={gameState.currentPrice}
          status={gameState.status}
          countdown={gameState.countdown}
          countdownMessage={countdownMessage}
          finalPrice={gameState.finalPrice}
          winner={gameState.winner}
        />

        {/* Game Result Overlay */}
        {result && gameState.status === 'finished' && (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className={`text-center p-6 rounded-lg ${result.won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <div className={`text-4xl font-bold mb-2 ${result.won ? 'text-green-400' : 'text-red-400'}`}>
                {result.won ? 'YOU WON!' : 'YOU LOST'}
              </div>
              <div className="text-2xl text-white font-mono">
                {result.won ? `+${result.payout} MNT` : `-${betAmount} MNT`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Banner - Bearish (Bot) */}
      <div
        className={`h-10 flex items-center justify-between px-4 font-bold text-sm border-t border-[#30363d] ${
          trend === 'bearish'
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
            : 'bg-[#1f2428] text-gray-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>📉</span>
          <span>{bot.emoji} {bot.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs">BEARISH</span>
          {trend === 'bearish' && <span className="text-xs">({betAmount} MNT)</span>}
        </div>
      </div>

      {/* Room ID Badge */}
      <div className="absolute bottom-12 left-2 bg-[#0d1117]/90 px-2 py-1 rounded text-xs text-gray-400 border border-[#30363d]">
        Room #{roomId}
      </div>
    </div>
  );
}
