import { Component, ElementRef, ViewChild } from '@angular/core';
import { MinesHeaderComponent } from "../../shared/components/mines/mines-header/mines-header.component";
import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MinesBethistoryComponent } from "../../shared/components/mines/mines-bethistory/mines-bethistory.component";
import { MineSoundService } from './mine.sound.service';

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
  isAutoBet: boolean = false;
  autoBetRounds: number = 10;
  initialBetAmount: number = 100;
  autoSelectedBoxes: Set<number> = new Set();
  isAutoRunning: boolean = false;
  autoAllLoading: boolean = false;
  autoCurrentRound: number = 0;
  autoTotalRounds: number = 0;
  autoRoundBetweenDelay: number = 1800;
  gameSessionId = 0;
  increaseOnWinType: 'increase' | 'decrease' = 'increase';
  increaseOnLoseType: 'increase' | 'decrease' = 'increase';
  increaseOnWinPercent: number = 100;
  increaseOnLosePercent: number = 100;
  errroMessage: string = "";
  showToaster: boolean = false;

  @ViewChild('mineAudio') mineAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('dimondAudio') dimondAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('multipliersContainer') multipliersRef!: ElementRef;
  @ViewChild('buttonClickAudio') ButtonClickAudio!: ElementRef<HTMLAudioElement>;

  constructor(
    public soundService: MineSoundService
  ) { }

  ngOnInit() {
    this.multipliers = this.getMultipliers(this.mines);
  }

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

  get maxAutoSelectBoxes(): number {
    return 25 - this.mines;
  }

  get canStartAutoBet(): boolean {
    return this.autoBetRounds > 0 && this.autoSelectedBoxes.size > 0 && !this.isAutoRunning;
  }

  setAutoBet(val: boolean) {
    if (this.isAutoRunning || this.gameIsStart) return;
    this.isAutoBet = val;
    if (!val) {
      this.autoSelectedBoxes = new Set();
      this.minesProfiles = Array(25).fill(null).map((_, i) => ({ mineId: i }));
    }
  }

  handleAutoBoxSelect(index: number) {
    if (!this.isAutoBet || this.isAutoRunning || this.autoAllLoading) return;
    if (this.autoSelectedBoxes.has(index)) {
      this.autoSelectedBoxes.delete(index);
    } else {
      if (this.autoSelectedBoxes.size >= this.maxAutoSelectBoxes) return;
      this.autoSelectedBoxes.add(index);
    }

    this.gemsFound++;

    const mults = this.getMultipliers(this.mines);

    this.multiplier = mults[Math.min(this.gemsFound - 1, mults.length - 1)];

    const crosindex = this.gemsFound - 1;

    if (this.multiplierCrossed[crosindex] !== undefined) {
      this.multiplierCrossed[crosindex] = true;
    }

    this.scrollToActiveMultiplier(
      crosindex
    );

    this.autoSelectedBoxes = new Set(this.autoSelectedBoxes);
  }

  isAutoSelected(index: number): boolean {
    return this.autoSelectedBoxes.has(index);
  }

  startAutoBet() {
    if (!this.canStartAutoBet) return;
    if (this.balance < this.betAmount) return;
    this.soundService.play(this.ButtonClickAudio);
    this.isAutoRunning = true;
    this.autoCurrentRound = 0;
    this.autoTotalRounds = this.autoBetRounds;
    this.initialBetAmount = this.betAmount;

    this.runAutoRound();
  }

  private runAutoRound() {
    if (!this.isAutoRunning) return;
    if (this.autoCurrentRound >= this.autoTotalRounds) {
      this.resetAutoBetStates();
      this.stopAutoBet();
      return;
    }
    if (this.balance < this.betAmount) {
      this.stopAutoBet();
      return;
    }

    this.autoCurrentRound++;

    // Reset for this round
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.balance -= this.betAmount;
    this.multipliers = this.getMultipliers(this.mines);
    this.multiplierCrossed = Array(this.multipliers.length).fill(false);
    this.showWinBox = false;
    this.showGameOverBox = false;

    // Place mines randomly
    this.minePositions = new Set<number>();
    while (this.minePositions.size < this.mines) {
      this.minePositions.add(Math.floor(Math.random() * 25));
    }

    // Step 1: Show loader on ALL 25 boxes for 3 seconds
    this.autoAllLoading = true;
    this.minesProfiles = Array(25).fill(null).map((_, i) => ({ mineId: i, isLoading: true }));

    // Step 2: After 3 seconds — reveal all 25 at once
    setTimeout(() => {
      if (!this.isAutoRunning) return;

      this.autoAllLoading = false;

      const selectedArr = Array.from(this.autoSelectedBoxes);
      const hitBomb = selectedArr.some(idx => this.minePositions.has(idx));
      const safeSelected = selectedArr.filter(idx => !this.minePositions.has(idx));

      // Reveal ALL 25 boxes simultaneously
      this.minesProfiles = Array(25).fill(null).map((_, i) => {

        if (this.minePositions.has(i)) {
          return {
            mineId: i,
            isBomb: true
          };
        }

        if (this.autoSelectedBoxes.has(i)) {
          return {
            mineId: i,
            isDimond: true
          };
        }

        return {
          mineId: i, isSafe: true
        };

      });

      if (hitBomb) {
        this.gemsFound = safeSelected.length;
        this.multiplier = 1.0;
        setTimeout(() => this.autoHandleLoss(), 700);
      } else {
        const mults = this.getMultipliers(this.mines);
        this.gemsFound = selectedArr.length;
        this.multiplier = mults[Math.min(this.gemsFound - 1, mults.length - 1)] ?? 1.0;
        for (let i = 0; i < this.gemsFound; i++) {
          if (this.multiplierCrossed[i] !== undefined) this.multiplierCrossed[i] = true;
        }
        this.scrollToActiveMultiplier(this.gemsFound - 1);
        setTimeout(() => this.autoHandleWin(), 700);
      }
    }, 3000);
  }

  private autoHandleWin() {
    const winnings = Math.round(this.betAmount * this.multiplier);
    this.balance += winnings;
    this.winingAmount = winnings;
    this.currentMineIndex = Math.max(0, this.gemsFound - 1);
    this.showGameOverBox = false;
    this.showWinBox = true;

    this.updateBetAmount(
      this.increaseOnWinType,
      this.increaseOnWinPercent
    );

    setTimeout(() => {
      this.showWinBox = false;
      setTimeout(() => {
        this.runAutoRound();
      }, 400);

    }, this.autoRoundBetweenDelay);
  }

  private autoHandleLoss() {

    this.winingAmount = 0;
    this.currentMineIndex = 0;
    this.showGameOverBox = true;
    this.showWinBox = true;

    this.updateBetAmount(
      this.increaseOnLoseType,
      this.increaseOnLosePercent
    );

    setTimeout(() => {
      this.showWinBox = false;
      this.showGameOverBox = false;
      setTimeout(() => {
        this.runAutoRound();
      }, 400);

    }, this.autoRoundBetweenDelay);
  }

  stopAutoBet() {
    this.isAutoRunning = false;
    this.autoAllLoading = false;
    this.gameIsStart = false;
    this.showWinBox = false;
    this.showGameOverBox = false;
    this.autoCurrentRound = 0;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.minePositions = new Set();
    this.showMineProgress = { action: false, id: "" };
    this.minesProfiles = Array(25).fill(null).map((_, i) => ({ mineId: i }));
    this.resetMultiplierScroll();
    this.fillInitialMultipliers();
    this.resetAutoBetStates();
  }

  // ── Manual game ────────────────────────────────────────────────
  gameStartHandler() {
    this.gameSessionId++;
    const sessionId = this.gameSessionId;
    this.resetGame();
    this.gameIsStart = true;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.balance -= this.betAmount;
    this.soundService.play(this.ButtonClickAudio);
    this.multipliers =
      this.getMultipliers(this.mines);
    this.minePositions = new Set<number>();
    while (
      this.minePositions.size < this.mines
    ) {
      this.minePositions.add(
        Math.floor(Math.random() * 25)
      );
    }
    this.minesProfiles = Array(25)
      .fill(null)
      .map((_, i) => ({
        mineId: i
      }));

    this.multiplierCrossed =
      Array(this.multipliers.length)
        .fill(false);
  }

  handleMineClick(mine: any, index: number) {
    if (!this.gameIsStart) {
      this.handleToaster('please press "Start Game"');
      return;
    };
    const sessionId = this.gameSessionId;
    this.soundService.play(this.mineAudio);
    this.showMineProgress = {
      action: true,
      id: mine.mineId
    };

    setTimeout(() => {
      if (
        sessionId !== this.gameSessionId
      ) return;

      this.showMineProgress = {
        action: false, id: ""

      };

      if (this.minePositions.has(index)) {
        this.revealAllTiles();
        this.gameIsStart = false;
        this.resetMultiplierScroll();
        setTimeout(() => {
          if (
            sessionId !== this.gameSessionId
          ) return;
          this.winingAmount = 0;
          this.currentMineIndex = 0;
          this.showGameOverBox = true;
          this.showWinBox = true;
          setTimeout(() => {
            if (sessionId !== this.gameSessionId) return;
            this.resetGame();
          }, 2000);
        }, 500);

      } else {
        this.soundService.play(
          this.dimondAudio
        );

        this.gemsFound++;
        const mults = this.getMultipliers(this.mines);
        this.multiplier = mults[Math.min(this.gemsFound - 1, mults.length - 1)];
        const crosindex = this.gemsFound - 1;

        if (this.multiplierCrossed[crosindex] !== undefined) {
          this.multiplierCrossed[crosindex] = true;
        }

        this.scrollToActiveMultiplier(crosindex);
        this.minesProfiles =
          this.minesProfiles.map(
            (item, i) => i === index ? { ...item, isDimond: true } : item);
      }

    }, 300);
  }

  cashOut() {
    this.gameSessionId++;
    const winnings = Math.round(this.betAmount * this.multiplier);

    this.balance += winnings;
    this.winingAmount = winnings;
    this.currentMineIndex =
      Math.max(
        0,
        this.gemsFound - 1
      );
    this.showGameOverBox = false;
    this.showWinBox = true;
    this.gameIsStart = false;
    this.resetMultiplierScroll();
    this.revealAllTiles();
    setTimeout(() => {
      this.resetGame();
    }, 2000);
  }

  gameCancelHandler() {
    this.balance += this.betAmount;
    this.gameIsStart = false;
    this.resetMultiplierScroll();
    this.resetGame();
  }

  resetGame() {
    this.showWinBox = false;
    this.showGameOverBox = false;
    this.autoAllLoading = false;
    this.winingAmount = 0;
    this.currentMineIndex = 0;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.minePositions = new Set();
    this.showMineProgress = {
      action: false,
      id: ""
    };

    this.minesProfiles = Array(25)
      .fill(null)
      .map((_, i) => ({
        mineId: i
      }));
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
        items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 50);
  }

  fillInitialMultipliers() {
    this.multipliers = this.getMultipliers(this.mines);
  }

  resetOnWin() {
    this.betAmount = this.initialBetAmount;
    this.increaseOnWinPercent = 0;
  }

  resetOnLose() {
    this.betAmount = this.initialBetAmount;
    this.increaseOnLosePercent = 0;
  }


  resetAutoBetStates() {
    // auto states
    this.isAutoRunning = false;
    this.autoAllLoading = false;
    this.autoCurrentRound = 0;
    this.autoTotalRounds = 0;
    this.autoBetRounds = 10;
    this.increaseOnWinPercent = 0;
    this.increaseOnLosePercent = 0;
    this.autoSelectedBoxes = new Set();
    this.betAmount = this.initialBetAmount;
    this.gameIsStart = false;
    this.showWinBox = false;
    this.showGameOverBox = false;
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.winingAmount = 0;
    this.currentMineIndex = 0;

    // reset mines
    this.minePositions = new Set();
    this.showMineProgress = {
      action: false,
      id: ""
    };

    // reset board
    this.minesProfiles = Array(25)
      .fill(null)
      .map((_, i) => ({
        mineId: i
      }));

    // reset multipliers
    this.multiplierCrossed = [];
    this.fillInitialMultipliers();
  }


  revealAllTiles() {
    const updatedProfiles = [];
    for (let i = 0; i < 25; i++) {
      // bomb
      if (this.minePositions.has(i)) {
        updatedProfiles.push({
          mineId: i,
          isBomb: true,
          isDimond: false,
          isSafe: false
        });
      }

      // already opened diamond
      else if (this.minesProfiles[i]?.isDimond) {
        updatedProfiles.push({
          mineId: i,
          isDimond: true,
          isBomb: false,
          isSafe: false
        });
      }

      // remaining safe tiles
      else {
        updatedProfiles.push({
          mineId: i,
          isSafe: true,
          isBomb: false,
          isDimond: false
        });
      }
    }
    this.minesProfiles = [...updatedProfiles];
  }


  get remainingRounds(): number {
    return Math.max(this.autoBetRounds - this.autoCurrentRound, 0);
  }

  updateBetAmount(type: 'increase' | 'decrease', percent: number) {
    if (percent <= 0) return;
    const changeAmount = (this.betAmount * percent) / 100;
    if (type === 'increase') {
      this.betAmount =
        Math.round((this.betAmount + changeAmount) * 100) / 100;
    } else {
      this.betAmount =
        Math.max(
          1,
          Math.round((this.betAmount - changeAmount) * 100) / 100
        );
    }
  }


  handleToaster(message: string) {
    this.errroMessage = message;
    this.showToaster = true;

    setTimeout(() => {
      this.showToaster = false;
    }, 2000);
  }


  resetMultiplierScroll() {
    setTimeout(() => {
      const container = this.multipliersRef?.nativeElement;

      if (!container) return;

      container.scrollTo({
        left: 0,
        top: 0,
        behavior: 'smooth'
      });
    }, 50);
  }


  setMines(value: number) {
    this.updateMines(value);
  }

  increaseMines() {
    this.updateMines(this.mines + 1);
  }

  decreaseMines() {
    this.updateMines(this.mines - 1);
  }

  onMinesInput(value: number) {
    this.updateMines(Number(value));
  }

  private clampMines(value: number): number {
    const min = 1;
    const max = 20; 

    return Math.max(min, Math.min(max, value || min));
  }

  private updateMines(value: number) {
    if (this.gameIsStart || this.isAutoRunning) return;
    const newValue = this.clampMines(value);
    if (this.mines === newValue) return;

    this.mines = newValue;
    this.multipliers = this.getMultipliers(this.mines);
    this.gemsFound = 0;
    this.multiplier = 1.0;
    this.multiplierCrossed = [];
  }
}
