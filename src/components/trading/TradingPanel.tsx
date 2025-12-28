'use client'

import { useState, useEffect } from 'react';
import { useGameHouseContract } from '@/hooks/useGameHouseContract';
import { ethers } from 'ethers';

interface TradingPanelProps {
  gameId: string | null;
  currentMultiplier: number;
  status: string;
  isRugged?: boolean;
}

export function TradingPanel({ gameId, currentMultiplier, status, isRugged = false }: TradingPanelProps) {
  const { buyIn, cashOut, getActiveCrashBet, isConnected } = useGameHouseContract();

  const [betAmount, setBetAmount] = useState(0);
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

  // Reset bet state when game gets rugged or crashes
  useEffect(() => {
    if ((isRugged || status === 'crashed') && hasBet) {
      // Clear bet state after a short delay so user can see the result
      const timer = setTimeout(() => {
        setHasBet(false);
        setEntryMultiplier(0);
        console.log('🔄 Bet cleared due to game ending');
      }, 3000); // 3 second delay to show result

      return () => clearTimeout(timer);
    }
  }, [isRugged, status, hasBet]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or valid decimal numbers
    if (value === '') {
      setBetAmount(0);
    } else if (/^\d*\.?\d{0,3}$/.test(value)) {
      // Allow up to 3 decimal places
      setBetAmount(parseFloat(value) || 0);
    }
  };

  const handleReset = () => {
    setBetAmount(0);
  };

  const handleQuickAdd = (value: number) => {
    setBetAmount((prev) => prev + value);
  };

  const handleHalf = () => {
    setBetAmount((prev) => prev / 2);
  };

  const handleDouble = () => {
    setBetAmount((prev) => prev * 2);
  };

  const handleBuyIn = async () => {
    if (!gameId || !isConnected) {
      alert('Wallet not connected or game not started!');
      return;
    }

    if (betAmount <= 0) {
      alert('Please enter a bet amount!');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await buyIn(
        parseInt(gameId, 10),
        currentMultiplier,
        betAmount
      );

      if (result.success) {
        console.log('✅ Buy-in successful! Bet ID:', result.betId);

        // Immediately update local state
        setHasBet(true);
        setEntryMultiplier(currentMultiplier);

        // Notify server about new active bettor
        try {
          const playerAddress = window.ethereum?.selectedAddress || '';
          await fetch('http://localhost:8080/api/bettor/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: playerAddress,
              betAmount: betAmount,
              multiplier: currentMultiplier,
            }),
          });
          console.log('✅ Server notified of new bettor');
        } catch (error) {
          console.error('⚠️ Failed to notify server:', error);
        }

        alert(`Buy-in successful!\nBet ID: ${result.betId}\nEntry: ${currentMultiplier.toFixed(2)}x`);

        // Verify contract state after short delay
        setTimeout(async () => {
          try {
            const betId = await getActiveCrashBet(
              window.ethereum?.selectedAddress || '',
              parseInt(gameId, 10)
            );
            setHasBet(betId > BigInt(0));
            console.log('✅ Contract state verified: hasBet =', betId > BigInt(0));
          } catch (error) {
            console.error('Error verifying bet state:', error);
          }
        }, 1000);
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

    // Prevent cashout if game is rugged
    if (isRugged) {
      alert('⚠️ Game has rugged!\nYour bet is lost. Cannot cash out.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await cashOut(parseInt(gameId, 10), currentMultiplier);

      if (result.success && result.payout) {
        const payoutMNT = ethers.formatEther(result.payout);
        console.log('✅ Cashed out! Payout:', payoutMNT, 'MNT');

        // Immediately update local state
        setHasBet(false);
        setEntryMultiplier(0);

        // Notify server to remove active bettor
        try {
          const playerAddress = window.ethereum?.selectedAddress || '';
          await fetch('http://localhost:8080/api/bettor/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: playerAddress,
            }),
          });
          console.log('✅ Server notified of bettor cashout');
        } catch (error) {
          console.error('⚠️ Failed to notify server:', error);
        }

        alert(`Cashed out!\nPayout: ${payoutMNT} MNT\nMultiplier: ${currentMultiplier.toFixed(2)}x`);

        // Verify contract state after short delay
        setTimeout(async () => {
          try {
            const betId = await getActiveCrashBet(
              window.ethereum?.selectedAddress || '',
              parseInt(gameId, 10)
            );
            setHasBet(betId > BigInt(0));
            console.log('✅ Contract state verified: hasBet =', betId > BigInt(0));
          } catch (error) {
            console.error('Error verifying bet state:', error);
          }
        }, 1000);
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

  // Allow buy in during "countdown" (betting phase) or "running" (late buy-in)
  // Don't allow buy-in if game is rugged
  const canBuyIn = (status === 'running' || status === 'countdown') && !hasBet && !isProcessing && isConnected && betAmount > 0 && gameId !== null && gameId !== '' && !isRugged;

  // Disable cashout if game is rugged or crashed
  const canCashOut = status === 'running' && hasBet && !isProcessing && isConnected && !isRugged;

  // Debug logging
  console.log('TradingPanel Debug:', {
    status,
    hasBet,
    isProcessing,
    isConnected,
    betAmount,
    isRugged,
    canBuyIn,
    canCashOut,
    currentMultiplier,
    gameId
  });

  return (
    <div className="rounded-lg p-3 flex flex-col gap-3">
      {/* Left panel - 2/3 width */}
      <div className="flex-2">
        {/* Top bar with amount and controls */}
        <div className="flex items-center gap-2 rounded-lg p-2">
          {/* Amount input (editable) */}
          <div className="flex items-center gap-2 flex-1">
          <span className="flex items-center gap-2 bg-[#
          ] rounded">
            <input
              type="text"
              value={betAmount.toFixed(3)}
              onChange={handleAmountChange}
              className="px-3 py-1.5 min-w-16 text-white text-sm font-mono focus:outline-none focus:border-white/30"
              placeholder="0.000"
            />
            {/* Reset button (X) */}
            <button
              onClick={handleReset}
              className=" px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/5"
            >
              ✕
            </button>
          </span>

          {/* Quick add buttons */}
          <button
            onClick={() => handleQuickAdd(0.001)}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            +0.001
          </button>
          <button
            onClick={() => handleQuickAdd(0.01)}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            +0.01
          </button>
          <button
            onClick={() => handleQuickAdd(0.1)}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            +0.1
          </button>
          <button
            onClick={() => handleQuickAdd(1)}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            +1
          </button>

          {/* Fraction buttons */}
          <button
            onClick={handleHalf}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            1/2
          </button>
          <button
            onClick={handleDouble}
            className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5"
          >
            X2
          </button>
        </div>
        </div>
      </div>

      {/* Right side - Buy/Sell buttons - 1/3 width */}
      <div className="flex-1 flex flex-col justify-center">
        {!hasBet ? (
          <button
            onClick={handleBuyIn}
            disabled={!canBuyIn}
            className={`w-full py-4 rounded-lg font-bold text-sm transition-all ${
              canBuyIn
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : `BUY @ ${currentMultiplier.toFixed(2)}x`}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-[#14141f] border border-green-500 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">Entry</div>
              <div className="text-lg font-bold text-green-400">{entryMultiplier.toFixed(2)}x</div>
            </div>
            <button
              onClick={handleCashOut}
              disabled={!canCashOut}
              className={`w-full py-4 rounded-lg font-bold text-sm transition-all ${
                canCashOut
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black animate-pulse'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing
                ? 'Processing...'
                : isRugged
                ? 'RUGGED'
                : status === 'crashed'
                ? 'CRASHED'
                : `SELL @ ${currentMultiplier.toFixed(2)}x`}
            </button>
          </div>
        )}

        {/* Status messages */}
        {!isConnected && (
          <div className="text-xs text-red-400 text-center mt-2">
            Wallet not connected
          </div>
        )}
        {isRugged && (
          <div className="text-xs text-red-500 font-bold text-center mt-2 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
            ⚠️ GAME RUGGED - Cannot cashout
          </div>
        )}
        {status === 'crashed' && !isRugged && hasBet && (
          <div className="text-xs text-orange-400 text-center mt-2">
            Game crashed - Bet lost
          </div>
        )}
      </div>
    </div>
  );
}
