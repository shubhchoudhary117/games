// src/app/models/roulette.models.ts

export const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

export const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

export const TABLE_ROWS: number[][] = [
  [3,6,9,12,15,18,21,24,27,30,33,36],
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34],
];

export const STARTING_BALANCE = 100000;
export const TIMER_TOTAL = 14;

export type NumberColor = 'red' | 'black' | 'green';

export function numColor(n: number): NumberColor {
  return n === 0 ? 'green' : RED_NUMS.has(n) ? 'red' : 'black';
}

export function formatNum(n: number): string {
  return n.toLocaleString('en-IN');
}

export function chipBg(v: number): string {
  return v >= 25000 ? '#dc2626'
    : v >= 10000 ? '#16a34a'
    : v >= 5000  ? '#2563eb'
    : v >= 1000  ? '#555'
    : v >= 500   ? '#8b5cf6'
    : '#e07820';
}

export function fmtChip(v: number): string {
  return v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + 'K' : String(v);
}

export interface BetEntry {
  key: string;
  amount: number;
}

export interface GameState {
  balance: number;
  bets: Record<string, number>;
  betHistory: BetEntry[];
  totalBet: number;
  lastWin: number;
  history: number[];
  selectedChip: number;
  spinning: boolean;
}

export const CHIP_VALUES = [100, 500, 1000, 5000, 10000, 25000];
export const CHIP_LABELS = ['100', '500', '1K', '5K', '10K', '25K'];

export const OUTSIDE_BETS = [
  { label: '1-18',  key: '1-18',   cls: '' },
  { label: 'EVEN',  key: 'even',   cls: '' },
  { label: '🔴',    key: 'reds',   cls: 'red-b' },
  { label: '⚫',    key: 'blacks', cls: 'blk-b' },
  { label: 'ODD',   key: 'odd',    cls: '' },
  { label: '19-36', key: '19-36',  cls: '' },
];