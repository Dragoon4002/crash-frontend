/**
 * GameHouseV2 Contract Configuration
 *
 * Deployed on Mantle Sepolia Testnet
 */

export const GAME_HOUSE_V2_CONFIG = {
  // Contract address on Mantle Sepolia (Updated with gasless cashout support)
  address: process.env.CONTRACT_ADDRESS || "0x80Fc067cDDCDE4a78199a7A6751F2f629654b93A" as const, //Address updated

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
