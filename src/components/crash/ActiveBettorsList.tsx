'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

interface ActiveBettor {
  address: string;
  betAmount: number;
  entryMultiplier: number;
  betTime: string;
}

interface ActiveBettorsListProps {
  bettors: ActiveBettor[];
  currentMultiplier: number;
}

export function ActiveBettorsList({ bettors, currentMultiplier }: ActiveBettorsListProps) {
  if (!bettors || bettors.length === 0) {
    return (
      <Card className="bg-[#14141f] border-white/5 p-4 w-full" >
        <h3 className="text-sm text-gray-400 mb-3">Active Bettors</h3>
        <div className="text-xs text-gray-500 text-center py-4">
          No active bettors in this game
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#14141f] border-white/5 p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-gray-400">Active Bettors</h3>
        <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded">
          {bettors.length} {bettors.length === 1 ? 'bettor' : 'bettors'}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {bettors.map((bettor, idx) => (
          <BettorRow
            key={bettor.address || idx}
            bettor={bettor}
            currentMultiplier={currentMultiplier}
          />
        ))}
      </div>
    </Card>
  );
}

function BettorRow({ bettor, currentMultiplier }: { bettor: ActiveBettor; currentMultiplier: number }) {
  const isProfit = currentMultiplier >= bettor.entryMultiplier;
  const profitMultiplier = currentMultiplier - bettor.entryMultiplier;
  const potentialPayout = bettor.betAmount * currentMultiplier;
  const profit = bettor.betAmount * profitMultiplier;

  // Shorten address for display
  const shortAddress = `${bettor.address.slice(0, 6)}...${bettor.address.slice(-4)}`;

  return (
    <div className="bg-[#0a0a0f]/50 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
            {bettor.address.slice(2, 4).toUpperCase()}
          </div>
          <span className="text-xs text-white/80 font-mono">{shortAddress}</span>
        </div>
        <div className="text-xs text-gray-400">
          {bettor.betAmount.toFixed(4)} MNT
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            Entry: <span className="text-white/70">{bettor.entryMultiplier.toFixed(2)}x</span>
          </span>
          <span className="text-gray-500">
            Current: <span className="text-white/70">{currentMultiplier.toFixed(2)}x</span>
          </span>
        </div>

        <div className={`font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
          {isProfit ? '+' : ''}{profit.toFixed(4)} MNT
        </div>
      </div>

      {/* Profit/Loss Bar */}
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isProfit ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
          }`}
          style={{
            width: `${Math.min(Math.abs(profitMultiplier) * 20, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
