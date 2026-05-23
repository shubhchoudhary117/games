export interface SlotSymbol {
  id: string;
  emoji: string;
  weight: number;
  payout: Record<number, number>;
}

export interface EvaluateResult {
  totalWin: number;
  winCells: [number, number][];
}

export type GamePhase = 'idle' | 'spinning' | 'result';