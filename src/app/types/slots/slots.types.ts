// types.ts
export interface SlotProps {
  userId: string;
  betAmount: number;
  gridState: string[];
  lastSpinResult: SpinResultItem[];
  manekiNekoFeature: boolean;
  totalPayout: number;
  winSymbol?:string,
  multiplier?:number
}

export interface SpinResultItem {
  line: string;
  symbols: string[];
  payout: number;
}