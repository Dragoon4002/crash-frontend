/**
 * GameHouseNoSig Contract Configuration
 *
 * Deployed on Mantle Sepolia Testnet
 */

import GameHouseABI from './GameHouseNoSig.json';

export const GAME_HOUSE_CONTRACT = {
  // Contract address on Mantle Sepolia
  address: '0x80Fc067cDDCDE4a78199a7A6751F2f629654b93A' as const,

  // ABI
  abi: GameHouseABI.abi,

  // Network configuration
  network: {
    chainId: 5003,
    name: 'Mantle Sepolia',
    rpcUrl: 'https://rpc.sepolia.mantle.xyz',
    explorerUrl: 'https://sepolia.mantlescan.xyz',
    nativeCurrency: {
      name: 'MNT',
      symbol: 'MNT',
      decimals: 18,
    },
  },
} as const;

// Type helpers
export type GameHouseAddress = typeof GAME_HOUSE_CONTRACT.address;
export type GameHouseNetwork = typeof GAME_HOUSE_CONTRACT.network;
