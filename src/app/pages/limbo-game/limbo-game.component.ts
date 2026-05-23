import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, ChangeDetectorRef, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type GamePhase = 'idle' | 'rising' | 'result';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: string;
}

@Component({
  selector: 'app-limbo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './limbo-game.component.html',
  styleUrls: ['./limbo-game.component.scss']
})
export class LimboGameComponent implements OnInit, OnDestroy {

  @ViewChild('historyInner') historyInner!: ElementRef<HTMLElement>;

  // ── Game state ──────────────────────────────────────────────────────────────
  balance           = 999_217.42;
  betAmount         = 3;
  targetMultiplier  = 4;
  currentMultiplier = 1.00;
  phase: GamePhase  = 'idle';
  didWin            = false;
  autoGame          = false;

  history: number[] = [1.29, 1.41, 1.97, 2.87, 1.21, 1.22, 1.15, 3.44, 1.08, 1.76, 2.10, 1.33];

  stars: Star[] = [];

  // ── Internal ────────────────────────────────────────────────────────────────
  private riseInterval: any;
  private resultTimer: any;
  private autoTimer: any;

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.generateStars();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  // ── Stars ────────────────────────────────────────────────────────────────────
  private generateStars(): void {
    this.stars = Array.from({ length: 60 }, () => ({
      x:     Math.random() * 100,
      y:     Math.random() * 100,
      size:  0.5 + Math.random() * 2,
      delay: `${(Math.random() * 4).toFixed(2)}s`
    }));
  }

  // ── Play ─────────────────────────────────────────────────────────────────────
  play(): void {
    if (this.phase === 'rising') return;
    if (this.betAmount > this.balance || this.betAmount <= 0) return;

    this.balance     -= this.betAmount;
    this.phase        = 'rising';
    this.currentMultiplier = 1.00;
    this.didWin       = false;

    // Generate result multiplier (house-edge weighted — lower values more likely)
    const result = this.generateResult();

    this.zone.runOutsideAngular(() => {
      this.animateRise(result);
    });
  }

  /**
   * Generates a random multiplier.
   * Uses inverse distribution: result = 1 / uniform(0,1) capped.
   * This produces many low values (1.0x–2x) and rare high values.
   */
  private generateResult(): number {
    const rand = Math.random();
    // 99/result formula gives house edge of ~1%
    const raw = 0.99 / (1 - rand * 0.99);
    // Cap at 1000x
    return Math.min(parseFloat(raw.toFixed(2)), 1000);
  }

  private animateRise(finalResult: number): void {
    const start      = Date.now();
    // Duration scales with result: bigger result = longer animation
    const duration   = Math.min(500 + finalResult * 120, 6000);
    const startVal   = 1.00;

    const tick = () => {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in curve so it starts slow and accelerates
      const eased = Math.pow(progress, 0.7);
      const current = startVal + (finalResult - startVal) * eased;

      this.zone.run(() => {
        this.currentMultiplier = parseFloat(current.toFixed(2));
        this.cdr.markForCheck();
      });

      if (progress < 1) {
        this.riseInterval = requestAnimationFrame(tick);
      } else {
        this.zone.run(() => {
          this.resolveRound(finalResult);
        });
      }
    };

    this.riseInterval = requestAnimationFrame(tick);
  }

  private resolveRound(result: number): void {
    this.currentMultiplier = result;
    this.phase             = 'result';
    this.didWin            = result >= this.targetMultiplier;

    if (this.didWin) {
      this.balance += this.betAmount * this.targetMultiplier;
    }

    // Add to history
    this.history.unshift(result);
    if (this.history.length > 20) this.history.pop();

    this.cdr.detectChanges();

    // Return to idle after showing result
    this.resultTimer = setTimeout(() => {
      this.phase = 'idle';
      this.cdr.markForCheck();

      if (this.autoGame) {
        this.autoTimer = setTimeout(() => this.play(), 800);
      }
    }, 2500);
  }

  // ── Betting controls ─────────────────────────────────────────────────────────
  setBet(amount: number): void {
    this.betAmount = amount;
  }

  setBetMin(): void {
    this.betAmount = 1;
  }

  setBetMax(): void {
    this.betAmount = Math.floor(this.balance);
  }

  // ── Multiplier controls ──────────────────────────────────────────────────────
  setMultiplier(val: number): void {
    this.targetMultiplier = val;
  }

  adjustMultiplier(delta: number): void {
    const next = parseFloat((this.targetMultiplier + delta).toFixed(1));
    if (next >= 1.1) this.targetMultiplier = next;
  }

  // ── Chance calculation ────────────────────────────────────────────────────────
  get chance(): number {
    // P(win) = 99 / targetMultiplier  (house edge 1%)
    return Math.min(99 / this.targetMultiplier, 99);
  }

  // ── History scroll ────────────────────────────────────────────────────────────
  scrollHistory(dir: number): void {
    const el = this.historyInner?.nativeElement;
    if (el) el.scrollLeft += dir * 100;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  formatBalance(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private clearTimers(): void {
    if (this.riseInterval) cancelAnimationFrame(this.riseInterval);
    clearTimeout(this.resultTimer);
    clearTimeout(this.autoTimer);
  }
}