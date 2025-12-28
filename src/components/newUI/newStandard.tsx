'use client'

import { useCrashGame } from '@/hooks/useCrashGame';
import { TradingChart } from '@/components/trading/TradingChart';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { GameHistory } from '@/components/crash/GameHistory';
import { ActiveBettorsList } from '@/components/crash/ActiveBettorsList';
import { useWebSocket } from '@/contexts/WebSocketContext';

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
    <div>
      <div className='bg-linear-180 to-[#121618] from-[#201d1a] border-4 rounded-2xl m-4 border-white/5 h-[30rem] flex items-center justify-center'>
        <h2 className='text-white text-xl'>Trade Chart Section</h2>
      </div>
      {/* Trade Panel Section */}
      <div className='flex items-center justify-center'>
        <div className='h-40 m-4 w-[35%] text-xl text-center mt-0 border border-white/10 rounded-lg '>
          <TradingPanel 
            gameId={gameId}
            currentMultiplier={multiplier}
            status={status}
            isRugged={rugged}
          />
        </div>
        <div className='h-40 m-4 w-[75%] text-xl text-center mt-0 border border-white/10 rounded-lg '>History Panel Section</div>
      </div>
      {/* Live Trader List Section */}
      {/* <div className='bg-[#14141f] border border-white/10 rounded-lg flex items-center justify-center h-full mx-4'> */}
        {/* Active Bettors List - below trading panel */}
          <ActiveBettorsList
            bettors={activeBettors}
            currentMultiplier={multiplier}
          />
      {/* </div> */}
    </div>
  );
}
