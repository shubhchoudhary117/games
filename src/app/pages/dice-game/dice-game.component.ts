import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';
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
  imports: [CommonModule, DiceCanvasComponent, NgIf],
  templateUrl: './dice-game.component.html',
  styleUrls: ['./dice-game.component.scss'],
})
export class DiceGameComponent implements OnInit, OnDestroy {

  @ViewChild(DiceCanvasComponent) diceCanvas!: DiceCanvasComponent;

  // ── Balance ──────────────────────────────────────────────
  balance = 120000;

  // ── Round ────────────────────────────────────────────────
  roundNumber = 1543;
  roundDuration = 10;
  timeLeft = 10;
  isBettingOpen = true;

  // phases: betting → countdown → spinning → result → (4s wait) → betting
  roundPhase: 'betting' | 'countdown' | 'spinning' | 'result' = 'betting';

  private timerInterval: any = null;
  private progressInterval: any = null;
  private phaseTimeout: any = null;

  // ── Progress bar (100 → 0 during betting only) ───────────
  progressPercent = 100;
  private readonly TICK_MS = 50;
  countdownValue = 3;
  countdownAnimating = false;
  dice1 = 1;
  dice2 = 1;
  lastResult: { dice1: number; dice2: number; total: number } | null = null;
  showWinPopup = false;
  totalWinAmount = 0;
  totalBetInWin = 0;
  // Update winEntries interface to include result value + colors
  winEntries: {
    label: string;
    multiplier: number;
    betAmt: number;
    winAmt: number;
    resultVal: number;
    colorType: string;
  }[] = [];
  // Add these new properties
  animatedWin = 0;
  totalMultiplier = 0;
  winClosing = false;
  private winAutoHideTimeout: any = null;

  // ── Recent Results ───────────────────────────────────────
  recentResults: { value: number; colorClass: string }[] = [
    { value: 11, colorClass: 'green' },
    { value: 4, colorClass: 'red' },
    { value: 12, colorClass: 'gold' },
    { value: 9, colorClass: 'purple' },
    { value: 6, colorClass: '' },
    { value: 5, colorClass: 'red' },
  ];

  // ── Chips ─────────────────────────────────────────────────
  chips = [
    { value: 10, img: 'assets/dice-game/chips/10.png' },
    { value: 20, img: 'assets/dice-game/chips/20.png' },
    { value: 50, img: 'assets/dice-game/chips/50.png' },
    { value: 100, img: 'assets/dice-game/chips/100.png' },
    { value: 500, img: 'assets/dice-game/chips/500.png' },
    { value: 1000, img: 'assets/dice-game/chips/1000.png' },
  ];
  selectedChip: { value: number; img: string } | null = null;

  // ── Bets ──────────────────────────────────────────────────
  pendingBets: BettingMap = {};
  confirmedBets: BettingMap = {};
  lastRoundBets: BettingMap = {};
  repeatBetTotal = 0;
  winningKeys: Set<string> = new Set();

  // ── Betting Digits ────────────────────────────────────────
  bettingSumDigits = [
    { id: 1, digit: 2, x: 35 },
    { id: 2, digit: 3, x: 18 },
    { id: 3, digit: 4, x: 12 },
    { id: 4, digit: 5, x: 9 },
    { id: 5, digit: 6, x: 7 },
    { id: 6, digit: 7, x: 6 },
    { id: 7, digit: 8, x: 6 },
    { id: 8, digit: 9, x: 7 },
    { id: 9, digit: 10, x: 9 },
    { id: 10, digit: 11, x: 18 },
    { id: 11, digit: 12, x: 35 },
  ];
  pairFirstDigits = [1, 2, 3, 4, 5, 6].map(d => ({ id: d, digit: d, x: 6 }));
  pairSecondDigits = [1, 2, 3, 4, 5, 6].map(d => ({ id: d, digit: d, x: 6 }));

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { this.startBetting(); }
  ngOnDestroy(): void { this.clearAll(); }

  // ── Clear all timers ──────────────────────────────────────
  private clearAll() {
    clearInterval(this.timerInterval);
    clearInterval(this.progressInterval);
    clearTimeout(this.phaseTimeout);
    this.timerInterval = this.progressInterval = this.phaseTimeout = null;
  }

  // ─────────────────────────────────────────────────────────
  // PHASE 1 — BETTING
  // ─────────────────────────────────────────────────────────
  startBetting() {
    this.clearAll();

    this.roundPhase = 'betting';
    this.isBettingOpen = true;
    this.timeLeft = this.roundDuration;
    this.progressPercent = 100;
    this.winningKeys = new Set();
    this.pendingBets = {};
    this.confirmedBets = {};
    this.cdr.detectChanges();

    // Smooth progress bar drain
    const totalMs = this.roundDuration * 1000;
    let elapsed = 0;
    this.progressInterval = setInterval(() => {
      elapsed += this.TICK_MS;
      this.progressPercent = Math.max(0, 100 - (elapsed / totalMs) * 100);
      this.cdr.detectChanges();
    }, this.TICK_MS);

    // Per-second countdown for timerDisplay
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.cdr.detectChanges();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        clearInterval(this.progressInterval);
        this.timerInterval = this.progressInterval = null;
        this.progressPercent = 0;
        this.isBettingOpen = false;
        this.pendingBets = {};       // refund un-confirmed
        this.cdr.detectChanges();

        // Small pause then countdown
        this.phaseTimeout = setTimeout(() => this.startCountdown(), 400);
      }
    }, 1000);
  }

  // ─────────────────────────────────────────────────────────
  // PHASE 2 — COUNTDOWN 3-2-1
  // ─────────────────────────────────────────────────────────
  private startCountdown() {
    this.roundPhase = 'countdown';
    this.countdownValue = 3;
    this.countdownAnimating = false;
    this.cdr.detectChanges();

    // First pop-in on next frame
    this.phaseTimeout = setTimeout(() => {
      this.countdownAnimating = true;
      this.cdr.detectChanges();
      this.tickCount();
    }, 50);
  }

  private tickCount() {
    // Hold 800ms then fade out
    this.phaseTimeout = setTimeout(() => {
      this.countdownAnimating = false;
      this.cdr.detectChanges();

      // 200ms gap then next number or spin
      this.phaseTimeout = setTimeout(() => {
        if (this.countdownValue > 1) {
          this.countdownValue--;
          this.countdownAnimating = true;
          this.cdr.detectChanges();
          this.tickCount();
        } else {
          this.triggerSpin();
        }
      }, 200);
    }, 800);
  }

  // ─────────────────────────────────────────────────────────
  // PHASE 3 — SPINNING
  // ─────────────────────────────────────────────────────────
  private triggerSpin() {
    this.roundPhase = 'spinning';
    this.dice1 = Math.floor(Math.random() * 6) + 1;
    this.dice2 = Math.floor(Math.random() * 6) + 1;
    this.cdr.detectChanges();

    setTimeout(() => this.diceCanvas.spin(), 0);
  }

  // ─────────────────────────────────────────────────────────
  // PHASE 4 — RESULT (no overlay, dice stay visible 4 seconds)
  // ─────────────────────────────────────────────────────────
  onSpinEnd(event: { dice1: number; dice2: number; total: number }) {
    const { dice1: d1, dice2: d2, total } = event;

    this.dice1 = d1;
    this.dice2 = d2;
    this.lastResult = { dice1: d1, dice2: d2, total };
    this.roundPhase = 'result';

    this.winningKeys = this.buildWinningKeys(d1, d2, total);

    const winnings = this.settleConfirmedBets(d1, d2, total);
    if (winnings > 0) {
      this.balance += winnings;
      this.buildWinEntries(d1, d2, total);
      setTimeout(() => {
         this.showWinPopup = true;
      }, 1000);
      if (this.winAutoHideTimeout) clearTimeout(this.winAutoHideTimeout);
      this.winAutoHideTimeout = setTimeout(() => this.closeWinPopup(), 4000);
    }

    this.recentResults.unshift({ value: total, colorClass: this.getResultColor(total) });
    if (this.recentResults.length > 10) this.recentResults.pop();

    this.lastRoundBets = JSON.parse(JSON.stringify(this.confirmedBets));
    this.repeatBetTotal = this.getConfirmedBetAmount();
    this.confirmedBets = {};

    this.cdr.detectChanges();

    // Wait 4 seconds, then start fresh betting round
    this.phaseTimeout = setTimeout(() => {
      this.roundNumber++;
      this.startBetting();
    }, 4000);
  }

  // ── Helpers ───────────────────────────────────────────────
  private buildWinningKeys(d1: number, d2: number, total: number): Set<string> {
    return new Set([
      `sum_${total}`,
      `d1_${d1}`,
      `d2_${d2}`,
      total % 2 !== 0 ? 'eo_odd' : 'eo_even',
    ]);
  }

  private settleConfirmedBets(d1: number, d2: number, total: number): number {
    let winnings = 0;
    for (const key of Object.keys(this.confirmedBets)) {
      const amt = this.getConfirmedBetTotal(key);
      let mult = 0;
      if (key === `sum_${total}`) mult = this.bettingSumDigits.find(b => b.digit === total)?.x ?? 0;
      else if (key === `d1_${d1}`) mult = 6;
      else if (key === `d2_${d2}`) mult = 6;
      else if (key === 'eo_odd' && total % 2 !== 0) mult = 1.9;
      else if (key === 'eo_even' && total % 2 === 0) mult = 1.9;
      winnings += Math.round(amt * mult);
    }
    return winnings;
  }

  getResultColor(total: number): string {
    if (total <= 4) return 'red';
    if (total >= 10) return 'green';
    if (total === 7) return 'gold';
    if (total >= 8) return 'purple';
    return '';
  }

  selectChip(chip: { value: number; img: string }) { this.selectedChip = chip; }

  addPendingBet(key: string) {
    if (!this.isBettingOpen || !this.selectedChip) return;
    const free = this.balance - this.getConfirmedBetAmount() - this.getPendingBetAmount();
    if (free < this.selectedChip.value) return;

    // ── Even/Odd: only one allowed, new replaces old ──────────
    if (key === 'eo_even' || key === 'eo_odd') {
      const other = key === 'eo_even' ? 'eo_odd' : 'eo_even';

      // Remove other from pending
      if (this.pendingBets[other]?.length) {
        delete this.pendingBets[other];
      }
      // Remove other from confirmed (refund)
      if (this.confirmedBets[other]?.length) {
        const refund = this.confirmedBets[other].reduce((s, b) => s + b.chipValue, 0);
        this.balance += refund;
        delete this.confirmedBets[other];
      }
      // Remove current key too if already exists (replace logic — fresh start)
      if (this.pendingBets[key]?.length) {
        delete this.pendingBets[key];
      }
      if (this.confirmedBets[key]?.length) {
        const refund = this.confirmedBets[key].reduce((s, b) => s + b.chipValue, 0);
        this.balance += refund;
        delete this.confirmedBets[key];
      }

      this.pendingBets[key] = [{ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img }];
      return;
    }

    // ── Dice Pair: max 1 number per dice ──────────────────────
    if (key.startsWith('d1_') || key.startsWith('d2_')) {
      const prefix = key.startsWith('d1_') ? 'd1_' : 'd2_';

      // Remove all other d1_ or d2_ bets from pending
      for (const k of Object.keys(this.pendingBets)) {
        if (k !== key && k.startsWith(prefix)) {
          delete this.pendingBets[k];
        }
      }
      // Remove all other d1_ or d2_ bets from confirmed (refund)
      for (const k of Object.keys(this.confirmedBets)) {
        if (k !== key && k.startsWith(prefix)) {
          const refund = this.confirmedBets[k].reduce((s, b) => s + b.chipValue, 0);
          this.balance += refund;
          delete this.confirmedBets[k];
        }
      }

      if (!this.pendingBets[key]) this.pendingBets[key] = [];
      this.pendingBets[key].push({ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img });
      return;
    }

    // ── Sum Digits: max 3 different keys ─────────────────────
    if (key.startsWith('sum_')) {
      const existingSumKeys = new Set([
        ...Object.keys(this.pendingBets).filter(k => k.startsWith('sum_')),
        ...Object.keys(this.confirmedBets).filter(k => k.startsWith('sum_')),
      ]);

      // If this key is already bet on, just add chip (stacking allowed on same number)
      if (existingSumKeys.has(key)) {
        if (!this.pendingBets[key]) this.pendingBets[key] = [];
        this.pendingBets[key].push({ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img });
        return;
      }

      // New key — check if limit of 3 reached
      if (existingSumKeys.size >= 3) return; // silently block, or show toast if needed

      if (!this.pendingBets[key]) this.pendingBets[key] = [];
      this.pendingBets[key].push({ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img });
      return;
    }

    // ── Default (any other key) ───────────────────────────────
    if (!this.pendingBets[key]) this.pendingBets[key] = [];
    this.pendingBets[key].push({ chipValue: this.selectedChip.value, chipImg: this.selectedChip.img });
  }

  placeBetAction() {
    if (!this.isBettingOpen) return;
    const total = this.getPendingBetAmount();
    if (total === 0 || this.balance < total) return;
    this.balance -= total;
    for (const key of Object.keys(this.pendingBets)) {
      if (!this.confirmedBets[key]) this.confirmedBets[key] = [];
      this.confirmedBets[key].push(...this.pendingBets[key]);
    }
    this.pendingBets = {};
    this.cdr.detectChanges();
  }

  repeatBet() {
    if (!this.isBettingOpen || !Object.keys(this.lastRoundBets).length) return;
    const cost = Object.values(this.lastRoundBets).flat().reduce((s, b) => s + b.chipValue, 0);
    if (this.balance < cost) return;
    this.pendingBets = JSON.parse(JSON.stringify(this.lastRoundBets));
    this.cdr.detectChanges();
  }

  clearBets() {
    if (!this.isBettingOpen) return;
    this.pendingBets = {};
    this.cdr.detectChanges();
  }

  getBetTotal(key: string): number {
    return (this.pendingBets[key] || []).reduce((s, b) => s + b.chipValue, 0)
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

  get timerDisplay(): string { return String(this.timeLeft).padStart(2, '0'); }
  get hasPendingBets(): boolean { return this.getPendingBetAmount() > 0; }

  isWinningCell(key: string): boolean {
    return this.roundPhase === 'result' && this.winningKeys.has(key);
  }





  // Ball color helpers
  getBallColor(e: any): string {
    const map: any = { red: '#d32f2f', purple: '#7b1fa2', green: '#2e7d32', gold: '#e65100', blue: '#1565c0' };
    return map[e.colorType] || '#5b21b6';
  }
  getBallHiColor(e: any): string {
    const map: any = { red: '#ff7961', purple: '#ce93d8', green: '#81c784', gold: '#ffcc80', blue: '#90caf9' };
    return map[e.colorType] || '#c084fc';
  }
  getBallGradient(e: any): string {
    return `radial-gradient(circle at 35% 28%, ${this.getBallHiColor(e)}, ${this.getBallColor(e)})`;
  }

  // Update buildWinEntries() method:
  private buildWinEntries(d1: number, d2: number, total: number) {
    this.winEntries = [];
    this.totalWinAmount = 0;
    this.totalBetInWin = 0;
    this.totalMultiplier = 0;

    const colorMap: any = {
      2: 'red', 3: 'red', 4: 'red',
      5: 'red', 6: 'blue', 7: 'gold',
      8: 'purple', 9: 'purple', 10: 'green',
      11: 'green', 12: 'gold'
    };
    const diceColor = ['red', 'purple', 'green', 'gold', 'blue', 'red'];

    const checks = [
      { key: `sum_${total}`, label: `Sum ${total}`, mult: this.bettingSumDigits.find(b => b.digit === total)?.x ?? 0, val: total, ct: colorMap[total] || 'purple' },
      { key: `d1_${d1}`, label: `Dice 1 → ${d1}`, mult: 6, val: d1, ct: diceColor[d1 - 1] },
      { key: `d2_${d2}`, label: `Dice 2 → ${d2}`, mult: 6, val: d2, ct: diceColor[d2 - 1] },
      { key: 'eo_odd', label: 'Odd', mult: 1.9, val: total, ct: 'green' },
      { key: 'eo_even', label: 'Even', mult: 1.9, val: total, ct: 'blue' },
    ];

    for (const c of checks) {
      const betAmt = this.getConfirmedBetTotal(c.key);
      if (betAmt > 0 && this.winningKeys.has(c.key)) {
        const winAmt = Math.round(betAmt * c.mult);
        this.winEntries.push({ label: c.label, multiplier: c.mult, betAmt, winAmt, resultVal: c.val, colorType: c.ct });
        this.totalWinAmount += winAmt;
        this.totalBetInWin += betAmt;
        this.totalMultiplier += c.mult;
      }
    }

    // Animate the win amount counter
    this.animatedWin = 0;
    const target = this.totalWinAmount;
    const dur = 900;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      this.animatedWin = Math.round(ease * target);
      this.cdr.detectChanges();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Update closeWinPopup():
  closeWinPopup() {
    this.winClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showWinPopup = false;
      this.winClosing = false;
      this.cdr.detectChanges();
    }, 380);
  }

}