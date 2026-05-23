import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HiloGameLimitsComponent } from "../../shared/components/hilo/hilo-game-limits/hilo-game-limits.component";
import { HiloGameRulesComponent } from "../../shared/components/hilo/hilo-game-rules/hilo-game-rules.component";
import { HiloHowToPlayComponent } from "../../shared/components/hilo/hilo-how-to-play/hilo-how-to-play.component";
import { HiliBethistoryComponent } from "../../shared/components/hilo/hili-bethistory/hili-bethistory.component";

export type Suit = { symbol: string; color: 'red' | 'black' };
export type Card = { rank: string; rankValue: number; suit: Suit };
export type GuessDirection = 'high' | 'low';

export interface HistoryEntry {
  card: Card;
  guess: GuessDirection;
  won: boolean;
}

export interface GameState {
  phase: 'idle' | 'betting' | 'guessing' | 'crashed' | 'cashedout';
  balance: number;
  bet: number;
  step: number;
  multiplier: number;
  currentCard: Card | null;
  nextCard: Card | null;
  history: HistoryEntry[];
  animating: boolean;
  nextRevealed: boolean;
  gameStarted: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = [
  { symbol: '♠', color: 'black' },
  { symbol: '♣', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
];


@Component({
  selector: 'app-hilo-game',
  standalone: true,
  imports: [DecimalPipe, NgFor, NgIf, NgClass, FormsModule, HiloGameLimitsComponent, HiloGameRulesComponent, HiloHowToPlayComponent, HiliBethistoryComponent],
  templateUrl: './hilo-game.component.html',
  styleUrl: './hilo-game.component.scss'
})
export class HiloGameComponent {
  showHowToPlay = false;
  showMenu: boolean = false;
  showGameRules: boolean = false;
  showGameLimits: boolean = false;
  showBetHistory: boolean = false;
  showWinCard: boolean = false;
  state: GameState = {
    phase: 'idle',
    balance: 1000,
    bet: 2,
    step: 0,
    multiplier: 1,
    // ── KEY CHANGE: load a random card immediately on init ──
    currentCard: this.randomCardStatic(),
    nextCard: null,
    history: [],
    animating: false,
    nextRevealed: false,
    gameStarted: false
  };
  currentFlipped = true;
  nextFlipped = false;
  nextPrepared = false;
  showStakes = false;

  amountStakes = [
    0.10, 0.20,
    0.30, 0.40,
    0.50, 0.60,
    0.70, 0.80,
    1.20, 2.00,
    4.00, 10.00,
    20.00, 50.00,
    100.00
  ];


  private _timers: ReturnType<typeof setTimeout>[] = [];
  @ViewChild('betPlaceAudioRef') betPlaceAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('cashoutAudioRef') cashoutAudio!: ElementRef<HTMLAudioElement>;
  @ViewChild('openCardAudioRef') openCardAudio!: ElementRef<HTMLAudioElement>;





  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this._timers.forEach(clearTimeout);
  }

  // ── Static helper (called before constructor injection is ready) ──────────
  private randomCardStatic(): Card {
    const rank = RANKS[Math.floor(Math.random() * 13)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { rank, rankValue: RANKS.indexOf(rank), suit };
  }

  selectStake(value: number) {
    this.state.bet = value;
    this.showStakes = false;
  }

  toggleStakes(){
    this.showStakes=!this.showStakes;
  }


  closeGameRules() {
    this.showGameRules = false;
  }
  openGameRules() {
    this.showGameRules = true;
  }
  closeMenus() {
    this.showMenu = false;
  }
  openMenus() {
    this.showMenu = true;
  }
  toggleMenus() {
    this.showMenu = !this.showMenu;
  }
  openHowToPlay() {
    this.showHowToPlay = true;
    this.showMenu = false;
  }
  closeHowToPlay() {
    this.showHowToPlay = !this.showHowToPlay;
  }
  closeGameLimits() {
    this.showGameLimits = false;
  }
  openGameLimits() {
    this.showGameLimits = true;
  }
  openBethistory() {
    this.showBetHistory = true;
  }
  closeBethistory() {
    this.showBetHistory = false;
  }
  // ── Computed getters ──────────────────────────────────────────────────────
  get balanceFormatted(): string {
    return this.state.balance.toFixed(2);
  }

  get multiplierText(): string {
    return this.state.multiplier.toFixed(2) + 'x';
  }

  get cashoutValue(): number {
    return parseFloat((this.state.bet * this.state.multiplier).toFixed(2));
  }

  get cashoutValueText(): string {
    return '$' + this.cashoutValue.toFixed(2) + ' USD';
  }

  get roundActive(): boolean {
    return this.state.phase === 'guessing';
  }

  get canCashout(): boolean {
    return this.state.phase === 'guessing' && this.state.step > 0 && !this.state.animating;
  }

  get guessButtonsDisabled(): boolean {
    return this.state.phase !== 'guessing' || this.state.animating;
  }

  get betControlsDisabled(): boolean {
    return this.state.phase === 'guessing' || this.state.phase === 'betting';
  }

  // ── KEY CHANGE: "Change Card" button only visible in idle phase ───────────
  get changeCardVisible(): boolean {
    return this.state.phase === 'idle';
  }

  get lowOddsText(): string {
    if (!this.state.currentCard) return '—';
    const prob = (this.state.currentCard.rankValue + 1) / 13;
    return (1 / prob).toFixed(2) + 'x';
  }

  get highOddsText(): string {
    if (!this.state.currentCard) return '—';
    const prob = (13 - this.state.currentCard.rankValue) / 13;
    return (1 / prob).toFixed(2) + 'x';
  }

  get actionLabel(): string {
    if (this.state.phase === 'guessing' && this.state.step > 0) return 'CASHOUT';
    return 'BET';
  }

  get actionBtnClass(): string {
    if (this.state.phase === 'guessing' && this.state.step > 0) return 'cashout-state';
    return 'bet-state';
  }

  get actionBtnDisabled(): boolean {
    if (this.state.phase === 'guessing') return !this.canCashout;
    if (this.state.animating) return true;
    return false;
  }

  isRed(card: Card): boolean {
    return card.suit.color === 'red';
  }

  // ── Game logic ────────────────────────────────────────────────────────────
  private randomCard(): Card {
    const rank = RANKS[Math.floor(Math.random() * 13)];
    const suit = SUITS[Math.floor(Math.random() * 4)];
    return { rank, rankValue: RANKS.indexOf(rank), suit };
  }

  private calcMultiplier(step: number): number {
    const raw = 1 + step * 0.42 + step * step * 0.05;
    return parseFloat(raw.toFixed(2));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const t = setTimeout(resolve, ms);
      this._timers.push(t);
    });
  }

  // ── KEY CHANGE: "Change Card" button handler ──────────────────────────────
  // Flips back, swaps card, flips to face again — small animation
  changeCard(): void {
    if (!this.changeCardVisible || this.state.animating) return;

    this.state.animating = true;
    this.currentFlipped = false;   // flip to back
    this.cdr.markForCheck();

    this._later(400, () => {
      this.state.currentCard = this.randomCard();
      this.cdr.markForCheck();
    });

    this._later(520, () => {
      this.currentFlipped = true;  // flip to face
      this.cdr.markForCheck();
    });

    this._later(1000, () => {
      this.state.animating = false;
      this.cdr.markForCheck();
    });
  }

  placeBet(): void {
    if (this.state.bet > this.state.balance) return;
    if (this.state.bet <= 0) return;

    this.state.balance = parseFloat((this.state.balance - this.state.bet).toFixed(2));
    this.state.phase = 'guessing';
    this.state.step = 0;
    this.state.multiplier = 1;
    this.state.history = [];
    this.state.animating = false;
    this.state.nextRevealed = false;
    this.nextFlipped = false;
    this.nextPrepared = false;
    this.state.gameStarted = true;
    this.currentFlipped = true;
    this.cdr.markForCheck();
    this.betPlaceAudio.nativeElement.play();
  }

  handleAction(): void {
    if (this.state.phase === 'guessing' && this.state.step > 0) {
      this.cashOut();
    } else if (this.state.phase !== 'guessing') {
      this.placeBet();
    }
  }

  async revealNext(direction: GuessDirection): Promise<void> {
    if (this.guessButtonsDisabled) return;

    this.state.animating = true;
    this.cdr.markForCheck();

    const next = this.randomCard();
    this.state.nextCard = next;
    this.nextFlipped = false;
    this.nextPrepared = true;
    this.openCardAudio.nativeElement.play();
    this.cdr.markForCheck();
    await this.delay(80);

    this.nextFlipped = true;
    this.cdr.markForCheck();

    await this.delay(620);

    const cur = this.state.currentCard!;
    let win = false;
    if (direction === 'high') win = next.rankValue >= cur.rankValue;
    else win = next.rankValue <= cur.rankValue;

    this.state.history.push({ card: cur, guess: direction, won: win });

    if (win) {
      this.state.step++;
      this.state.multiplier = this.calcMultiplier(this.state.step);

      this.state.currentCard = next;
      this.currentFlipped = true;

      await this.delay(200);
      this.nextFlipped = false;
      this.nextPrepared = false;
      this.state.nextCard = null;
      this.state.animating = false;
      this.cdr.markForCheck();

    } else {
      await this.delay(400);
      this.state.phase = 'crashed';
      this.state.animating = false;
      this.cdr.markForCheck();
      this.resetGame();
    }
  }

  cashOut(): void {
    if (!this.canCashout) return;
    const winnings = this.cashoutValue;
    this.state.balance = parseFloat((this.state.balance + winnings).toFixed(2));
    this.state.phase = 'cashedout';
    this.cashoutAudio.nativeElement.play();
    this.cdr.markForCheck();
    this.showWinCard = true;
    this.resetGame();
    setTimeout(() => {
      this.showWinCard = false;
    }, 2000)
  }

  resetGame(): void {
    this.state.phase = 'idle';
    this.state.step = 0;
    this.state.multiplier = 1;
    this.state.history = [];
    this.state.animating = false;
    this.state.currentCard = this.randomCard();
    this.state.nextCard = null;
    this.state.nextRevealed = false;
    this.currentFlipped = true;
    this.nextFlipped = false;
    this.nextPrepared = false;
    this.state.gameStarted = false;
    this.cdr.markForCheck();
  }

  adjustBet(delta: number): void {
    if (this.betControlsDisabled) return;
    this.state.bet = Math.max(0.1, parseFloat((this.state.bet + delta).toFixed(2)));
  }

  private _later(ms: number, fn: () => void): void {
    const t = setTimeout(fn, ms);
    this._timers.push(t);
  }
}