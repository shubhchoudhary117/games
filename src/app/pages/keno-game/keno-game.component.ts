import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KenoHowToPlayComponent } from "../../shared/components/keno/keno-how-to-play/keno-how-to-play.component";

interface MultiplierRow {
  match: number;
  value: number;
  active: boolean;
}

@Component({
  selector: 'app-keno',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, KenoHowToPlayComponent],
  templateUrl: './keno-game.component.html',
  styleUrls: ['./keno-game.component.scss'],
})
export class KenoGameComponent implements OnInit {
  // ── Constants ──────────────────────────────────────────────────────────
  readonly TOTAL = 36;
  readonly MAX_PICKS = 10;
  readonly MULTIPLIER_TABLE: Record<number, number[]> = {
    1: [0, 3.96],
    2: [0, 1.98, 3.96],
    3: [0, 1.62, 3.96, 7.92],
    4: [0, 1.32, 2.64, 6.00, 12.00],
    5: [0, 0.5, 1.5, 3.0, 7.0, 25.0],
    6: [0, 0, 1.0, 2.0, 4.0, 12.0, 50.0],
    7: [0, 0, 0.5, 1.0, 2.5, 6.0, 20.0, 80.0],
    8: [0, 2, 2, 0.5, 1.5, 4.0, 10.0, 35.0, 100.0],
    9: [0, 3, 2, 2, 1.0, 3.0, 7.0, 20.0, 60.0, 200.0],
    10: [0, 2, 2, 2, 0.5, 1.5, 4.0, 10.0, 30.0, 100.0, 500.0],
  };

  // ── State ──────────────────────────────────────────────────────────────
  numbers: number[] = [];
  selected = new Set<number>();
  hitNumbers = new Set<number>();
  missNumbers = new Set<number>();
  balance = 29999.70;
  betAmount = 0.30;
  isRunning = false;
  showMenu = false;
  showStakes = false;
  instructionText = 'PICK NUMBERS FOR START';
  instructionColor = '#28A774';
  multiplierRows: MultiplierRow[] = [];
  shoWinAmount = false;
  winBannerBet = 0;
  winBannerAmount = 0;
  amountStakes = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50, 100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000];
  soundEnabled = true;
  musicEnabled = false;
  showHowToPlay = false;
  @ViewChild('buttonsAuido') buttonAudioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('betPlaceAudio') betPlaceAudioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('gameEndAudio') gameEndAudioPlayer!: ElementRef<HTMLAudioElement>;

  ngOnInit(): void {
    this.numbers = Array.from({ length: this.TOTAL }, (_, i) => i + 1);
  }

  openHowToPlay(): void {
    this.showHowToPlay = true;
  }

  closeHowToPlay(): void {
    this.showHowToPlay = false;
  }

  // ── Number selection ───────────────────────────────────────────────────
  toggleNumber(n: number): void {
    if (this.isRunning) return;
    if (this.selected.has(n)) {
      this.selected.delete(n);
    } else {
      if (this.selected.size >= this.MAX_PICKS) return;
      this.selected.add(n);
    }
    this.updateInstruction();
    this.buildMultiplierRows();
  }

  isSelected(n: number): boolean { return this.selected.has(n); }
  isHit(n: number): boolean { return this.hitNumbers.has(n); }
  isMiss(n: number): boolean { return this.missNumbers.has(n); }

  numberClass(n: number): string {
    if (this.isHit(n)) return 'keno__number keno__number--hit';
    if (this.isMiss(n)) return 'keno__number keno__number--miss';
    if (this.isSelected(n)) return 'keno__number keno__number--selected';
    return 'keno__number';
  }

  // ── Random / Clear ─────────────────────────────────────────────────────
  randomPick(): void {
    if (this.isRunning) return;
    this.playSound(this.buttonAudioPlayer);
    this.clearPick();
    const shuffled = this.shuffle([...this.numbers]);
    shuffled.slice(0, 10).forEach(n => this.selected.add(n));
    this.updateInstruction();
    this.buildMultiplierRows();
  }

  playSound(audioRef: ElementRef<HTMLAudioElement>): void {
    if (this.soundEnabled) {
      const audio = audioRef.nativeElement;
      audio.currentTime = 0;
      audio.play();
    }
  }

  clearPick(): void {
    if (this.isRunning) return;
    this.selected.clear();
    this.hitNumbers.clear();
    this.missNumbers.clear();
    this.updateInstruction();
    this.buildMultiplierRows();
  }

  // ── Bet amount ─────────────────────────────────────────────────────────
  adjustBet(dir: number): void {
    this.betAmount = Math.max(0.10, Math.round((this.betAmount + dir * 0.10) * 100) / 100);
  }

  selectStake(s: number): void {
    this.betAmount = s;
    this.showStakes = false;
  }

  // ── Place Bet ──────────────────────────────────────────────────────────
  async placeBet(): Promise<void> {
    if (this.isRunning || this.selected.size === 0) {
      if (this.selected.size === 0) this.flashInstruction('PICK NUMBERS FIRST!', '#fff');
      return;
    }
    if (this.betAmount > this.balance) {
      this.flashInstruction('INSUFFICIENT BALANCE!', '#fff');
      return;
    }
    this.playSound(this.betPlaceAudioPlayer);
    this.isRunning = true;
    this.hitNumbers.clear();
    this.missNumbers.clear();
    this.balance -= this.betAmount;

    // Draw 10 numbers
    const drawn = this.shuffle([...this.numbers]).slice(0, 10);
    for (const n of drawn) {
      await this.delay(220);
      if (this.selected.has(n)) {
        this.hitNumbers.add(n);
      } else {
        this.missNumbers.add(n);
      }
    }

    // Mark remaining selected as miss
    this.selected.forEach(n => {
      if (!this.hitNumbers.has(n)) this.missNumbers.add(n);
    });

    const hits = drawn.filter(n => this.selected.has(n)).length;
    const mults = this.MULTIPLIER_TABLE[this.selected.size] ?? [];
    const mult = mults[hits] ?? 0;
    const win = parseFloat((this.betAmount * mult).toFixed(2));

    // Update active multiplier row
    this.multiplierRows.forEach((r, i) => r.active = i === hits);

    if (win > 0) {
      this.balance += win;
      this.winBannerBet = this.betAmount;
      this.winBannerAmount = win;
      this.shoWinAmount = true;
      this.flashInstruction(` YOU WIN $${win.toFixed(2)}!`, '#green');
    } else {
      this.flashInstruction(`${hits} HITS — BETTER LUCK NEXT TIME`, '#ff6080');
    }

    setTimeout(() => {
      this.shoWinAmount = false;
    }, 2000);

    this.playSound(this.gameEndAudioPlayer);
    await this.delay(1600);
    this.isRunning = false;
    this.instructionColor = '#28A774';
    this.updateInstruction();
  }



  // ── Helpers ────────────────────────────────────────────────────────────
  private updateInstruction(): void {
    const s = this.selected.size;
    if (s === 0) this.instructionText = 'PICK NUMBERS FOR START';
    else if (s === 1) this.instructionText = '1 NUMBER SELECTED';
    else this.instructionText = `${s} NUMBERS SELECTED`;
  }

  private buildMultiplierRows(): void {
    const count = this.selected.size;
    const mults = this.MULTIPLIER_TABLE[count] ?? [];
    this.multiplierRows = mults.map((v, i) => ({ match: i, value: v, active: false }));
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private flashInstruction(text: string, color: string): void {
    this.instructionText = text;
    this.instructionColor = color;
  }

  toggleMenu(): void { this.showMenu = !this.showMenu; }
}