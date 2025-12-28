/**
 * GameHouseV2 Contract Types
 */

// Crash Game Types
export enum CrashBetState {
  ACTIVE = 0,
  CASHED_OUT = 1,
  RUGGED = 2,
}

export interface CrashBet {
  player: string;
  gameId: bigint;
  betAmount: bigint;
  entryMultiplier: bigint;
  cashoutMultiplier: bigint;
  state: CrashBetState;
  payout: bigint;
}

// CandleFlip Types
export enum CandleFlipState {
  PENDING = 0,
  RESOLVED = 1,
}

export interface CandleFlipGame {
  player: string;
  betPerRoom: bigint;
  rooms: bigint;
  exposure: bigint;
  odds: bigint;
  roomsWon: bigint;
  state: CandleFlipState;
}

// Transaction Types
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface BuyInResult extends TransactionResult {
  betId?: bigint;
}

export interface CashOutResult extends TransactionResult {
  payout?: bigint;
}

export interface PlaceCandleFlipResult extends TransactionResult {
  gameId?: bigint;
}

// Event Types
export interface CrashBuyInEvent {
  betId: bigint;
  gameId: bigint;
  player: string;
  amount: bigint;
  entryMultiplier: bigint;
}

export interface CrashCashOutEvent {
  betId: bigint;
  gameId: bigint;
  player: string;
  payout: bigint;
  cashoutMultiplier: bigint;
}

export interface CandlePlacedEvent {
  gameId: bigint;
  player: string;
  betPerRoom: bigint;
  rooms: bigint;
  exposure: bigint;
  odds: bigint;
}

// Helper Types
export type MultiplierValue = number; // Human-readable multiplier (e.g., 1.5, 2.0)
export type MultiplierWei = bigint; // Contract format (e.g., 1500000000000000000)

export type EtherValue = number; // Human-readable ether (e.g., 0.1, 1.5)
export type WeiValue = bigint; // Contract format (e.g., 100000000000000000)
