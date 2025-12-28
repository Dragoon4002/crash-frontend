/**
 * useGameHouseContract Hook
 *
 * Provides contract interaction methods for GameHouseV2
 * Integrates with Privy wallet for transaction signing
 */

import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import GameHouseV2ABI from '@/contracts/GameHouseV2.json';
import { GAME_HOUSE_V2_CONFIG } from '@/contracts/config';
import type {
  BuyInResult,
  CashOutResult,
  PlaceCandleFlipResult,
  CrashBet,
  CandleFlipGame,
  MultiplierValue,
  EtherValue,
} from '@/contracts/types';

export function useGameHouseContract() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  // Get signer from wallet
  const getSigner = useCallback(async () => {
    if (!authenticated || wallets.length === 0) {
      throw new Error('Wallet not connected');
    }

    const wallet = wallets[0];
    const ethereumProvider = await wallet.getEthereumProvider();

    // Force switch to Mantle Sepolia (Chain ID 5003)
    const targetChainId = '0x138B'; // 5003 in hex
    try {
      // Check current chain
      const currentChainId = await ethereumProvider.request({ method: 'eth_chainId' });
      console.log('📡 Current chain:', currentChainId, 'Target:', targetChainId);

      if (currentChainId !== targetChainId) {
        console.log('🔄 Switching to Mantle Sepolia...');
        try {
          // Try to switch
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          console.log('✅ Switched to Mantle Sepolia');
        } catch (switchError: any) {
          // Chain not added yet, add it
          if (switchError.code === 4902) {
            console.log('➕ Adding Mantle Sepolia to wallet...');
            await ethereumProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChainId,
                chainName: 'Mantle Sepolia',
                nativeCurrency: {
                  name: 'MNT',
                  symbol: 'MNT',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
                blockExplorerUrls: ['https://sepolia.mantlescan.xyz'],
              }],
            });
            console.log('✅ Added and switched to Mantle Sepolia');
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Network switch error:', error);
      throw new Error('Failed to switch to Mantle Sepolia. Please switch manually in your wallet.');
    }

    const provider = new ethers.BrowserProvider(ethereumProvider);
    const signer = await provider.getSigner();

    return signer;
  }, [authenticated, wallets]);

  // Get contract instance
  const getContract = useCallback(async () => {
    const signer = await getSigner();

    return new ethers.Contract(
      GAME_HOUSE_V2_CONFIG.address,
      GameHouseV2ABI.abi,
      signer
    );
  }, [getSigner]);

  // Get read-only contract instance (no signer needed)
  const getReadContract = useMemo(() => {
    const provider = new ethers.JsonRpcProvider(
      GAME_HOUSE_V2_CONFIG.network.rpcUrl
    );

    return new ethers.Contract(
      GAME_HOUSE_V2_CONFIG.address,
      GameHouseV2ABI.abi,
      provider
    );
  }, []);

  /* ======================================
     CRASH GAME FUNCTIONS
  ====================================== */

  /**
   * Buy into a crash game
   * @param gameId Server-generated game ID
   * @param entryMultiplier Multiplier at entry (e.g., 1.5 for 1.5x)
   * @param betAmount Bet amount in MNT (e.g., 0.1)
   */
  const buyIn = useCallback(
    async (
      gameId: number | bigint,
      entryMultiplier: MultiplierValue,
      betAmount: EtherValue
    ): Promise<BuyInResult> => {
      try {
        const contract = await getContract();

        // Convert values
        const gameIdBN = BigInt(gameId);
        const multiplierWei = ethers.parseEther(entryMultiplier.toString());
        const betWei = ethers.parseEther(betAmount.toString());

        console.log('🎮 Buying in:', {
          gameId: gameIdBN.toString(),
          multiplier: entryMultiplier,
          bet: betAmount,
        });

        // Call contract
        const tx = await contract.buyIn(gameIdBN, multiplierWei, {
          value: betWei,
        });

        console.log('📝 Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        console.log('✅ Transaction confirmed:', receipt.hash);

        // Extract betId from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'CrashBuyIn';
          } catch {
            return false;
          }
        });

        let betId: bigint | undefined;
        if (event) {
          const parsed = contract.interface.parseLog(event);
          betId = parsed?.args.betId;
        }

        return {
          success: true,
          transactionHash: receipt.hash,
          betId,
        };
      } catch (error: any) {
        console.error('❌ Buy-in failed:', error);

        // Parse error message
        let errorMsg = 'Transaction failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('MUST_CASHOUT_FIRST')) {
          errorMsg = 'You must cash out your current bet first!';
        } else if (error.message?.includes('GAME_RUGGED')) {
          errorMsg = 'This game has already rugged!';
        } else if (error.message?.includes('insufficient funds')) {
          errorMsg = 'Insufficient MNT balance';
        }

        return {
          success: false,
          error: errorMsg,
        };
      }
    },
    [getContract]
  );

  /**
   * Cash out from a crash game
   * @param gameId Game ID to cash out from
   * @param currentMultiplier Current multiplier (e.g., 3.0)
   */
  const cashOut = useCallback(
    async (
      gameId: number | bigint,
      currentMultiplier: MultiplierValue
    ): Promise<CashOutResult> => {
      try {
        const contract = await getContract();

        const gameIdBN = BigInt(gameId);
        const multiplierWei = ethers.parseEther(currentMultiplier.toString());

        console.log('💰 Cashing out:', {
          gameId: gameIdBN.toString(),
          multiplier: currentMultiplier,
        });

        const tx = await contract.cashOut(gameIdBN, multiplierWei);
        console.log('📝 Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt.hash);

        // Extract payout from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'CrashCashOut';
          } catch {
            return false;
          }
        });

        let payout: bigint | undefined;
        if (event) {
          const parsed = contract.interface.parseLog(event);
          payout = parsed?.args.payout;
        }

        return {
          success: true,
          transactionHash: receipt.hash,
          payout,
        };
      } catch (error: any) {
        console.error('❌ Cash-out failed:', error);

        let errorMsg = 'Cash-out failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('NO_ACTIVE_BET')) {
          errorMsg = 'No active bet found in this game!';
        } else if (error.message?.includes('GAME_RUGGED')) {
          errorMsg = 'Game has already rugged!';
        } else if (error.message?.includes('INVALID_CASHOUT')) {
          errorMsg = 'Invalid cashout multiplier!';
        }

        return {
          success: false,
          error: errorMsg,
        };
      }
    },
    [getContract]
  );

  /* ======================================
     CANDLEFLIP FUNCTIONS
  ====================================== */

  /**
   * Place a CandleFlip game
   * @param betPerRoom Bet amount per room in MNT (e.g., 0.1)
   * @param rooms Number of rooms (e.g., 5)
   */
  const placeCandleFlip = useCallback(
    async (
      betPerRoom: EtherValue,
      rooms: number
    ): Promise<PlaceCandleFlipResult> => {
      try {
        const contract = await getContract();

        const betPerRoomWei = ethers.parseEther(betPerRoom.toString());
        const roomsBN = BigInt(rooms);
        const totalBet = betPerRoomWei * roomsBN;

        console.log('🎲 Placing CandleFlip:', {
          betPerRoom,
          rooms,
          totalBet: ethers.formatEther(totalBet),
        });

        const tx = await contract.placeCandleFlip(betPerRoomWei, roomsBN, {
          value: totalBet,
        });

        console.log('📝 Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt.hash);

        // Extract gameId from event
        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'CandlePlaced';
          } catch {
            return false;
          }
        });

        let gameId: bigint | undefined;
        if (event) {
          const parsed = contract.interface.parseLog(event);
          gameId = parsed?.args.gameId;
        }

        return {
          success: true,
          transactionHash: receipt.hash,
          gameId,
        };
      } catch (error: any) {
        console.error('❌ CandleFlip placement failed:', error);

        let errorMsg = 'Failed to place CandleFlip';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('BAD_VALUE')) {
          errorMsg = 'Payment amount mismatch!';
        } else if (error.message?.includes('ODDS_TOO_LOW')) {
          errorMsg = 'House has insufficient liquidity!';
        } else if (error.message?.includes('insufficient funds')) {
          errorMsg = 'Insufficient MNT balance';
        }

        return {
          success: false,
          error: errorMsg,
        };
      }
    },
    [getContract]
  );

  /* ======================================
     VIEW FUNCTIONS (No transaction)
  ====================================== */

  /**
   * Get player's active crash bet ID for a game
   */
  const getActiveCrashBet = useCallback(
    async (playerAddress: string, gameId: number | bigint): Promise<bigint> => {
      const betId = await getReadContract.getActiveCrashBet(
        playerAddress,
        BigInt(gameId)
      );
      return betId;
    },
    [getReadContract]
  );

  /**
   * Check if a crash game is rugged
   */
  const isGameRugged = useCallback(
    async (gameId: number | bigint): Promise<boolean> => {
      const rugged = await getReadContract.isGameRugged(BigInt(gameId));
      return rugged;
    },
    [getReadContract]
  );

  /**
   * Get crash bet details
   */
  const getCrashBet = useCallback(
    async (betId: number | bigint): Promise<CrashBet> => {
      const bet = await getReadContract.getCrashBet(BigInt(betId));
      return {
        player: bet.player,
        gameId: bet.gameId,
        betAmount: bet.betAmount,
        entryMultiplier: bet.entryMultiplier,
        cashoutMultiplier: bet.cashoutMultiplier,
        state: bet.state,
        payout: bet.payout,
      };
    },
    [getReadContract]
  );

  /**
   * Get CandleFlip game details
   */
  const getCandleGame = useCallback(
    async (gameId: number | bigint): Promise<CandleFlipGame> => {
      const game = await getReadContract.getCandleGame(BigInt(gameId));
      return {
        player: game.player,
        betPerRoom: game.betPerRoom,
        rooms: game.rooms,
        exposure: game.exposure,
        odds: game.odds,
        roomsWon: game.roomsWon,
        state: game.state,
      };
    },
    [getReadContract]
  );

  /**
   * Preview odds for a CandleFlip game
   */
  const previewOdds = useCallback(
    async (betPerRoom: EtherValue, rooms: number): Promise<bigint> => {
      const betPerRoomWei = ethers.parseEther(betPerRoom.toString());
      const roomsBN = BigInt(rooms);
      const odds = await getReadContract.previewOdds(betPerRoomWei, roomsBN);
      return odds;
    },
    [getReadContract]
  );

  /**
   * Get house state
   */
  const getHouseState = useCallback(async () => {
    const [houseBalance, activeExposure, availableBalance] = await Promise.all([
      getReadContract.houseBalance(),
      getReadContract.activeExposure(),
      getReadContract.getAvailableBalance(),
    ]);

    return {
      houseBalance,
      activeExposure,
      availableBalance,
    };
  }, [getReadContract]);

  return {
    // Contract info
    address: GAME_HOUSE_V2_CONFIG.address,
    network: GAME_HOUSE_V2_CONFIG.network,

    // Crash game
    buyIn,
    cashOut,

    // CandleFlip
    placeCandleFlip,

    // View functions
    getActiveCrashBet,
    isGameRugged,
    getCrashBet,
    getCandleGame,
    previewOdds,
    getHouseState,

    // Utilities
    isConnected: authenticated && wallets.length > 0,
  };
}
