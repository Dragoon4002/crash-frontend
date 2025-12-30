'use client';

import { useState, useEffect } from 'react';
import { CandleflipRoomCard } from '@/components/candleflip/CandleflipRoomCard';
import { TrendType } from '@/types/candleflip';
import { TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useGameHouseContract } from '@/hooks/useGameHouseContract';
import { ethers } from 'ethers';

export function CandleflipMode() {
  const { rooms, isConnected, clientId, createCandleflipBatch } = useWebSocket();
  const { placeCandleFlip, isConnected: walletConnected } = useGameHouseContract();

  const [betAmount, setBetAmount] = useState<number>(0.01);
  const [numberOfRooms, setNumberOfRooms] = useState<number>(1);
  const [trend, setTrend] = useState<TrendType>('bullish');
  const [balance] = useState<number>(10.0); // Mock balance - replace with real wallet balance
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    // Subscribe to rooms channel to see all active rooms
    // Individual room subscriptions happen in CandleflipRoomCard
  }, []);

  const quickAmounts = [0.01, 0.1, 0.5, 1, 5];

  const handleVerify = (gameId: string, serverSeed: string) => {
    console.log('Verify game:', gameId, serverSeed);
    // TODO: Implement verification modal
  };

  const handleCreateRooms = async () => {
    if (!canPlaceBet || !isConnected || !walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsPlacing(true);

    try {
      // Step 1: Call smart contract to place bet
      const result = await placeCandleFlip(betAmount, numberOfRooms);

      if (!result.success) {
        alert(`Failed to place CandleFlip: ${result.error}`);
        setIsPlacing(false);
        return;
      }

      console.log('✅ CandleFlip bet placed! TX:', result.transactionHash);

      // Step 2: Create batch on server via WebSocket
      // Server will handle the game logic and payouts
      const amountPerRoomWei = ethers.parseEther(betAmount.toString()).toString();
      const side = trend === 'bullish' ? 'bull' : 'bear';

      // Get user's wallet address from contract hook
      const { wallets } = await import('@privy-io/react-auth').then(m => m.useWallets());
      const userAddress = wallets[0]?.address || clientId;

      createCandleflipBatch(
        userAddress,
        numberOfRooms,
        amountPerRoomWei,
        side
      );

      console.log('📡 Sent batch creation request to server');
      alert(`CandleFlip created! ${numberOfRooms} room(s) @ ${betAmount} MNT each\nTX: ${result.transactionHash}`);
    } catch (error) {
      console.error('Error placing CandleFlip:', error);
      alert('Failed to place CandleFlip!');
    } finally {
      setIsPlacing(false);
    }
  };

  const canPlaceBet = betAmount * numberOfRooms <= balance;

  // Filter for candleflip rooms from unified WebSocket
  const candleflipRooms = rooms.filter(room => room.gameType === 'candleflip');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Betting Controls Navbar */}
      <div className="bg-[#161b22] border-b border-[#30363d] shrink-0">
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Bet Amount */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Bet Amount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#58a6ff] text-white"
                  step="0.01"
                  min="0.01"
                />
                <span className="text-sm text-gray-400">MNT</span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    betAmount === amount
                      ? 'bg-[#58a6ff] text-white'
                      : 'bg-[#0d1117] text-gray-400 hover:bg-[#1f2428] border border-[#30363d]'
                  }`}
                >
                  {amount}
                </button>
              ))}
              <button
                onClick={() => setBetAmount(betAmount * 2)}
                className="p-1.5 bg-[#0d1117] border border-[#30363d] rounded hover:bg-[#1f2428] text-gray-400"
                title="Double"
              >
                ×2
              </button>
              <button
                onClick={() => setBetAmount(Math.max(0.01, betAmount / 2))}
                className="p-1.5 bg-[#0d1117] border border-[#30363d] rounded hover:bg-[#1f2428] text-gray-400"
                title="Half"
              >
                ÷2
              </button>
              <button
                onClick={() => setBetAmount(balance)}
                className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs font-medium hover:bg-[#1f2428] text-gray-400"
                title="Max"
              >
                MAX
              </button>
            </div>

            <div className="h-6 w-px bg-[#30363d]"></div>

            {/* Trend Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Trend</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setTrend('bullish')}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                    trend === 'bullish'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                      : 'bg-[#0d1117] text-gray-400 hover:bg-[#1f2428] border border-[#30363d]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Bullish
                </button>
                <button
                  onClick={() => setTrend('bearish')}
                  className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
                    trend === 'bearish'
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                      : 'bg-[#0d1117] text-gray-400 hover:bg-[#1f2428] border border-[#30363d]'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Bearish
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-[#30363d]"></div>

            {/* Number of Rooms */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Rooms</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNumberOfRooms(Math.max(1, numberOfRooms - 1))}
                  className="p-1.5 bg-[#0d1117] border border-[#30363d] rounded hover:bg-[#1f2428]"
                >
                  <Minus className="w-4 h-4 text-gray-400" />
                </button>
                <div className="w-16 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-center text-sm font-mono text-white">
                  {numberOfRooms}
                </div>
                <button
                  onClick={() => setNumberOfRooms(Math.min(10, numberOfRooms + 1))}
                  className="p-1.5 bg-[#0d1117] border border-[#30363d] rounded hover:bg-[#1f2428]"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-[#30363d]"></div>

            {/* Total Bet & Balance */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-sm">
                <span className="text-gray-400">Total Bet: </span>
                <span className="font-mono font-bold text-white">{(betAmount * numberOfRooms).toFixed(3)} MNT</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Balance: </span>
                <span className="font-mono font-bold text-[#ffd700]">{balance.toFixed(3)} MNT</span>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateRooms}
                disabled={!canPlaceBet || !isConnected || !walletConnected || isPlacing}
                className={`px-6 py-2.5 rounded-lg font-bold transition-all ${
                  canPlaceBet && isConnected && walletConnected && !isPlacing
                    ? 'bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#0d1117] hover:shadow-lg hover:shadow-[#ffd700]/50'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPlacing ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>

          {/* Warning if insufficient balance */}
          {!canPlaceBet && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
              ⚠️ Insufficient balance. Total bet ({(betAmount * numberOfRooms).toFixed(3)} MNT) exceeds balance.
            </div>
          )}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-300">
              Open Lobbies <span className="text-[#58a6ff]">{candleflipRooms.length}</span>
            </h2>
            {!isConnected && (
              <p className="text-sm text-red-400">
                Connecting to server...
              </p>
            )}
            {isConnected && candleflipRooms.length === 0 && (
              <p className="text-sm text-gray-500">
                Configure your bet and click "Create" to start playing
              </p>
            )}
          </div>

          {candleflipRooms.length === 0 ? (
            <div className="flex items-center justify-center h-64 bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-gray-400 text-lg mb-2">No active rooms</p>
                <p className="text-gray-500 text-sm">
                  {isConnected
                    ? "Set your bet amount and click \"Create\" to start"
                    : "Connecting to server..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {candleflipRooms.map((room) => (
                <CandleflipRoomCard
                  key={room.roomId}
                  roomId={room.roomId}
                  betAmount={room.betAmount}
                  trend={(room.trend as TrendType) || 'bullish'}
                  onVerify={handleVerify}
                  onFinished={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}