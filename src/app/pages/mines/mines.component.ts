import { Component, ElementRef, ViewChild } from '@angular/core';
import { MinesHeaderComponent } from "../../shared/components/mines/mines-header/mines-header.component";
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MinesBethistoryComponent } from "../../shared/components/mines/mines-bethistory/mines-bethistory.component";

@Component({
  selector: 'app-mines',
  standalone: true,
  imports: [MinesHeaderComponent, NgIf, NgClass, DecimalPipe, FormsModule, NgFor, MinesBethistoryComponent],
  templateUrl: './mines.component.html',
  styleUrl: './mines.component.scss'
})
export class MinesComponent {
  betAmount: number = 100;
  gameIsStart: boolean = false;
  mines: number = 2;
  showMineProgress: any = { action: false, id: "" };
  minesProfiles: any[] = Array(25).fill({}).map(() => ({}));
  multipliers: number[] = [];
  balance: number = 10000;
  minePositions: Set<number> = new Set();
  gemsFound: number = 0;
  multiplier: number = 1.0;
  risk: string = 'low';
  showWinBox: boolean = false;
  showGameOverBox: boolean = false;
  winingAmount: number = 0;
  currentMineIndex: number = 0;
  multiplierCrossed: boolean[] = [];

  @ViewChild('mineAudio') mineAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('dimondAudio') dimondAudio!: ElementRef<HTMLAudioElement>
  @ViewChild('multipliersContainer') multipliersRef!: ElementRef;


  ngOnInit() {
    this.multipliers = this.getMultipliers(this.mines)
  }

  // ── Computed multiplier table based on mine count ──────────────
  getMultipliers(minesCount: number): number[] {
    const safeTiles = 25 - minesCount;
    const mults: number[] = [];
    for (let g = 1; g <= safeTiles; g++) {
      let prob = 1;
      for (let i = 0; i < g; i++) prob *= (safeTiles - i) / (25 - i);
      mults.push(parseFloat(Math.max(0.98 / prob, 1.01).toFixed(2)));
    }
    return mults;
  }



  // ── Derived getters for template ───────────────────────────────
  get gemPercent(): number {
    const safe = 25 - this.mines;
    const remaining = safe - this.gemsFound;
    const totalRemaining = 25 - this.gemsFound;
    if (totalRemaining <= 0) return 0;
    return Math.round((remaining / totalRemaining) * 100);
  }

  get bombPercent(): number {
    const remaining = 25 - this.gemsFound;
    if (remaining <= 0) return 0;
    return Math.round((this.mines / remaining) * 100);
  }

  get tilesRevealed(): number {
    return this.minesProfiles.filter(m => m.isDimond || m.isBomb).length;
  }

  get nextMultiplier(): number {
    const mults = this.getMultipliers(this.mines);
    return mults[Math.min(this.gemsFound, mults.length - 1)] ?? 1;
  }

  // ── Game start ─────────────────────────────────────────────────
  gameStartHandler() {
    this.gameIsStart = true;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.balance -= this.betAmount;
    this.multipliers = this.getMultipliers(this.mines);

    this.minePositions = new Set<number>();
    while (this.minePositions.size < this.mines) {
      this.minePositions.add(Math.floor(Math.random() * 25));
    }

    this.minesProfiles = Array(25).fill(null).map((_, i) => ({ mineId: i }));
    this.multiplierCrossed = Array(this.multipliers.length).fill(false);
  }

  // ── Mine cell click ────────────────────────────────────────────
  handleMineClick(mine: any, index: number) {
    this.mineAudio?.nativeElement?.play();
    this.showMineProgress = { action: true, id: mine.mineId };

    setTimeout(() => {
      this.showMineProgress = { action: false, id: "" };

      if (this.minePositions.has(index)) {
        this.minesProfiles = this.minesProfiles.map((item, i) => {
          if (this.minePositions.has(i)) return { ...item, isBomb: true };
          return item;
        });

        this.gameIsStart = false;

        setTimeout(() => {
          this.minesProfiles = this.minesProfiles.map((item, i) => {
            if (this.minePositions.has(i)) return { ...item, isBomb: true };
            return item;
          });
          this.gameIsStart = false;
          this.winingAmount = 0;
          this.currentMineIndex = 0;
          this.showGameOverBox = true;
          this.showWinBox = true;

          setTimeout(() => {
              this.resetGame()
          }, 2000);
        }, 300);

      } else {
        // GEM found
        this.dimondAudio?.nativeElement?.play();
        this.gemsFound++;
        const mults = this.getMultipliers(this.mines);
        this.multiplier = mults[Math.min(this.gemsFound - 1, mults.length - 1)];
        const crosindex = this.gemsFound - 1;

        if (this.multiplierCrossed[crosindex] !== undefined) {
          this.multiplierCrossed[crosindex] = true;
        }
        this.scrollToActiveMultiplier(crosindex);

        this.minesProfiles = this.minesProfiles.map((item, i) =>
          i === index ? { ...item, isDimond: true } : item
        );
      }
    }, 800);
  }

  // ── Cash out (only available after 1+ gems found) ──────────────
  cashOut() {
    const winnings = Math.round(this.betAmount * this.multiplier);
    this.balance += winnings;
    this.gameIsStart = false;
    this.winingAmount = winnings;
    this.currentMineIndex = Math.max(0, this.gemsFound - 1);
    this.showGameOverBox = false;
    this.showWinBox = true;

    setTimeout(() => {
      this.resetGame();
    }, 2000);
  }

  gameCancelHandler() {
    this.balance += this.betAmount;
    this.gameIsStart = false;
    this.resetGame();
  }

  // ── Full state reset ───────────────────────────────────────────
  resetGame() {
    this.showWinBox = false;
    this.showGameOverBox = false;
    this.winingAmount = 0;
    this.currentMineIndex = 0;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.minePositions = new Set();
    this.showMineProgress = { action: false, id: "" };
    this.minesProfiles = Array(25).fill(null).map(() => ({}));
    this.fillInitialMultipliers();
  }

  handleBetAmount(amount: number) {
    this.betAmount = Math.max(10, Number(this.betAmount) + Number(amount));
  }

  setRisk(risk: string) {
    this.risk = risk;
    const riskMap: Record<string, number> = { low: 1, medium: 5, high: 15 };
    this.mines = riskMap[risk];
  }

  scrollToActiveMultiplier(index: number) {
    setTimeout(() => {
      const container = this.multipliersRef?.nativeElement;
      const items = container?.querySelectorAll('.mine-multiplier');

      if (items && items[index]) {
        items[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 50); 
  }

  fillInitialMultipliers(){
    this.multipliers=this.getMultipliers(this.mines);
  }
}