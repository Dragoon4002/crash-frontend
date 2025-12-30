/**
 * useGameHouseContract Hook - V3 Integration
 *
 * Provides contract interaction methods for GameHouseV3 (NoSig)
 * Integrates with Privy wallet for transaction signing
 */

import { useCallback, useMemo, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import GameHouseV3ABI from '@/contracts/GameHouseNoSig.json';
import { GAME_HOUSE_V2_CONFIG } from '@/contracts/config';
import type {
  BuyInResult,
  EtherValue,
} from '@/contracts/types';

export function useGameHouseContract() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const cachedContractRef = useRef<ethers.Contract | null>(null);
  const isInitializingRef = useRef(false);
  const walletAddressRef = useRef<string>('');

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
      const currentChainId = await ethereumProvider.request({ method: 'eth_chainId' });

      if (currentChainId !== targetChainId) {
        console.log('🔄 Switching to Mantle Sepolia...');
        try {
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
          console.log('✅ Switched to Mantle Sepolia');
        } catch (switchError: any) {
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
      throw new Error('Failed to switch to Mantle Sepolia');
    }

    const provider = new ethers.BrowserProvider(ethereumProvider);
    const signer = await provider.getSigner();

    return signer;
  }, [authenticated, wallets]);

  // Initialize contract
  const initializeContract = useCallback(async () => {
    if (!authenticated || wallets.length === 0) {
      throw new Error('Wallet not connected');
    }

    const currentAddress = wallets[0].address;

    if (currentAddress === walletAddressRef.current && cachedContractRef.current) {
      return cachedContractRef.current;
    }

    if (isInitializingRef.current) {
      while (isInitializingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      if (cachedContractRef.current) {
        return cachedContractRef.current;
      }
    }

    isInitializingRef.current = true;
    try {
      const signer = await getSigner();
      const contract = new ethers.Contract(
        GAME_HOUSE_V2_CONFIG.address,
        GameHouseV3ABI.abi,
        signer
      );

      cachedContractRef.current = contract;
      walletAddressRef.current = currentAddress;
      console.log('✅ Contract instance cached for:', currentAddress);

      return contract;
    } finally {
      isInitializingRef.current = false;
    }
  }, [authenticated, wallets, getSigner]);

  // Auto-initialize on wallet connect
  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      initializeContract().catch(err => {
        console.error('Auto-initialization failed:', err);
      });
    } else {
      cachedContractRef.current = null;
      walletAddressRef.current = '';
    }
  }, [authenticated, wallets, initializeContract]);

  // Get contract instance
  const getContract = useCallback(async () => {
    if (cachedContractRef.current) {
      return cachedContractRef.current;
    }
    return await initializeContract();
  }, [initializeContract]);

  // Get read-only contract instance
  const getReadContract = useMemo(() => {
    const provider = new ethers.JsonRpcProvider(
      GAME_HOUSE_V2_CONFIG.network.rpcUrl
    );

    return new ethers.Contract(
      GAME_HOUSE_V2_CONFIG.address,
      GameHouseV3ABI.abi,
      provider
    );
  }, []);

  /* ======================================
     V3 CONTRACT FUNCTIONS
  ====================================== */

  /**
   * Place a bet using the generic bet() function
   * Used for ALL games (Crash, CandleFlip, etc.)
   * @param betAmount Total bet amount in MNT (e.g., 0.1)
   */
  const placeBet = useCallback(
    async (betAmount: EtherValue): Promise<BuyInResult> => {
      try {
        const contract = await getContract();
        const betWei = ethers.parseEther(betAmount.toString());

        console.log('🎮 Placing bet:', { bet: betAmount, wei: betWei.toString() });

        // Call contract bet() function
        const tx = await contract.bet({ value: betWei });

        console.log('📝 Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        console.log('✅ Transaction confirmed:', receipt.hash);

        // Parse BetPlaced event
        const betPlacedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'BetPlaced';
          } catch {
            return false;
          }
        });

        if (betPlacedEvent) {
          const parsed = contract.interface.parseLog(betPlacedEvent);
          console.log('💰 Bet placed by:', parsed?.args.player, 'Amount:', ethers.formatEther(parsed?.args.amount));
        }

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } catch (error: any) {
        console.error('❌ Bet failed:', error);

        let errorMsg = 'Transaction failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('Paused')) {
          errorMsg = 'Contract is paused';
        } else if (error.message?.includes('ZeroValue')) {
          errorMsg = 'Bet amount must be greater than zero';
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
   * Place a CandleFlip bet (wrapper around placeBet)
   * @param betAmount Bet amount per room in MNT
   * @param numberOfRooms Number of rooms to create
   */
  const placeCandleFlip = useCallback(
    async (betAmount: EtherValue, numberOfRooms: number): Promise<BuyInResult> => {
      const totalBet = betAmount * numberOfRooms;
      return await placeBet(totalBet);
    },
    [placeBet]
  );

  /**
   * Fund the house (only for house owner/funders)
   * @param amount Amount to fund in MNT
   */
  const fundHouse = useCallback(
    async (amount: EtherValue): Promise<BuyInResult> => {
      try {
        const contract = await getContract();
        const amountWei = ethers.parseEther(amount.toString());

        console.log('💵 Funding house:', { amount, wei: amountWei.toString() });

        const tx = await contract.fundHouse({ value: amountWei });
        console.log('📝 Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('✅ House funded:', receipt.hash);

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } catch (error: any) {
        console.error('❌ Fund house failed:', error);

        let errorMsg = 'Funding failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
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
     VIEW FUNCTIONS
  ====================================== */

  /**
   * Get house balance and state
   */
  const getHouseState = useCallback(async () => {
    try {
      const houseBalance = await getReadContract.houseBalance();
      const paused = await getReadContract.paused();
      const owner = await getReadContract.owner();
      const server = await getReadContract.server();

      return {
        houseBalance,
        paused,
        owner,
        server,
      };
    } catch (error) {
      console.error('❌ Failed to get house state:', error);
      throw error;
    }
  }, [getReadContract]);

  /**
   * Get contract configuration
   */
  const getContractConfig = useCallback(async () => {
    try {
      const minLiquidity = await getReadContract.minLiquidity();
      const maxPayoutPerTx = await getReadContract.maxPayoutPerTx();

      return {
        minLiquidity,
        maxPayoutPerTx,
      };
    } catch (error) {
      console.error('❌ Failed to get contract config:', error);
      throw error;
    }
  }, [getReadContract]);

  return {
    // Contract info
    address: GAME_HOUSE_V2_CONFIG.address,
    network: GAME_HOUSE_V2_CONFIG.network,

    // V3 Functions
    placeBet,
    placeCandleFlip, // Convenience wrapper
    fundHouse,

    // View functions
    getHouseState,
    getContractConfig,

    // Utilities
    isConnected: authenticated && wallets.length > 0,
  };
}