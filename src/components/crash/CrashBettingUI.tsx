'use client';

import { useState, useEffect } from 'react';
import { useGameHouseContract } from '@/hooks/useGameHouseContract';
import { ethers } from 'ethers';

interface CrashBettingUIProps {
  gameId: string | null;
  currentMultiplier: number;
  status: string;
}

export function CrashBettingUI({ gameId, currentMultiplier, status }: CrashBettingUIProps) {
  const { buyIn, cashOut, getActiveCrashBet, isConnected } = useGameHouseContract();

  const [betAmount, setBetAmount] = useState(0.01);
  const [hasBet, setHasBet] = useState(false);
  const [entryMultiplier, setEntryMultiplier] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if player has active bet
  useEffect(() => {
    async function checkActiveBet() {
      if (!gameId || !isConnected) return;

      try {
        const betId = await getActiveCrashBet(
          window.ethereum?.selectedAddress || '',
          parseInt(gameId, 10)
        );
        setHasBet(betId > BigInt(0));
      } catch (error) {
        console.error('Error checking active bet:', error);
      }
    }

    checkActiveBet();
  }, [gameId, isConnected, getActiveCrashBet]);

  const handleBuyIn = async () => {
    if (!gameId || !isConnected) {
      alert('Wallet not connected or game not started!');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await buyIn(
        parseInt(gameId, 10),
        currentMultiplier, // Entry multiplier
        betAmount
      );

      if (result.success) {
        console.log('✅ Buy-in successful! Bet ID:', result.betId);
        setHasBet(true);
        setEntryMultiplier(currentMultiplier);
        alert(`Buy-in successful!\nBet ID: ${result.betId}\nEntry: ${currentMultiplier.toFixed(2)}x`);
      } else {
        alert(`Buy-in failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Buy-in error:', error);
      alert('Buy-in failed!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (!gameId || !hasBet) return;

    setIsProcessing(true);

    try {
      const result = await cashOut(parseInt(gameId, 10), currentMultiplier);

      if (result.success && result.payout) {
        const payoutMNT = ethers.formatEther(result.payout);
        console.log('✅ Cashed out! Payout:', payoutMNT, 'MNT');
        setHasBet(false);
        alert(`Cashed out!\nPayout: ${payoutMNT} MNT\nMultiplier: ${currentMultiplier.toFixed(2)}x`);
      } else {
        alert(`Cash-out failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Cash-out error:', error);
      alert('Cash-out failed!');
    } finally {
      setIsProcessing(false);
    }
  };

  const canBuyIn = status === 'running' && !hasBet && !isProcessing && isConnected;
  const canCashOut = status === 'running' && hasBet && !isProcessing && isConnected;

  return (
    <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
      {/* Bet Amount Input */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <label className="block text-xs text-gray-400 mb-2">Bet Amount (MNT)</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0.01)}
          disabled={hasBet || isProcessing}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#58a6ff] disabled:opacity-50"
          step="0.01"
          min="0.01"
        />
      </div>

      {/* Buy In Button */}
      {!hasBet && (
        <button
          onClick={handleBuyIn}
          disabled={!canBuyIn}
          className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
            canBuyIn
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Processing...' : `Buy In @ ${currentMultiplier.toFixed(2)}x`}
        </button>
      )}

      {/* Cash Out Button */}
      {hasBet && (
        <div className="flex flex-col gap-2">
          <div className="bg-[#161b22] border border-green-500 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Entry</div>
            <div className="text-lg font-bold text-green-400">{entryMultiplier.toFixed(2)}x</div>
          </div>
          <button
            onClick={handleCashOut}
            disabled={!canCashOut}
            className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              canCashOut
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black animate-pulse'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : `Cash Out @ ${currentMultiplier.toFixed(2)}x`}
          </button>
        </div>
      )}

      {/* Status */}
      {!isConnected && (
        <div className="text-xs text-red-400 text-center">
          Wallet not connected
        </div>
      )}
    </div>
  );
}
