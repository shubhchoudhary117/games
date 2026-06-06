import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  HostListener,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { DxMenuCardComponent } from "../../shared/components/double-x/dx-menu-card/dx-menu-card.component";
import { DoubleXMenuService } from './services/dx-menu.service';
import { DxHtpModalComponent } from "../../shared/components/double-x/dx-htp-modal/dx-htp-modal.component";
import { DxGameRulesModalComponent } from "../../shared/components/double-x/dx-game-rules-modal/dx-game-rules-modal.component";
import { DxBetHistoryComponent } from "../../shared/components/double-x/dx-bet-history/dx-bet-history.component";
import { NavigationStart, Router } from '@angular/router';
import { DxSoundService } from './services/dx.sound.service';



type BetType = 'red' | 'green' | 'gray';

interface HistoryItem {
  userName: string;
  amount: number;
}

interface BetHistoryCard {
  type: BetType;
  multiplier: string;
  totalBets: number;
  totalAmount: number;
  histories: HistoryItem[];
}

interface CardItem {
  x: string;
  number: number;
  color: BetType;
  type: BetType;
}





@Component({
  selector: 'app-double-x-game',
  standalone: true,
  imports: [
    CommonModule,
    DxMenuCardComponent,
    DxHtpModalComponent,
    DxGameRulesModalComponent,
    DxBetHistoryComponent
  ],
  templateUrl: './double-x-game.component.html',
  styleUrl: './double-x-game.component.scss'
})
export class DoubleXGameComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cardsTrack') cardsTrack!: ElementRef;
  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  @ViewChild('bgMusic') bgMusic!: ElementRef<HTMLAudioElement>;
  @ViewChild('timerSound') timerSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('cardsSound') cardsSound!: ElementRef<HTMLAudioElement>;
  multipliers: BetType[] = [
    'red',
    'green',
    'gray',
    'red',
    'red',
    'green',
    'gray'
  ];


  betConfigs: any = {
    red: {
      multiplier: '2x',
      winMultiplier: 2,
      color: 'red'
    },

    green: {
      multiplier: '14x',
      winMultiplier: 14,
      color: 'green'
    },

    gray: {
      multiplier: '2x',
      winMultiplier: 2,
      color: 'gray'
    }
  };


  betHistoryCards: BetHistoryCard[] = [
    {
      type: 'red',
      multiplier: this.betConfigs.red.multiplier,
      totalBets: 0,
      totalAmount: 0,
      histories: []
    },

    {
      type: 'green',
      multiplier: this.betConfigs.green.multiplier,
      totalBets: 0,
      totalAmount: 0,
      histories: []
    },

    {
      type: 'gray',
      multiplier: this.betConfigs.gray.multiplier,
      totalBets: 0,
      totalAmount: 0,
      histories: []
    }
  ];



  cards: CardItem[] = [
    {
      x: this.betConfigs.red.multiplier.toUpperCase(),
      number: 1,
      color: 'red',
      type: 'red'
    },

    {
      x: this.betConfigs.green.multiplier.toUpperCase(),
      number: 2,
      color: 'green',
      type: 'green'
    },

    {
      x: this.betConfigs.gray.multiplier.toUpperCase(),
      number: 3,
      color: 'gray',
      type: 'gray'
    },

    {
      x: this.betConfigs.red.multiplier.toUpperCase(),
      number: 4,
      color: 'red',
      type: 'red'
    },

    {
      x: this.betConfigs.green.multiplier.toUpperCase(),
      number: 5,
      color: 'green',
      type: 'green'
    },

    {
      x: this.betConfigs.gray.multiplier.toUpperCase(),
      number: 6,
      color: 'gray',
      type: 'gray'
    }
  ];


  showMenuCard = false;
  displayCards: any[] = [];
  countdown = 7;
  progress = 100;
  spinning = false;
  showProgress = true;
  winnerCard: any = null;
  balance = 10000;
  betAmount = 10;
  selectedBets: ('red' | 'green' | 'gray')[] = [];
  winAmount: number = 0;
  showWinPopup = false;
  gameIsRunning = false;
  minBetAmount = 10;
  maxBetAmount = 10000;
  showAllMultipliers: boolean = false;

  // ── Match SCSS exactly ───────────────────────────────────────────
  private readonly CARD_WIDTH = 38;
  private readonly CARD_GAP = 8;
  private readonly TRACK_PAD_L = 30;
  private readonly CARD_STEP = this.CARD_WIDTH + this.CARD_GAP; // 46 px

  private readonly SPIN_DURATION_MS = 10000; // 10 seconds total

  private countdownInterval: any = null;
  private progressInterval: any = null;
  private autoSpinTimeout: any = null;
  private resetTimeout: any = null;
  private exitScrollTimeout: any = null;
  private spinRafId: any = null;
  private cardsSoundPlayed = false;
  private currentOffset = 0;

  constructor(
    public dxMenuService: DoubleXMenuService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dxSoundService: DxSoundService
  ) {

    this.dxMenuService.soundEnabled$.subscribe((enabled) => {

      this.dxSoundService.setSoundState(enabled);

      if (!enabled) {

        this.dxSoundService.stopAll([
          this.timerSound,
          this.cardsSound
        ]);

      }

    });

    this.dxMenuService.musicEnabled$.subscribe((enabled) => {
      this.dxSoundService.setMusicState(enabled);
      if (!enabled) {
        this.dxSoundService.stop(this.bgMusic);
      } else {
        this.playBgMusic();
      }
    });
  }

  ngOnInit(): void { this.generateCards(); }

  ngAfterViewInit(): void { setTimeout(() => this.initGame(), 200); }

  ngOnDestroy(): void {
    this.clearAllTimers();
    this.stopAllSounds();
  }


  private initGame(): void {
    const track = this.cardsTrack.nativeElement as HTMLElement;
    track.style.visibility = 'hidden';
    track.style.transition = 'none';
    track.style.transform = 'translateX(0px)';
    this.currentOffset = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.snapToCenter();
        track.style.visibility = 'visible';
        this.startRound();
        this.updateMusicState();
      });
    });
  }


  generateCards(): void {
    this.displayCards = [];
    for (let i = 0; i < 80; i++) this.displayCards.push(...this.cards);
  }

  // ================================================================
  // OFFSET HELPERS
  // ================================================================

  /** Pixel offset needed to center card[index] in the container viewport */
  private calcOffset(index: number): number {
    const containerW = (this.cardsContainer.nativeElement as HTMLElement).offsetWidth;
    const cardLeft = this.TRACK_PAD_L + index * this.CARD_STEP;
    return cardLeft - containerW / 2 + this.CARD_WIDTH / 2;
  }

  /** Apply offset to track WITHOUT animation (instant snap) */
  private snapTrack(offset: number): void {
    const track = this.cardsTrack.nativeElement as HTMLElement;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${offset}px)`;
    this.currentOffset = offset;
    // Force reflow — critical for Safari/iPhone to commit position immediately
    void track.offsetHeight;
  }

  /** Snap track to the center card (used as initial / reset position) */
  private snapToCenter(): void {
    const midIndex = Math.floor(this.displayCards.length / 2);
    this.snapTrack(this.calcOffset(midIndex));
  }

  // ================================================================
  // ROUND LIFECYCLE
  // ================================================================

  startRound(): void {
    this.gameIsRunning = false;
    this.winnerCard = null;
    this.countdown = 7;
    this.progress = 100;
    this.showWinPopup = false;
    this.spinning = false;
    this.cardsSoundPlayed = false;
    this.showProgress = true;

    this.clearAllTimers();
    this.stopTimerSound();

    this.ngZone.runOutsideAngular(() => {
      this.progressInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.progress -= 100 / 70;
          if (this.progress <= 0) this.progress = 0;
        });
      }, 100);
    });

    this.ngZone.runOutsideAngular(() => {
      this.countdownInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.countdown--;
          if (this.countdown === 3) this.playTimerSound();
          if (this.countdown <= 0) {
            this.clearCountdownAndProgress();
            this.stopTimerSound();
            this.showProgress = false;
            this.startSpin();
          }
        });
      }, 1000);
    });
  }

  // ================================================================
  // SPIN  — pure rAF-based, always RIGHT, always slow start
  // ================================================================

  startSpin(): void {
    if (this.spinning) return;
    this.spinning = true;
    this.gameIsRunning = true;

    if (!this.cardsSoundPlayed) {
      this.cardsSoundPlayed = true;
      this.playCardsSound();
    }

    // 1. Pick winner card
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    this.winnerCard = this.cards[randomIndex];

    // 2. Find a target card in the 60–80% window (always AHEAD of current center)
    const total = this.displayCards.length;
    const minIdx = Math.floor(total * 0.60);
    const maxIdx = Math.floor(total * 0.80);

    let targetIndex = -1;
    for (let i = minIdx; i <= maxIdx; i++) {
      if (this.displayCards[i].number === this.winnerCard.number) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) { this.spinning = false; return; }

    const targetOffset = this.calcOffset(targetIndex);

    // 3. If target is NOT strictly ahead, re-snap center further back.
    //    This handles edge cases where currentOffset is already past target.
    if (targetOffset <= this.currentOffset) {
      // Snap to 10% mark so target is definitely ahead
      const safeIdx = Math.floor(total * 0.10);
      this.snapTrack(this.calcOffset(safeIdx));
    }

    const startOffset = this.currentOffset;
    const totalPixels = targetOffset - startOffset; // always positive → RIGHT ✓

    // 4. rAF spin with custom easing
    //    ease-in-out-sine: starts at 0 velocity, peaks at mid, ends at 0 velocity
    //    Formula: -(cos(π * t) - 1) / 2
    const duration = this.SPIN_DURATION_MS;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);           // 0 → 1

      // ease-in-out-sine: very slow start, fast middle, very slow end
      const eased = -(Math.cos(Math.PI * t) - 1) / 2;

      const newOffset = startOffset + totalPixels * eased;
      this.applyOffset(newOffset);

      if (t < 1) {
        this.spinRafId = requestAnimationFrame(animate);
      } else {
        // Snap exactly to target
        this.snapTrack(targetOffset);
        this.onSpinComplete();
      }
    };

    this.ngZone.runOutsideAngular(() => {
      this.spinRafId = requestAnimationFrame(animate);
    });
  }

  /** Apply offset directly to DOM (no style.transition needed) */
  private applyOffset(offset: number): void {
    const track = this.cardsTrack.nativeElement as HTMLElement;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${offset}px)`;
    this.currentOffset = offset;
  }

  private onSpinComplete(): void {
    this.ngZone.run(() => {
      this.stopCardsSound();
      this.updateMultiplierHistory();
      this.checkWin();
      this.spinning = false;

      this.resetTimeout = setTimeout(() => {
        this.doExitScroll(() => this.resetBoard());
      }, 3000);
    });
  }

  // ================================================================
  // EXIT SCROLL — smooth rAF RIGHT scroll after result display
  // ================================================================

  doExitScroll(onDone: () => void): void {
    const total = this.displayCards.length;
    const minIdx = Math.floor(total * 0.85);
    const maxIdx = Math.floor(total * 0.95);
    const randIdx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx));

    const exitOffset = this.calcOffset(randIdx);
    const startOffset = this.currentOffset;

    // If somehow exit is behind current, skip scroll
    if (exitOffset <= startOffset) { onDone(); return; }

    const totalPixels = exitOffset - startOffset;
    const duration = 1800;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.applyOffset(startOffset + totalPixels * eased);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this.snapTrack(exitOffset);
        onDone();
      }
    };

    this.ngZone.runOutsideAngular(() => requestAnimationFrame(animate));
  }

  // ================================================================
  // RESET BOARD
  // ================================================================

  resetBoard(): void {
    this.gameIsRunning = false;
    this.clearAllTimers();

    this.generateCards();
    this.selectedBets = [];
    this.cdr.detectChanges();

    const track = this.cardsTrack.nativeElement as HTMLElement;
    track.style.visibility = 'hidden';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.snapToCenter();
        track.style.visibility = 'visible';
        this.startRound();
      });
    });
  }

  // ================================================================
  // WIN CHECK
  // ================================================================

  checkWin(): void {
    if (!this.selectedBets.length) return;
    const isWinner =
      this.selectedBets.includes(this.winnerCard.type);
    if (!isWinner) return;
    const config =
      this.betConfigs[this.winnerCard.type];
    const totalWin =
      this.betAmount * config.winMultiplier;
    this.balance += totalWin;
    this.winAmount = totalWin;
    this.showWinPopup = true;
  }

  // =================================BET

  placeBet(type: BetType): void {
    if (this.spinning || this.countdown <= 0) return;
    if (this.selectedBets.includes(type)) {
      this.selectedBets =
        this.selectedBets.filter(b => b !== type);
      this.balance += this.betAmount;
      this.removeBetHistory(type);
      return;
    }

    if (this.selectedBets.length >= 2) return;
    if (this.balance < this.betAmount) return;
    this.balance -= this.betAmount;
    this.selectedBets.push(type);
    this.addBetHistory(type);
  }

  isDisabled(type: 'red' | 'green' | 'gray'): boolean {
    const isSelected =
      this.selectedBets.includes(type);
    if (isSelected) {
      return false;
    }

    if (this.gameIsRunning) {
      if (this.selectedBets.length === 0) {
        return true;
      }
      return true;
    }
    return this.selectedBets.length >= 2;
  }

  toggleMenuCard(): void { 
    this.dxMenuService.openMenuCard();
   }

  @HostListener('window:resize')
  onResize(): void { this.clearAllTimers(); this.initGame(); }

  // ==========================TIMERS// ================================

  private clearAllTimers(): void {
    clearInterval(this.countdownInterval);
    clearInterval(this.progressInterval);
    clearTimeout(this.autoSpinTimeout);
    clearTimeout(this.resetTimeout);
    clearTimeout(this.exitScrollTimeout);
    if (this.spinRafId) cancelAnimationFrame(this.spinRafId);
    this.countdownInterval = null;
    this.progressInterval = null;
    this.autoSpinTimeout = null;
    this.resetTimeout = null;
    this.exitScrollTimeout = null;
    this.spinRafId = null;
  }

  private clearCountdownAndProgress(): void {
    clearInterval(this.countdownInterval);
    clearInterval(this.progressInterval);
    this.countdownInterval = null;
    this.progressInterval = null;
  }

  // ================================== SOUND
  playTimerSound(): void {
    if (!this.dxMenuService.soundEnabled) return;
    this.dxSoundService.play(this.timerSound, 0.4);
  }

  stopTimerSound(): void {
    this.dxSoundService.stop(this.timerSound);
  }

  playCardsSound(): void {
    if (!this.dxMenuService.soundEnabled) return;
    this.dxSoundService.play(this.cardsSound, 0.5);
  }
  stopCardsSound(): void {
    this.dxSoundService.stop(this.cardsSound);
  }

  updateMusicState(): void {
    if (!this.dxMenuService.musicEnabled) {
      this.dxSoundService.stop(this.bgMusic);
      return;
    }
    this.dxSoundService.loop(this.bgMusic, 0.03);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.stopAllSounds();
    } else {
      this.playBgMusic();
    }
  }

  pauseBgMusic(): void {
    this.dxSoundService.stop(this.bgMusic);
  }
  playBgMusic(): void {
    if (!this.dxMenuService.musicEnabled) return;
    this.dxSoundService.loop(this.bgMusic, 0.03);
  }



  onAmountChange(event: Event): void {

    const value =
      Number((event.target as HTMLInputElement).value);

    if (!value || value < this.minBetAmount) {
      this.betAmount = this.minBetAmount;
      return;
    }

    if (value > this.balance) {
      this.betAmount = this.balance;
      return;
    }

    this.betAmount = value;
  }

  doubleAmount(): void {
    const doubled = this.betAmount * 2;
    if (doubled > this.balance) {
      this.betAmount = this.balance;
      return;
    }
    this.betAmount = doubled;
  }

  halfAmount(): void {
    const halved = Math.floor(this.betAmount / 2);
    this.betAmount =
      halved < this.minBetAmount
        ? this.minBetAmount
        : halved;
  }

  setMaxAmount(): void {
    this.betAmount = this.balance;
  }

  setMinAmount(): void {
    this.betAmount = this.minBetAmount;
  }



  addBetHistory(type: BetType): void {

    const historyCard =
      this.betHistoryCards.find(card => card.type === type);

    if (!historyCard) return;

    const historyItem: HistoryItem = {
      userName: 'You',
      amount: this.betAmount
    };

    historyCard.histories.unshift(historyItem);
    historyCard.histories =
      historyCard.histories.slice(0, 10);
    historyCard.totalBets += 1;
    historyCard.totalAmount += this.betAmount;
  }


  removeBetHistory(type: BetType): void {
    const historyCard =
      this.betHistoryCards.find(card => card.type === type);

    if (!historyCard) return;
    const index =
      historyCard.histories.findIndex(
        h => h.userName === 'You'
      );
    if (index > -1) {
      const removedAmount =
        historyCard.histories[index].amount;
      historyCard.histories.splice(index, 1);
      historyCard.totalBets -= 1;
      historyCard.totalAmount -= removedAmount;
    }
  }

  updateMultiplierHistory(): void {
    const latestResult =
      this.winnerCard.type as BetType;
    this.multipliers.unshift(latestResult);
    this.multipliers = this.multipliers.slice(0, 20);
  }


  toggleAllMultipliers() {
    this.showAllMultipliers = !this.showAllMultipliers;
  }




  @HostListener('window:pagehide')
  @HostListener('window:beforeunload')
  onPageLeave(): void {
    this.stopAllSounds();
  }

  stopAllSounds(): void {
    this.dxSoundService.stopAll([
      this.bgMusic,
      this.timerSound,
      this.cardsSound
    ]);
  }

}