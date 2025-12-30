'use client'

import { useCrashGame } from '@/hooks/useCrashGame';
import { TradingChart } from '@/components/trading/TradingChart';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { GameHistory } from '@/components/crash/GameHistory';
import { ActiveBettorsList } from '@/components/crash/ActiveBettorsList';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { CandlestickCanvas } from '../crash/CandlestickCanvas';
import { LiveCandlestickChart } from '../trading/LiveCandlestickChart';
import { CandlestickGameHistory } from '../crash/CandlestickGameHistory';

export function NewStandardMode() {
  // Connect to crash game WebSocket for real-time game data
  const { status, multiplier, gameId, rugged } = useCrashGame('ws://localhost:8080/ws');

  // Get crash history and active bettors from unified WebSocket
  const { crashHistory, activeBettors } = useWebSocket();

  return (
    // <div className="flex flex-1 overflow-hidden relative">
    //   {/* Main Content - Original UI */}
    //   <div className="flex-1 overflow-y-auto">
    //     <div className="p-6 space-y-6 mx-auto">
    //       {/* Chart */}
    //       <TradingChart />

    //       {/* Game History - replaces latest candles display */}
    //       <GameHistory history={crashHistory} />

    //       {/* Trading Panel */}
    //       <TradingPanel
    //         gameId={gameId}
    //         currentMultiplier={multiplier}
    //         status={status}
    //         isRugged={rugged}
    //       />

          
    //     </div>
    //   </div>
    // </div>
    <div className='w-[calc(100vw-20rem)] overflow-hidden border-t border-white/15'>
      <section>
        <CandlestickGameHistory history={crashHistory || []} />
      </section>
      <div className='bg-linear-180 to-[#121618] from-[#201d1a] border-4 rounded-2xl m-4 border-white/5 h-[30rem] flex items-center justify-center'>
        <LiveCandlestickChart />
      </div>
      {/* Trade Panel Section */}
      <div className='flex items-center justify-center gap-4 mx-4'>
        <div className='h-40 w-[35%] text-xl text-center border border-white/10 rounded-lg'>
          <TradingPanel
            gameId={gameId}
            currentMultiplier={multiplier}
            status={status}
            isRugged={rugged}
          />
        </div>
        <ActiveBettorsList
          bettors={activeBettors}
          currentMultiplier={multiplier}
        />
      </div>
      {/* Live Trader List Section */}
      {/* <div className='bg-[#14141f] border border-white/10 rounded-lg flex items-center justify-center h-full mx-4'> */}
        {/* Active Bettors List - below trading panel */}
      {/* </div> */}
    </div>
  );
}
