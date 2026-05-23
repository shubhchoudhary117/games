export type GameState = 'waiting' | 'betting' | 'flying' | 'crashed';

export interface BetPanel {
  id: number;
  amount: number;
  isPlacedForNext: boolean;
  isActive: boolean;
  wonThisRound: boolean;
  lastWinAmount: number;
  activeTab: 'bet' | 'auto';
  
  // Auto features
  autoBet: boolean;
  autoCashOut: boolean;
  autoCashOutMultiplier: number;
}

export interface LiveBet {
  user: string;
  amount: number;
  multiplier?: number;
  cashout?: number;
  image?:string
}
