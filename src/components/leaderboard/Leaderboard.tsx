'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockLeaderboard } from '@/lib/mockData';
import { LEADERBOARD_TIME_FILTERS } from '@/lib/constants';
import { Trophy, Crown } from 'lucide-react';

export function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<typeof LEADERBOARD_TIME_FILTERS[number]>('7 Days');

  const topThree = mockLeaderboard.slice(0, 3);
  const remaining = mockLeaderboard.slice(3);

  const getPodiumColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return '';
  };

  const getPodiumBorder = (rank: number) => {
    if (rank === 1) return 'border-yellow-500/50';
    if (rank === 2) return 'border-gray-400/50';
    if (rank === 3) return 'border-orange-500/50';
    return '';
  };

  return (
    <Card className="bg-[#14141f] border-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-yellow-500 flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          LEADERBOARD
        </h2>
        <div className="flex gap-2">
          {LEADERBOARD_TIME_FILTERS.map((filter) => (
            <Button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              variant="outline"
              size="sm"
              className={`${
                timeFilter === filter
                  ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600'
                  : 'bg-[#0a0a0f] border-white/10 text-white hover:bg-white/5'
              }`}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 h-80">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className={`relative bg-gradient-to-b ${getPodiumColor(2)} rounded-lg p-4 border-2 ${getPodiumBorder(2)} mb-3 w-40`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold text-sm border-2 border-white">
              2
            </div>
            <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-white bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white">
              {topThree[1].username.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="text-center">
              <div className="text-white font-bold text-sm truncate">{topThree[1].username}</div>
              <div className="text-2xl font-black text-white mt-1">{topThree[1].pnl.toFixed(2)}</div>
              <div className="text-xs text-white/80">PnL</div>
            </div>
          </div>
          <div className={`w-40 h-32 bg-gradient-to-t ${getPodiumColor(2)} rounded-t-lg flex items-end justify-center pb-3 border-x-2 border-t-2 ${getPodiumBorder(2)}`}>
            <span className="text-3xl font-black text-white">2nd Place</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center -mt-8">
          <div className={`relative bg-gradient-to-b ${getPodiumColor(1)} rounded-lg p-4 border-2 ${getPodiumBorder(1)} mb-3 w-44 shadow-xl shadow-yellow-500/20`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center text-black font-bold text-lg border-2 border-white">
              <Crown className="h-5 w-5" />
            </div>
            <Avatar className="w-20 h-20 mx-auto mb-2 border-2 border-white bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white">
              {topThree[0].username.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="text-center">
              <div className="text-white font-bold truncate">{topThree[0].username}</div>
              <div className="text-3xl font-black text-white mt-1">{topThree[0].pnl.toFixed(2)}</div>
              <div className="text-xs text-white/80">PnL</div>
            </div>
          </div>
          <div className={`w-44 h-44 bg-gradient-to-t ${getPodiumColor(1)} rounded-t-lg flex items-end justify-center pb-3 border-x-2 border-t-2 ${getPodiumBorder(1)} shadow-xl`}>
            <span className="text-4xl font-black text-white">1st Place</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className={`relative bg-gradient-to-b ${getPodiumColor(3)} rounded-lg p-4 border-2 ${getPodiumBorder(3)} mb-3 w-40`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
              3
            </div>
            <Avatar className="w-16 h-16 mx-auto mb-2 border-2 border-white bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl font-bold text-white">
              {topThree[2].username.slice(0, 2).toUpperCase()}
            </Avatar>
            <div className="text-center">
              <div className="text-white font-bold text-sm truncate">{topThree[2].username}</div>
              <div className="text-2xl font-black text-white mt-1">{topThree[2].pnl.toFixed(2)}</div>
              <div className="text-xs text-white/80">PnL</div>
            </div>
          </div>
          <div className={`w-40 h-24 bg-gradient-to-t ${getPodiumColor(3)} rounded-t-lg flex items-end justify-center pb-3 border-x-2 border-t-2 ${getPodiumBorder(3)}`}>
            <span className="text-2xl font-black text-white">3rd Place</span>
          </div>
        </div>
      </div>

      {/* Remaining Rankings Table */}
      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-400">Rank</TableHead>
              <TableHead className="text-gray-400">Player</TableHead>
              <TableHead className="text-right text-gray-400">PnL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {remaining.map((entry) => (
              <TableRow key={entry.rank} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-medium text-white">#{entry.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className={`h-6 w-6 ${
                      entry.rank <= 6 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      entry.rank <= 12 ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gradient-to-br from-orange-500 to-red-500'
                    } flex items-center justify-center text-[10px] font-bold text-white`}>
                      {entry.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                    <span className="text-white font-medium">{entry.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-green-400 font-medium">
                  ≈ +{entry.pnl.toFixed(3)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
