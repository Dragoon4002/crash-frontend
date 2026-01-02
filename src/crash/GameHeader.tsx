'use client';

import React, { useMemo } from 'react';

interface GameHeaderProps {
  recentResults: number[]; // Last 100 crash multipliers
}

export function GameHeader({ recentResults }: GameHeaderProps) {
  // Calculate stats
  const stats = useMemo(() => {
    return {
      '2x': recentResults.filter(m => m >= 2).length,
      '10x': recentResults.filter(m => m >= 10).length,
      '50x': recentResults.filter(m => m >= 50).length,
      last: recentResults[recentResults.length - 1] || 0
    };
  }, [recentResults]);

  // Get last 10 results for mini charts
  const last10 = recentResults.slice(-10);

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-[#161b22] border-b border-[#21262d]">
      {/* Left: Stats */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="text-[#8b949e]">
            Last 100 🔥 <span className="text-white">{stats.last.toFixed(2)}x</span>
          </span>

          {/* 2x Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-[#30363d] rounded-full">
            <div className="w-6 h-6 rounded-full bg-[#30363d] flex items-center justify-center text-[10px] font-bold text-white">
              2X
            </div>
            <span className="text-white font-semibold">{stats['2x']}</span>
          </div>

          {/* 10x Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-[#30363d] rounded-full">
            <div className="w-6 h-6 rounded-full bg-[#ffd700] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">
              10X
            </div>
            <span className="text-white font-semibold">{stats['10x']}</span>
          </div>

          {/* 50x Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-[#30363d] rounded-full">
            <div className="w-6 h-6 rounded-full bg-[#ffd700] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">
              50X
            </div>
            <span className="text-white font-semibold">{stats['50x']}</span>
          </div>
        </div>
      </div>

      {/* Right: Recent Results Mini Charts */}
      <div className="flex gap-2">
        {last10.map((multiplier, index) => (
          <MiniChart key={index} multiplier={multiplier} />
        ))}
      </div>
    </div>
  );
}

function MiniChart({ multiplier }: { multiplier: number }) {
  const isGreen = multiplier >= 1.5;

  // Generate random bar heights based on multiplier
  const bars = useMemo(() => {
    const maxHeight = Math.min(18, multiplier * 5);
    return Array.from({ length: 5 }, (_, i) => {
      const progress = i / 4;
      return Math.max(2, Math.floor(maxHeight * progress * (0.8 + Math.random() * 0.4)));
    });
  }, [multiplier]);

  return (
    <div className="w-[60px] h-[40px] bg-[#0d1117] border border-[#30363d] rounded-md p-1 flex flex-col items-center justify-center">
      <div className="flex gap-0.5 items-end h-[18px]">
        {bars.map((height, i) => (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${isGreen ? 'bg-[#00ff88]' : 'bg-[#ff4444]'}`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <div className={`text-[11px] font-bold mt-0.5 ${isGreen ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
        {multiplier.toFixed(2)}x
      </div>
    </div>
  );
}
