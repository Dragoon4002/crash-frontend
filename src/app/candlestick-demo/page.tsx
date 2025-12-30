'use client';

import { LiveCandlestickChart } from '@/components/trading/LiveCandlestickChart';
import { CandlestickGameHistory } from '@/components/crash/CandlestickGameHistory';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useState } from 'react';

export default function CandlestickDemoPage() {
  const { crashHistory } = useWebSocket();
  const [selectedGame, setSelectedGame] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Candlestick Chart Demo
          </h1>
          <p className="text-gray-400">
            Live trading chart with real-time candle updates
          </p>
        </div>

        {/* Live Chart */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Live Trading Chart
          </h2>
          <LiveCandlestickChart />
        </section>

        {/* Game History */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">
            Game History
          </h2>
          <CandlestickGameHistory history={crashHistory || []} />
        </section>
      </div>
    </div>
  );
}
