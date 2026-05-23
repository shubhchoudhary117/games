// src/app/services/roulette.service.ts
import { Injectable, signal, computed } from '@angular/core';
import {
  WHEEL_ORDER, TABLE_ROWS, STARTING_BALANCE, TIMER_TOTAL,
  numColor, formatNum, chipBg, fmtChip,
  BetEntry, CHIP_VALUES
} from './roulette.model';

export interface WinPopupData {
  num: number;
  color: string;
  win: number;
  net: number;
  balance: number;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class RouletteService {

  // ── Signals ──
  balance    = signal(STARTING_BALANCE);
  bets       = signal<Record<string, number>>({});
  betHistory = signal<BetEntry[]>([]);
  totalBet   = signal(0);
  lastWin    = signal(0);
  history    = signal<number[]>([13,9,26,8,7,9,8,22,30,10]);
  selectedChip = signal(100);
  spinning   = signal(false);
  timerVal   = signal(TIMER_TOTAL);
  winPopup   = signal<WinPopupData>({ num:0, color:'green', win:0, net:0, balance:0, visible:false });
  targetNum  = signal(0);

  // ── Computed ──
  broke = computed(() => this.balance() <= 0);

  private timerInterval: any = null;

  // ─────────────────────────────────
  // BALANCE
  // ─────────────────────────────────
  refillBalance() {
    this.balance.set(STARTING_BALANCE);
  }

  // ─────────────────────────────────
  // CHIP SELECTION
  // ─────────────────────────────────
  selectChip(val: number) {
    this.selectedChip.set(val);
  }

  // ─────────────────────────────────
  // BETTING
  // ─────────────────────────────────
  placeBet(key: string) {
    if (this.spinning()) return;
    const chip = this.selectedChip();
    if (this.balance() < chip) return;

    const newBets = { ...this.bets() };
    newBets[key] = (newBets[key] || 0) + chip;
    this.bets.set(newBets);

    this.betHistory.update(h => [...h, { key, amount: chip }]);
    this.totalBet.update(t => t + chip);
    this.balance.update(b => b - chip);
  }

  undoBet() {
    if (this.spinning()) return;
    const hist = this.betHistory();
    if (!hist.length) return;
    const last = hist[hist.length - 1];

    const newBets = { ...this.bets() };
    newBets[last.key] -= last.amount;
    if (newBets[last.key] <= 0) delete newBets[last.key];
    this.bets.set(newBets);

    this.betHistory.update(h => h.slice(0, -1));
    this.totalBet.update(t => t - last.amount);
    this.balance.update(b => b + last.amount);
  }

  resetBets() {
    if (this.spinning()) return;
    this.balance.update(b => b + this.totalBet());
    this.bets.set({});
    this.betHistory.set([]);
    this.totalBet.set(0);
  }

  // ─────────────────────────────────
  // TIMER
  // ─────────────────────────────────
  startTimer(onComplete: () => void) {
    clearInterval(this.timerInterval);
    this.timerVal.set(TIMER_TOTAL);
    this.timerInterval = setInterval(() => {
      this.timerVal.update(v => v - 1);
      if (this.timerVal() <= 0) {
        clearInterval(this.timerInterval);
        onComplete();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  // ─────────────────────────────────
  // WIN CALCULATION
  // ─────────────────────────────────
  calculateWin(num: number): number {
    const col = numColor(num);
    let win = 0;
    Object.entries(this.bets()).forEach(([key, amount]) => {
      if (key === String(num))                                    win += amount * 35;
      else if (key === 'reds'   && col === 'red')                win += amount * 2;
      else if (key === 'blacks' && col === 'black')              win += amount * 2;
      else if (key === 'even'   && num%2===0 && num!==0)         win += amount * 2;
      else if (key === 'odd'    && num%2===1)                    win += amount * 2;
      else if (key === '1-18'   && num>=1 && num<=18)            win += amount * 2;
      else if (key === '19-36'  && num>=19 && num<=36)           win += amount * 2;
      else if (key.startsWith('col-')) {
        const ri = parseInt(key.split('-')[1]);
        if (TABLE_ROWS[ri].includes(num)) win += amount * 3;
      }
    });
    return win;
  }

  finishRound(num: number) {
    const win    = this.calculateWin(num);
    const net    = win - this.totalBet();
    this.balance.update(b => b + win);
    this.lastWin.set(win);
    this.history.update(h => [num, ...h].slice(0, 10));
    this.targetNum.set(num);

    const col = numColor(num);
    this.winPopup.set({
      num, color: col, win, net,
      balance: this.balance(),
      visible: true,
    });

    // after 4.5s, hide popup and clear bets
    setTimeout(() => {
      this.winPopup.update(p => ({ ...p, visible: false }));
      this.bets.set({});
      this.betHistory.set([]);
      this.totalBet.set(0);
    }, 4500);
  }

  // ─────────────────────────────────
  // HELPERS
  // ─────────────────────────────────
  formatNum = formatNum;
  chipBg = chipBg;
  fmtChip = fmtChip;
  numColor = numColor;
}