import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceCanvasComponent } from '../../shared/components/dice-game/dice-canvas/dice-canvas.component';

interface BetEntry {
  chipValue: number;
  chipImg: string;
}

interface BettingMap {
  [key: string]: BetEntry[];
}

@Component({
  selector: 'app-dice-game',
  standalone: true,
  imports: [CommonModule, DiceCanvasComponent],
  templateUrl: './dice-game.component.html',
  styleUrls: ['./dice-game.component.scss'],
})
export class DiceGameComponent implements OnInit, OnDestroy {

  // Direct reference to canvas — we call .spin() once, no Input toggling
  @ViewChild(DiceCanvasComponent) diceCanvas!: DiceCanvasComponent;

  // ── Balance ──────────────────────────────────────────────
  balance = 120000;

  // ── Round ────────────────────────────────────────────────
  roundNumber   = 1543;
  roundDuration = 5;
  timeLeft      = 5;
  isBettingOpen = true;
  roundPhase: 'betting' | 'spinning' | 'result' = 'betting';
  private timerInterval: any = null;

  // ── Dice values (set before spin, locked until result) ────
  dice1 = 1;
  dice2 = 1;

  lastResult: { dice1: number; dice2: number; total: number } | null = null;

  // ── Recent Results ───────────────────────────────────────
  recentResults: { value: number; colorClass: string }[] = [
    { value: 11, colorClass: 'green'  },
    { value: 4,  colorClass: 'red'    },
    { value: 12, colorClass: 'gold'   },
    { value: 9,  colorClass: 'purple' },
    { value: 6,  colorClass: ''       },
    { value: 5,  colorClass: 'red'    },
  ];

  // ── Chips ─────────────────────────────────────────────────
  chips = [
    { value: 10,   img: 'assets/dice-game/chips/10.png'   },
    { value: 20,   img: 'assets/dice-game/chips/20.png'   },
    { value: 50,   img: 'assets/dice-game/chips/50.png'   },
    { value: 100,  img: 'assets/dice-game/chips/100.png'  },
    { value: 500,  img: 'assets/dice-game/chips/500.png'  },
    { value: 1000, img: 'assets/dice-game/chips/1000.png' },
  ];
  selectedChip: { value: number; img: string } | null = null;

  // ── Bets ──────────────────────────────────────────────────
  pendingBets:   BettingMap = {};   // not yet placed (no balance deducted)
  confirmedBets: BettingMap = {};   // placed (balance deducted)
  lastRoundBets: BettingMap = {};
  repeatBetTotal = 0;

  // Winning cells (populated at result, cleared at next round start)
  winningKeys: Set<string> = new Set();

  // ── Betting Digits ────────────────────────────────────────
  bettingSumDigits = [
    { id: 1,  digit: 2,  x: 35 },
    { id: 2,  digit: 3,  x: 18 },
    { id: 3,  digit: 4,  x: 12 },
    { id: 4,  digit: 5,  x: 9  },
    { id: 5,  digit: 6,  x: 7  },
    { id: 6,  digit: 7,  x: 6  },
    { id: 7,  digit: 8,  x: 6  },
    { id: 8,  digit: 9,  x: 7  },
    { id: 9,  digit: 10, x: 9  },
    { id: 10, digit: 11, x: 18 },
    { id: 11, digit: 12, x: 35 },
  ];

  pairFirstDigits  = [1,2,3,4,5,6].map(d => ({ id: d, digit: d, x: 6 }));
  pairSecondDigits = [1,2,3,4,5,6].map(d => ({ id: d, digit: d, x: 6 }));

  // ── Lifecycle ─────────────────────────────────────────────
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // ── Timer ─────────────────────────────────────────────────
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  startTimer() {
    this.stopTimer();
    this.timeLeft      = this.roundDuration;
    this.isBettingOpen = true;
    this.roundPhase    = 'betting';
    this.lastResult    = null;
    this.winningKeys   = new Set();

    // Refund any leftover pending (safety net)
    this.pendingBets   = {};
    this.confirmedBets = {};

    this.cdr.detectChanges();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.cdr.detectChanges();

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.triggerSpin();
      }
    }, 1000);
  }

  // ── Place Bet ─────────────────────────────────────────────
  placeBetAction() {
    if (!this.isBettingOpen) return;
    const pendingTotal = this.getPendingBetAmount();
    if (pendingTotal === 0) return;
    if (this.balance < pendingTotal) return;

    // Deduct balance now
    this.balance -= pendingTotal;

    // Move pending → confirmed
    for (const key of Object.keys(this.pendingBets)) {
      if (!this.confirmedBets[key]) this.confirmedBets[key] = [];
      this.confirmedBets[key].push(...this.pendingBets[key]);
    }
    this.pendingBets = {};
    this.cdr.detectChanges();
  }

  // ── Trigger Spin ──────────────────────────────────────────
  triggerSpin() {
    if (this.roundPhase === 'spinning') return;

    // Refund any un-confirmed pending bets
    this.pendingBets = {};

    this.isBettingOpen = false;
    this.roundPhase    = 'spinning';

    // Decide dice outcome NOW — locked in before canvas starts spinning
    this.dice1 = Math.floor(Math.random() * 6) + 1;
    this.dice2 = Math.floor(Math.random() * 6) + 1;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.diceCanvas.spin();
    }, 0);
  }

  // ── Spin End (called by canvas once animation is done) ────
  onSpinEnd(event: { dice1: number; dice2: number; total: number }) {
    // Use the values the canvas actually displayed — guaranteed correct
    const d1    = event.dice1;
    const d2    = event.dice2;
    const total = event.total;

    console.log(event)

    this.dice1      = d1;
    this.dice2      = d2;
    this.lastResult = { dice1: d1, dice2: d2, total };
    this.roundPhase = 'result';

    // Build winning keys BEFORE clearing bets
    this.winningKeys = this.buildWinningKeys(d1, d2, total);

    // Settle
    const winnings = this.settleConfirmedBets(d1, d2, total);
    if (winnings > 0) this.balance += winnings;

    // Recent results
    this.recentResults.unshift({ value: total, colorClass: this.getResultColor(total) });
    if (this.recentResults.length > 10) this.recentResults.pop();

    // Save for repeat
    this.lastRoundBets  = JSON.parse(JSON.stringify(this.confirmedBets));
    this.repeatBetTotal = this.getConfirmedBetAmount();

    // Clear bets
    this.confirmedBets = {};
    this.cdr.detectChanges();

    // Next round — 6 second delay so user can see result
    setTimeout(() => {
      this.roundNumber++;
      this.startTimer();
    }, 6000);
  }

  // ── Winning keys ──────────────────────────────────────────
  private buildWinningKeys(d1: number, d2: number, total: number): Set<string> {
    const keys = new Set<string>();
    keys.add(`sum_${total}`);
    keys.add(`d1_${d1}`);
    keys.add(`d2_${d2}`);
    keys.add(total % 2 !== 0 ? 'eo_odd' : 'eo_even');
    return keys;
  }

  // ── Settle Bets ───────────────────────────────────────────
  private settleConfirmedBets(d1: number, d2: number, total: number): number {
    let winnings = 0;
    for (const key of Object.keys(this.confirmedBets)) {
      const betAmt = this.getConfirmedBetTotal(key);
      let mult = 0;

      if      (key === `sum_${total}`)                 { mult = this.bettingSumDigits.find(b => b.digit === total)?.x ?? 0; }
      else if (key === `d1_${d1}`)                     { mult = 6;   }
      else if (key === `d2_${d2}`)                     { mult = 6;   }
      else if (key === 'eo_odd'  && total % 2 !== 0)   { mult = 1.9; }
      else if (key === 'eo_even' && total % 2 === 0)   { mult = 1.9; }

      winnings += Math.round(betAmt * mult);
    }
    return winnings;
  }

  getResultColor(total: number): string {
    if (total <= 4)  return 'red';
    if (total >= 10) return 'green';
    if (total === 7) return 'gold';
    if (total >= 8)  return 'purple';
    return '';
  }

  // ── Chip selection ────────────────────────────────────────
  selectChip(chip: { value: number; img: string }) {
    this.selectedChip = chip;
  }

  // ── Pending bet (balance NOT deducted yet) ────────────────
  addPendingBet(key: string) {
    if (!this.isBettingOpen || !this.selectedChip) return;
    const alreadyPending = this.getPendingBetAmount();
    if (this.balance - this.getConfirmedBetAmount() - alreadyPending < this.selectedChip.value) return;

    if (!this.pendingBets[key]) this.pendingBets[key] = [];
    this.pendingBets[key].push({ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img });
  }

  // ── Repeat Bet ────────────────────────────────────────────
  repeatBet() {
    if (!this.isBettingOpen || Object.keys(this.lastRoundBets).length === 0) return;
    const cost = Object.values(this.lastRoundBets).flat().reduce((s, b) => s + b.chipValue, 0);
    if (this.balance < cost) return;

    this.pendingBets = JSON.parse(JSON.stringify(this.lastRoundBets));
    this.cdr.detectChanges();
  }

  // ── Clear pending bets ────────────────────────────────────
  clearBets() {
    if (!this.isBettingOpen) return;
    this.pendingBets = {};
    this.cdr.detectChanges();
  }

  // ── Helpers ───────────────────────────────────────────────
  getBetTotal(key: string): number {
    return (this.pendingBets[key]   || []).reduce((s, b) => s + b.chipValue, 0)
         + (this.confirmedBets[key] || []).reduce((s, b) => s + b.chipValue, 0);
  }

  getLastChipImg(key: string): string {
    const list = [...(this.confirmedBets[key] || []), ...(this.pendingBets[key] || [])];
    return list.length ? list[list.length - 1].chipImg : '';
  }

  getTotalBetAmount(): number {
    return this.getPendingBetAmount() + this.getConfirmedBetAmount();
  }

  private getPendingBetAmount(): number {
    return Object.values(this.pendingBets).flat().reduce((s, b) => s + b.chipValue, 0);
  }

  private getConfirmedBetAmount(): number {
    return Object.values(this.confirmedBets).flat().reduce((s, b) => s + b.chipValue, 0);
  }

  private getConfirmedBetTotal(key: string): number {
    return (this.confirmedBets[key] || []).reduce((s, b) => s + b.chipValue, 0);
  }

  get timerDisplay(): string {
    return String(this.timeLeft).padStart(2, '0');
  }

  get hasPendingBets(): boolean {
    return this.getPendingBetAmount() > 0;
  }

  isWinningCell(key: string): boolean {
    if (this.roundPhase !== 'result') return false;
    return this.winningKeys.has(key);
  }
}