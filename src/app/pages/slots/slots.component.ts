import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, inject,
} from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { BigWinAlertComponent } from '../../shared/components/slots/big-win-alert/big-win-alert.component';
import { RenderMikeComponent } from '../../shared/components/slots/render-mike/render-mike.component';
import { ValueViewerComponent } from '../../shared/components/slots/value-viewer/value-viewer.component';
import { SlotProps } from '../../types/slots/slots.types';
import { SlotsService } from './slots.service';
import { UserService } from '../../core/auth/user.service';
import { SlotSpinBoardComponent } from '../../shared/components/slots/slot-spin-board/slot-spin-board.component';
import { SlotsHeaderComponent } from '../../shared/components/slots/slots-header/slots-header.component';
import { SlotsResultPopupComponent } from '../../shared/components/slots/slots-result-popup/slots-result-popup.component';

const SYMBOL_OPTIONS = ['red', 'blue', 'green', 'yin_yang', 'hakkero', 'yellow', 'wild'];

function renderPlaceholder(): string[] {
  return Array.from({ length: 9 }, () =>
    SYMBOL_OPTIONS[Math.floor(Math.random() * SYMBOL_OPTIONS.length)]
  );
}

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [
    CommonModule, BigWinAlertComponent, RenderMikeComponent,
    ValueViewerComponent, NgIf, NgFor, SlotSpinBoardComponent,
    SlotsHeaderComponent, SlotsResultPopupComponent,
  ],
  templateUrl: './slots.component.html',
  styleUrls: ['./slots.component.scss'],
})
export class SlotsComponent implements OnInit, OnDestroy {
  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;

  grid: string[]             = renderPlaceholder();
  response: SlotProps | null = null;
  betAmount                  = 10;
  isSpinning                 = false;
  winningLines: string[]     = [];
  totalWins                  = 0;
  openBigWin                 = false;
  lostCount                  = 0;
  loadedImages               = 0;

  gamePhase: 'intro' | 'playing' = 'intro';
  showResultPopup                = false;
  popupType: 'win' | 'loss'      = 'win';

  readonly valueTypes: Array<'balance' | 'bet' | 'wins'> = ['balance', 'bet', 'wins'];

  readonly paytable = [
    { img: '/assets/slots/slot-images/wild.webp',    label: 'Wild',     mult: '50x' },
    { img: '/assets/slots/slot-images/hakkero.webp', label: 'Hakkero',  mult: '25x' },
    { img: '/assets/slots/slot-images/yin.webp',     label: 'Yin Yang', mult: '15x' },
    { img: '/assets/slots/slot-images/green.webp',   label: 'Yellow',   mult: '10x' },
    { img: '/assets/slots/slot-images/lily.webp',    label: 'Green',    mult: '5x'  },
    { img: '/assets/slots/slot-images/shangai.webp', label: 'Blue',     mult: '3x'  },
    { img: '/assets/slots/slot-images/red.webp',     label: 'Red',      mult: '2x'  },
  ];

  private gamesService = inject(SlotsService);
  userService          = inject(UserService);

  private clickHandler                                      = () => this.handleGlobalClick();
  private popupTimer: ReturnType<typeof setTimeout> | null = null;
  private resultTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    window.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('click', this.clickHandler);
    if (this.popupTimer)  clearTimeout(this.popupTimer);
    if (this.resultTimer) clearTimeout(this.resultTimer);
  }

  // ─── Intro ───────────────────────────────────────────────────────────────
  startGame(): void {
    this.gamePhase = 'playing';
  }

  // ─── Audio ───────────────────────────────────────────────────────────────
  startAudio(): void {
    setTimeout(() => {
      if (this.audioRef?.nativeElement) {
        this.audioRef.nativeElement.volume = 0.05;
        this.audioRef.nativeElement.play().catch(() => {});
      }
    }, 2800);
  }

  pauseAudio(): void {
    if (this.audioRef?.nativeElement) {
      this.audioRef.nativeElement.pause();
      this.audioRef.nativeElement.currentTime = 0;
    }
  }

  // ─── Global click — dismiss big win overlay ───────────────────────────────
  handleGlobalClick(): void {
    if (this.openBigWin) {
      this.openBigWin = false;
      this.pauseAudio();
    }
  }

  // ─── Spin ────────────────────────────────────────────────────────────────
  async handleSpin(): Promise<void> {
    if (this.isSpinning) return;

    this.isSpinning      = true;
    this.showResultPopup = false;
    this.openBigWin      = false;
    this.totalWins       = 0;

    if (this.userService.userData.walletBalance < this.betAmount) {
      alert('Insufficient funds!');
      this.isSpinning = false;
      return;
    }

    this.userService.deductBalance(this.betAmount);

    try {
      const response    = await this.gamesService.spinSlots(this.betAmount);
      this.response     = response;
      this.grid         = response.gridState;
      this.winningLines = response.lastSpinResult.map((r) => r.line);

      if (response.totalPayout > 0) {
        this.userService.creditBalance(response.totalPayout);
        this.lostCount = 0;
      } else {
        this.lostCount++;
      }

      if (response.totalPayout >= this.betAmount * 8) {
        this.openBigWin = true;
        this.startAudio();
      }

      // Step 1 — reel animation ends (3200ms)
      this.popupTimer = setTimeout(() => {
        this.totalWins  = response.totalPayout ?? 0;
        this.isSpinning = false;
        this.popupType  = response.totalPayout > 0 ? 'win' : 'loss';

        this.resultTimer = setTimeout(() => {
          this.showResultPopup = true;
        }, 1000);
      }, 3200);

    } catch (e: any) {
      console.error(e?.message ?? 'Error spinning slots');
      this.isSpinning = false;
    }
  }

  // ─── Popup actions ────────────────────────────────────────────────────────
  onPopupCollect(): void {
    this.showResultPopup = false;
  }

  onPopupPlayAgain(): void {
    this.showResultPopup = false;
    this.handleSpin();
  }

  // ─── Bet amount ───────────────────────────────────────────────────────────
  changeBet(type: 'add' | 'subtract'): void {
    const newBet = type === 'subtract' ? this.betAmount / 2 : this.betAmount * 2;
    if (newBet >= 1 && newBet <= 50000) this.betAmount = newBet;
  }

  // ─── Mike status ─────────────────────────────────────────────────────────
  getCurrentMike(): 'normal' | 'win' | 'losing' | 'jackpot' | undefined {
    if (!this.response)                return undefined;
    if (this.openBigWin)               return 'jackpot';
    if (this.response.totalPayout > 0) return 'win';
    if (this.lostCount >= 3)           return 'losing';
    return 'normal';
  }
}