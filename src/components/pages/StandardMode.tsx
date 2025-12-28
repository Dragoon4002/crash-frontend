'use client'

import { useCrashGame } from '@/hooks/useCrashGame';
import { TradingChart } from '@/components/trading/TradingChart';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { GameHistory } from '@/components/crash/GameHistory';
import { ActiveBettorsList } from '@/components/crash/ActiveBettorsList';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function StandardMode() {
  // Connect to crash game WebSocket for real-time game data
  const { status, multiplier, gameId, rugged } = useCrashGame('ws://localhost:8080/ws');

  // Get crash history and active bettors from unified WebSocket
  const { crashHistory, activeBettors } = useWebSocket();

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Main Content - Original UI */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 mx-auto">
          {/* Chart */}
          <TradingChart />

          {/* Game History - replaces latest candles display */}
          <GameHistory history={crashHistory} />

          {/* Trading Panel */}
          <TradingPanel
            gameId={gameId}
            currentMultiplier={multiplier}
            status={status}
            isRugged={rugged}
          />

          {/* Active Bettors List - below trading panel */}
          <ActiveBettorsList
            bettors={activeBettors}
            currentMultiplier={multiplier}
          />
        </div>
      </div>
    </div>
  );
}
