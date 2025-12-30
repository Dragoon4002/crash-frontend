/**
 * GameHouseV3 Contract Types (NoSig Version)
 */

// Transaction Types
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface BuyInResult extends TransactionResult {
  betId?: bigint;
}

export interface PlaceCandleFlipResult extends TransactionResult {
  gameId?: bigint;
}

// Helper Types
export type EtherValue = number; // Human-readable ether (e.g., 0.1, 1.5)
export type WeiValue = bigint; // Contract format (e.g., 100000000000000000)

// REMOVED: CrashBet, CandleFlipGame, CashOutResult, MultiplierValue
// V3 contract has no game state storage or view functions