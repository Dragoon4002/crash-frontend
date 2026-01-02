'use client';

import React, { useMemo } from 'react';

interface Player {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  profit: number;
  profitPercent: number;
}

interface LeaderboardProps {
  currentMultiplier: number;
  status: string;
}

export function Leaderboard({ currentMultiplier, status }: LeaderboardProps) {
  // Mock player data
  const players = useMemo<Player[]>(() => {
    const avatars = ['🦁', '🐯', '🐻', '🦊', '🐺', '🦝', '🐱', '🐶', '🐼', '🐨', '🦄', '🦋'];
    const usernames = [
      'Miles7870', 'Wolfeee', 'zimonludii', 'Zer02Hero', 'comica',
      'Hellooooo', 'Anonthefirst', 'Jamboo', '7sory', 'Krogs',
      '1r1zzz', 'Clipper'
    ];

    return usernames.map((username, i) => {
      const betAmount = 0.05 + Math.random() * 0.15;
      const profitPercent = status === 'running'
        ? ((currentMultiplier - 1) * 100)
        : (Math.random() * 60 - 10);
      const profit = betAmount * (profitPercent / 100);

      return {
        id: `player-${i}`,
        username,
        avatar: avatars[i % avatars.length],
        betAmount,
        profit,
        profitPercent
      };
    }).sort((a, b) => b.profit - a.profit);
  }, [currentMultiplier, status]);

  return (
    <div className="w-[320px] bg-[#161b22] border-l border-[#21262d] flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-[#21262d] text-sm font-semibold text-[#8b949e]">
        PLAYERS
      </div>

      <div className="flex-1 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center px-5 py-3 gap-3 hover:bg-white/[0.03] transition-colors"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4] flex items-center justify-center text-xl flex-shrink-0">
              {player.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-white truncate">
                {player.username}
              </div>
              <div className="text-[11px] text-[#8b949e] mt-0.5">
                {player.betAmount.toFixed(3)}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-0.5">
              <div className={`text-[13px] font-semibold font-mono ${player.profit >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {player.profit >= 0 ? '+' : ''}{player.profit.toFixed(3)}
              </div>
              <div className="text-[11px] text-[#8b949e]">
                {player.profitPercent >= 0 ? '+' : ''}{player.profitPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
