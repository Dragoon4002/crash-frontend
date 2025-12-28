export type TrendType = 'bullish' | 'bearish';
export type GameStatus = 'waiting' | 'countdown' | 'running' | 'finished';
export type WinnerType = 'RED' | 'GREEN' | null;

export interface CandleflipBet {
  amount: number;
  trend: TrendType;
  roomId: string;
}

export interface PriceUpdate {
  tick: number;
  price: number;
}

export interface CandleflipGameState {
  roomId: string;
  gameId: string;
  status: GameStatus;
  serverSeedHash: string;
  serverSeed?: string; // Only revealed after game ends
  startingPrice: number;
  currentPrice: number;
  finalPrice?: number;
  priceHistory: number[];
  countdown: number;
  tick: number;
  totalTicks: number;
  winner?: WinnerType;
  userBet?: {
    amount: number;
    trend: TrendType;
  };
  result?: {
    won: boolean;
    payout: number;
  };
}

export interface CandleflipRoomMessage {
  type: 'game_start' | 'countdown' | 'price_update' | 'game_end';
  data: {
    roomId: string;
    gameId?: string;
    serverSeedHash?: string;
    serverSeed?: string;
    status?: GameStatus;
    countdown?: number;
    tick?: number;
    price?: number;
    finalPrice?: number;
    winner?: WinnerType;
    priceHistory?: number[];
  };
}
