'use client'

import { useState, useEffect } from 'react';
import { useGameHouseContract } from '@/hooks/useGameHouseContract';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { ethers } from 'ethers';

interface TradingPanelProps {
  gameId: string | null;
  currentMultiplier: number;
  status: string;
  isRugged?: boolean;
}

export function TradingPanel({ gameId, currentMultiplier, status, isRugged = false }: TradingPanelProps) {
  const { bet, isConnected, getWalletAddress } = useGameHouseContract();
  const { sendMessage, clientId } = useWebSocket();

  const [betAmount, setBetAmount] = useState(0);
  const [hasBet, setHasBet] = useState(false);
  const [entryMultiplier, setEntryMultiplier] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
      console.warn('Wallet not connected or game not started');
      return;
    }

    if (betAmount <= 0) {
      console.warn('Invalid bet amount');
      return;
    }

    setIsProcessing(true);

    try {
      // Get wallet address
      const playerAddress = await getWalletAddress();
      if (!playerAddress) {
        alert('Failed to get wallet address. Please reconnect your wallet.');
        setIsProcessing(false);
        return;
      }

      // Step 1: Place bet on contract
      console.log('🎲 Placing bet on contract...');
      const betResult = await bet(betAmount);

      if (!betResult.success) {
        alert(`Bet failed: ${betResult.error}`);
        setIsProcessing(false);
        return;
      }

      console.log('✅ Bet placed on contract:', betResult.transactionHash);

      // Step 2: Update local state
      setHasBet(true);
      setEntryMultiplier(currentMultiplier);

      // Step 3: Notify server to add to active bettors list and store in DB
      sendMessage('crash_bet_placed', {
        playerAddress: playerAddress,
        userId: clientId,
        gameId: gameId,
        betAmount: betAmount,
        entryMultiplier: currentMultiplier,
        transactionHash: betResult.transactionHash,
      });

      console.log(`✅ Bet placed at ${currentMultiplier.toFixed(2)}x with ${betAmount} MNT`);
    } catch (error: any) {
      console.error('Buy-in error:', error);
      alert(`Failed to place bet: ${error.message || 'Unknown error'}`);
      setHasBet(false);
      setEntryMultiplier(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (!gameId || !hasBet) return;

    // Prevent cashout if game is rugged
    if (isRugged) {
      console.warn('⚠️ Game has rugged - cannot cash out');
      return;
    }

    setIsProcessing(true);

    try {
      // Get wallet address
      const playerAddress = await getWalletAddress();
      if (!playerAddress) {
        alert('Failed to get wallet address.');
        setIsProcessing(false);
        return;
      }

      // Send cashout request to server
      // Server will calculate payout and call payPlayer contract function
      sendMessage('crash_cashout', {
        playerAddress: playerAddress,
        userId: clientId,
        gameId: gameId,
        cashoutMultiplier: currentMultiplier,
        betAmount: betAmount,
        entryMultiplier: entryMultiplier,
      });

      console.log(`📤 Cashout request sent at ${currentMultiplier.toFixed(2)}x`);

      // Update local state immediately (server will confirm)
      setHasBet(false);
      setEntryMultiplier(0);
    } catch (error: any) {
      console.error('Cash-out error:', error);
      alert(`Failed to cash out: ${error.message || 'Unknown error'}`);
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
          <div className="space-y-2">
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

            {/* Disabled reason messages */}
            {!canBuyIn && (
              <div className="text-xs text-center mt-2">
                {!isConnected && (
                  <span className="text-red-400">🔒 Wallet not connected</span>
                )}
                {isConnected && betAmount <= 0 && (
                  <span className="text-yellow-400">⚠️ Enter bet amount</span>
                )}
                {isConnected && betAmount > 0 && status === 'connecting' && (
                  <span className="text-blue-400">⏳ Connecting to game...</span>
                )}
                {isConnected && betAmount > 0 && status === 'crashed' && (
                  <span className="text-gray-400">⏸️ Game ended - wait for next round</span>
                )}
                {isConnected && betAmount > 0 && (!gameId || gameId === '') && (
                  <span className="text-gray-400">⏸️ Waiting for game to start...</span>
                )}
                {isConnected && betAmount > 0 && hasBet && (
                  <span className="text-gray-400">✅ Already placed bet</span>
                )}
                {isRugged && (
                  <span className="text-red-500">⚠️ Game rugged</span>
                )}
              </div>
            )}
          </div>
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

            {/* Cashout disabled reasons */}
            {!canCashOut && hasBet && (
              <div className="text-xs text-center mt-2">
                {isRugged && (
                  <span className="text-red-500 font-bold">⚠️ GAME RUGGED - Bet lost</span>
                )}
                {!isRugged && status === 'crashed' && (
                  <span className="text-orange-400">💥 Game crashed - Bet lost</span>
                )}
                {!isRugged && status === 'countdown' && (
                  <span className="text-gray-400">⏸️ Game not started yet</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
