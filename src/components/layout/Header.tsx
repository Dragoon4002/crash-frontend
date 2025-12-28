'use client'

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Flame, Heart, Swords, Wallet } from 'lucide-react';
import { GameMode } from '@/lib/types';

interface HeaderProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function Header({ currentMode, onModeChange }: HeaderProps) {
  const [level] = useState(0);
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Get shortened wallet address
  const getShortAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const walletAddress = user?.wallet?.address;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-[#0a0a0f]/95 backdrop-blur supports-backdrop-filter:bg-[#0a0a0f]/80">
      <div className="flex h-20 items-center justify-between px-4 border-b border-white">
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-65">
          <div className="text-2xl">🏔️</div>
          <div className="flex items-baseline gap-1">
            <h1 className="text-2xl font-black text-white tracking-tight">RUGS.FUN</h1>
            <span className="text-[9px] text-yellow-500 font-bold px-1 py-0.5 bg-yellow-500/10 rounded">BETA</span>
          </div>
        </div>

        {/* Game Mode Tabs */}
        <Tabs value={currentMode} onValueChange={(value) => onModeChange(value as GameMode)} className="flex-1 flex justify-center">
          <TabsList className="bg-[#14141f] border border-orange-500/30 p-0.5 h-9">
            <TabsTrigger
              value="standard"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-white gap-1.5 text-xs px-3 h-8"
            >
              <Flame className="h-3.5 w-3.5" />
              Standard
            </TabsTrigger>
            <TabsTrigger
              value="candleflip"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-white gap-1.5 text-xs px-3 h-8"
            >
              <Heart className="h-3.5 w-3.5" />
              Candleflip
            </TabsTrigger>
            <TabsTrigger
              value="battles"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-white gap-1.5 text-xs px-3 h-8"
            >
              <Swords className="h-3.5 w-3.5" />
              Battles
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Level & Connect */}
        <div className="flex items-center gap-3 min-w-[180px] justify-end">
          {/* Level Indicator */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
              <ChevronLeft className="h-3.5 w-3.5 text-gray-400" />
            </Button>
            <div className="flex items-center gap-2 rounded-lg bg-[#14141f] px-2.5 py-1.5 border border-white/5 min-w-[100px]">
              <div className="text-base">🏆</div>
              <div className="flex-1">
                <div className="text-[10px] text-white font-bold">Level {level}</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500" style={{ width: '30%' }} />
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5">
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Button>
          </div>

          {/* Connect/Wallet Button */}
          {ready && authenticated ? (
            <div className="flex items-center gap-2">
              <div className="bg-[#14141f] border border-white/10 px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-mono text-white">
                    {walletAddress ? getShortAddress(walletAddress) : 'Connected'}
                  </span>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="h-9 text-xs px-4 border-white/10 hover:bg-white/5"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={login}
              disabled={!ready}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 h-9 text-xs rounded-full flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              {ready ? 'Connect Wallet' : 'Loading...'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
