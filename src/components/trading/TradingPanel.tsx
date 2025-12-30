'use client'

import { useState, useEffect } from 'react';
import { useGameHouseContract } from '@/hooks/useGameHouseContract';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useWallets } from '@privy-io/react-auth';

interface TradingPanelProps {
  gameId: string | null;
  currentMultiplier: number;
  status: string;
  isRugged?: boolean;
}

export function TradingPanel({ gameId, currentMultiplier, status, isRugged = false }: TradingPanelProps) {
  const { placeBet, isConnected } = useGameHouseContract();
  const { requestCashout, activeBettors } = useWebSocket();
  const { wallets } = useWallets();

  const [betAmount, setBetAmount] = useState(0.01);
  const [hasBet, setHasBet] = useState(false);
  const [entryMultiplier, setEntryMultiplier] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const playerAddress = wallets.length > 0 ? wallets[0].address : '';

  // Check if player has active bet by checking activeBettors
  useEffect(() => {
    if (!playerAddress || !gameId) {
      setHasBet(false);
      return;
    }

    const hasActiveBet = activeBettors.some(
      (bettor) => bettor.address.toLowerCase() === playerAddress.toLowerCase()
    );

    if (hasActiveBet && !hasBet) {
      // Player has bet, update entry multiplier
      const playerBet = activeBettors.find(
        (bettor) => bettor.address.toLowerCase() === playerAddress.toLowerCase()
      );
      if (playerBet) {
        setHasBet(true);
        setEntryMultiplier(playerBet.entryMultiplier);
        console.log('✅ Active bet found:', playerBet);
      }
    } else if (!hasActiveBet && hasBet) {
      // Bet was cashed out or game ended
      setHasBet(false);
      setEntryMultiplier(0);
      console.log('🔄 Bet cleared');
    }
  }, [activeBettors, playerAddress, gameId, hasBet]);

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

  // Reset on new game
  useEffect(() => {
    if (status === 'countdown' && hasBet) {
      setHasBet(false);
      setEntryMultiplier(0);
    }
  }, [status, hasBet]);

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
    setBetAmount(0.01);
  };

  const handleQuickAdd = (value: number) => {
    setBetAmount((prev) => prev + value);
  };

  const handleHalf = () => {
    setBetAmount((prev) => Math.max(0.001, prev / 2));
  };

  const handleDouble = () => {
    setBetAmount((prev) => prev * 2);
  };

  const handleBuyIn = async () => {
    if (!gameId || !isConnected || !playerAddress) {
      alert('Wallet not connected or game not started!');
      return;
    }

    if (betAmount <= 0) {
      alert('Please enter a bet amount!');
      return;
    }

    setIsProcessing(true);

    try {
      // Place bet on-chain using V3 contract
      const result = await placeBet(betAmount);

      if (result.success) {
        console.log('✅ Bet placed successfully!');
        console.log('📝 Transaction:', result.transactionHash);

        // Backend will automatically detect BetPlaced event and add to activeBettors
        // Update local state immediately for better UX
        setHasBet(true);
        setEntryMultiplier(currentMultiplier);

        // Optional: Show success message
        // alert(`Bet placed successfully!\nEntry: ${currentMultiplier.toFixed(2)}x`);
      } else {
        alert(`Bet failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Bet error:', error);
      alert('Bet failed!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (!gameId || !hasBet || !playerAddress) return;

    // Prevent cashout if game is rugged
    if (isRugged) {
      alert('⚠️ Game has rugged!\nYour bet is lost. Cannot cash out.');
      return;
    }

    setIsProcessing(true);

    try {
      // Send cashout request via WebSocket
      requestCashout(gameId, playerAddress, currentMultiplier);
      
      console.log('💰 Cashout requested via WebSocket');
      
      // The backend will:
      // 1. Validate the request
      // 2. Call contract.payPlayer(player, payout)
      // 3. Remove from activeBettors
      // 4. Broadcast updated activeBettors list
      
      // Local state will be updated via activeBettors useEffect
    } catch (error) {
      console.error('Cash-out error:', error);
      alert('Cash-out request failed!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Allow buy in during "countdown" (betting phase) or "running" (late buy-in)
  // Don't allow buy-in if game is rugged
  const canBuyIn = (status === 'running' || status === 'countdown') && !hasBet && !isProcessing && isConnected && betAmount > 0 && gameId !== null && gameId !== '' && !isRugged;

  // Disable cashout if game is rugged or crashed
  const canCashOut = status === 'running' && hasBet && !isProcessing && isConnected && !isRugged;

  // Calculate potential payout
  const potentialPayout = hasBet ? (betAmount * currentMultiplier).toFixed(3) : '0.000';

  return (
    <div className="rounded-lg p-3 flex flex-col gap-3">
      {/* Left panel - 2/3 width */}
      <div className="flex-2">
        {/* Top bar with amount and controls */}
        <div className="flex items-center gap-2 rounded-lg p-2">
          {/* Amount input (editable) */}
          <div className="flex items-center gap-2 flex-1">
            <span className="flex items-center gap-2 bg-[#14141f] rounded">
              <input
                type="text"
                value={betAmount.toFixed(3)}
                onChange={handleAmountChange}
                disabled={hasBet}
                className="px-3 py-1.5 max-w-20 text-white text-sm font-mono focus:outline-none focus:border-white/30 bg-transparent disabled:opacity-50"
                placeholder="0.000"
              />
              {/* Reset button (X) */}
              <button
                onClick={handleReset}
                disabled={hasBet}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50"
              >
                ✕
              </button>
            </span>

            {/* Quick add buttons */}
            <button
              onClick={() => handleQuickAdd(0.001)}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              +0.001
            </button>
            <button
              onClick={() => handleQuickAdd(0.01)}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              +0.01
            </button>
            <button
              onClick={() => handleQuickAdd(0.1)}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              +0.1
            </button>
            <button
              onClick={() => handleQuickAdd(1)}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              +1
            </button>

            {/* Fraction buttons */}
            <button
              onClick={handleHalf}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
            >
              1/2
            </button>
            <button
              onClick={handleDouble}
              disabled={hasBet}
              className="bg-[#14141f] border border-white/10 rounded px-2 py-1 text-xs text-gray-300 hover:bg-white/5 disabled:opacity-50"
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
              <div className="text-xs text-gray-400 mt-1">Potential: {potentialPayout} MNT</div>
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