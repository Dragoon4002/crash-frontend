/**
 * GameHouseV2 Contract Configuration
 *
 * Deployed on Mantle Sepolia Testnet
 */

export const GAME_HOUSE_V2_CONFIG = {
  // Contract address on Mantle Sepolia (Updated with gasless cashout support)
  address: '0x43a01A18a2C947179595A7b17bDCc3d88ecF04F5' as const,

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

  // Contract configuration
  minOdds: '1200000000000000000', // 1.2x (updated)
  baseOdds: '2000000000000000000', // 2.0x
  reserveGames: 20,
} as const;

// Type helpers
export type GameHouseV2Address = typeof GAME_HOUSE_V2_CONFIG.address;
export type GameHouseV2Network = typeof GAME_HOUSE_V2_CONFIG.network;
