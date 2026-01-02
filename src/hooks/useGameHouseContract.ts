/**
 * useGameHouseContract Hook
 *
 * Provides contract interaction methods for GameHouseNoSig
 * Integrates with Privy wallet for transaction signing
 */

import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { GAME_HOUSE_CONTRACT } from '@/contracts/config';

export interface BetResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface HouseState {
  houseBalance: bigint;
  minLiquidity: bigint;
  maxPayoutPerTx: bigint;
  paused: boolean;
}

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
      GAME_HOUSE_CONTRACT.address,
      GAME_HOUSE_CONTRACT.abi,
      signer
    );
  }, [getSigner]);

  // Get read-only contract instance (no signer needed)
  const getReadContract = useMemo(() => {
    const provider = new ethers.JsonRpcProvider(
      GAME_HOUSE_CONTRACT.network.rpcUrl
    );

    return new ethers.Contract(
      GAME_HOUSE_CONTRACT.address,
      GAME_HOUSE_CONTRACT.abi,
      provider
    );
  }, []);

  /**
   * Place a bet by sending MNT to the contract
   * @param betAmount Bet amount in MNT (e.g., 0.1)
   */
  const bet = useCallback(
    async (betAmount: number | string): Promise<BetResult> => {
      try {
        const contract = await getContract();

        const betWei = ethers.parseEther(betAmount.toString());

        console.log('🎮 Placing bet:', {
          amount: betAmount,
          wei: betWei.toString(),
        });

        // Call contract bet() function
        const tx = await contract.bet({
          value: betWei,
        });

        console.log('📝 Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        console.log('✅ Transaction confirmed:', receipt.hash);

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } catch (error: any) {
        console.error('❌ Bet failed:', error);

        // Parse error message
        let errorMsg = 'Transaction failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('Paused')) {
          errorMsg = 'Contract is paused';
        } else if (error.message?.includes('ZeroValue')) {
          errorMsg = 'Bet amount must be greater than 0';
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
   * Fund the house (owner only)
   * @param amount Amount in MNT
   */
  const fundHouse = useCallback(
    async (amount: number | string): Promise<BetResult> => {
      try {
        const contract = await getContract();
        const amountWei = ethers.parseEther(amount.toString());

        console.log('💰 Funding house:', amount, 'MNT');

        const tx = await contract.fundHouse({
          value: amountWei,
        });

        console.log('📝 Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt.hash);

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } catch (error: any) {
        console.error('❌ Fund house failed:', error);

        let errorMsg = 'Failed to fund house';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('ZeroValue')) {
          errorMsg = 'Amount must be greater than 0';
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
   * Get house state (read-only)
   */
  const getHouseState = useCallback(async (): Promise<HouseState> => {
    const [houseBalance, minLiquidity, maxPayoutPerTx, paused] = await Promise.all([
      getReadContract.houseBalance(),
      getReadContract.minLiquidity(),
      getReadContract.maxPayoutPerTx(),
      getReadContract.paused(),
    ]);

    return {
      houseBalance,
      minLiquidity,
      maxPayoutPerTx,
      paused,
    };
  }, [getReadContract]);

  /**
   * Pay out winnings to a player (server only)
   * This should be called from the backend
   * @param playerAddress Address of the player
   * @param payoutAmount Amount to pay in MNT
   */
  const payPlayer = useCallback(
    async (playerAddress: string, payoutAmount: number | string): Promise<BetResult> => {
      try {
        const contract = await getContract();
        const payoutWei = ethers.parseEther(payoutAmount.toString());

        console.log('💰 Paying player:', {
          address: playerAddress,
          amount: payoutAmount,
          wei: payoutWei.toString(),
        });

        const tx = await contract.payPlayer(playerAddress, payoutWei);

        console.log('📝 Payout transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Payout confirmed:', receipt.hash);

        return {
          success: true,
          transactionHash: receipt.hash,
        };
      } catch (error: any) {
        console.error('❌ Payout failed:', error);

        let errorMsg = 'Payout failed';
        if (error.code === 'ACTION_REJECTED') {
          errorMsg = 'User rejected transaction';
        } else if (error.message?.includes('NotServer')) {
          errorMsg = 'Only server can pay players';
        } else if (error.message?.includes('Insolvent')) {
          errorMsg = 'Insufficient house balance';
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
   * Get current user's wallet address
   */
  const getWalletAddress = useCallback(async (): Promise<string | null> => {
    if (!authenticated || wallets.length === 0) {
      return null;
    }

    const wallet = wallets[0];
    return wallet.address;
  }, [authenticated, wallets]);

  return {
    // Contract info
    address: GAME_HOUSE_CONTRACT.address,
    network: GAME_HOUSE_CONTRACT.network,

    // Main functions
    bet,
    payPlayer,
    fundHouse,

    // View functions
    getHouseState,
    getWalletAddress,

    // Utilities
    isConnected: authenticated && wallets.length > 0,
  };
}
