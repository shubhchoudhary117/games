import { NgFor, NgIf, NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BetHistoryEntry, PattoKingMenucardComponent } from '../../shared/components/patto-king/patto-king-menucard/patto-king-menucard.component';

export interface Card {
  rank: string;
  suitCode: string;
  imagePath: string;
  isRed: boolean;
}

export type RoundStatus = 'idle' | 'teen-patti' | 'do-patti' | 'loss';

export interface Round {
  index: number;
  cards: Card[];
  status: RoundStatus;
  winRank: string;
  matchIndices: number[];
  revealed: boolean[];
  flipping: boolean[];
}

@Component({
  selector: 'app-patto-king',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, PattoKingMenucardComponent],
  templateUrl: './patto-king.component.html',
  styleUrl: './patto-king.component.scss'
})
export class PattoKingComponent implements OnInit {

  readonly ROUNDS = 5;
  readonly CARD_PATH = 'assets/patto-king/cards/';
  readonly BACK_IMG = 'assets/patto-king/card-back.png';
  readonly SUIT_CODES = ['S', 'H', 'D', 'C'];
  readonly RANK_CODES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  showWinCard = false;
  showLossCard = false;
  allCardsLoaded = false;
  menuOpen = false;
  soundEnabled = true;
  stakesOpen = false;
  stakeOptions = [10, 20, 50, 100, 150, 200, 300, 500];
  betHistory: BetHistoryEntry[] = [];

@Output() betChange = new EventEmitter<number>();
  @ViewChild('cardFlipAudio') cardFlipAudioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('winAudio') winAudioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('placeBetAudio') placeBetAudioPlayer!: ElementRef<HTMLAudioElement>;

  rounds: Round[] = [];
  coins = 1000;
  betAmount = 50;
  isDealing = false;
  gameOver = false;
  totalWins = 0;
  lastNetGain = 0;

  private fullDeck: Card[] = [];
  private dealId = 0;

  get teenPattiRounds() { return this.rounds.filter(r => r.status === 'teen-patti'); }
  get doPattiRounds() { return this.rounds.filter(r => r.status === 'do-patti'); }
  get winRoundsCount() { return this.rounds.filter(r => r.status !== 'idle' && r.status !== 'loss').length; }

  ngOnInit() {
    this.buildDeck();
    this.initRounds();
    this.preloadAllCards();
    const saved = localStorage.getItem('pk-sound');
    if (saved !== null) this.soundEnabled = saved === 'true';
  }

  buildDeck() {
    this.fullDeck = [];
    this.SUIT_CODES.forEach(s => {
      this.RANK_CODES.forEach(r => {
        this.fullDeck.push({ rank: r, suitCode: s, imagePath: `${this.CARD_PATH}${r}${s}.png`, isRed: s === 'H' || s === 'D' });
      });
    });
  }

  initRounds() {
    this.rounds = Array.from({ length: this.ROUNDS }, (_, i) => ({
      index: i, cards: [], status: 'idle' as RoundStatus,
      winRank: '', matchIndices: [],
      revealed: [false, false, false], flipping: [false, false, false]
    }));
    this.gameOver = false;
    this.lastNetGain = 0;
    this.showWinCard = false;
    this.showLossCard = false;
  }

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  evaluate(cards: Card[]): { status: RoundStatus; rank: string; indices: number[] } {
    const [a, b, c] = cards.map(x => x.rank);
    if (a === b && b === c) return { status: 'teen-patti', rank: a, indices: [0, 1, 2] };
    if (a === b) return { status: 'do-patti', rank: a, indices: [0, 1] };
    if (b === c) return { status: 'do-patti', rank: b, indices: [1, 2] };
    if (a === c) return { status: 'do-patti', rank: a, indices: [0, 2] };
    return { status: 'loss', rank: '', indices: [] };
  }

 private playFlipSound() {
  if (!this.soundEnabled) return;
  try {
    const audio = this.cardFlipAudioPlayer.nativeElement;
    const fresh = new Audio(audio.src);
    fresh.volume = audio.volume || 1;
    fresh.play().catch(() => { });
  } catch (e) { }
}

  private playAudio(ref: ElementRef<HTMLAudioElement>) {
    if (!this.soundEnabled) return;
    try { ref.nativeElement.play().catch(() => { }); } catch (e) { }
  }

  openMenu() { this.menuOpen = true; }
  closeMenu() { this.menuOpen = false; }
  onSoundChange(on: boolean) { this.soundEnabled = on; }

  async deal() {
    if (this.isDealing) return;
    if (this.coins < this.betAmount) return;

    const currentDeal = ++this.dealId;
    const betSnapshot = this.betAmount;

    this.coins -= this.betAmount;
    this.isDealing = true;
    this.showWinCard = false;
    this.showLossCard = false;
    this.playAudio(this.placeBetAudioPlayer);

    this.rounds = this.rounds.map(r => ({
      ...r, status: 'idle' as RoundStatus, winRank: '', matchIndices: [],
      revealed: [false, false, false], flipping: [true, true, true], cards: []
    }));

    await this.delay(200);
    if (currentDeal !== this.dealId) return;

    const deck = this.shuffle(this.fullDeck);
    let idx = 0;
    this.rounds = this.rounds.map(r => ({ ...r, cards: [deck[idx++], deck[idx++], deck[idx++]] }));

    await this.delay(150);
    if (currentDeal !== this.dealId) return;

    for (let i = 0; i < this.rounds.length; i++) {
       this.playFlipSound();
      for (let c = 0; c < 3; c++) {
        await this.delay(120);
        if (currentDeal !== this.dealId) return;
        const round = this.rounds[i];
        const updatedRound = { ...round, revealed: [...round.revealed], flipping: [...round.flipping] };
        updatedRound.flipping[c] = false;
        updatedRound.revealed[c] = true;
        this.rounds[i] = updatedRound;
        this.rounds = [...this.rounds];
       
      }
      await this.delay(150);
      if (currentDeal !== this.dealId) return;
      const round = this.rounds[i];
      const { status, rank, indices } = this.evaluate(round.cards);
      this.rounds[i] = { ...round, status, winRank: rank, matchIndices: indices };
      this.rounds = [...this.rounds];
    }

    if (currentDeal !== this.dealId) return;

    let winAmt = 0;
    this.rounds.forEach(r => {
      if (r.status === 'teen-patti') winAmt += this.betAmount * 5;
      else if (r.status === 'do-patti') winAmt += this.betAmount * 2;
    });

    this.lastNetGain = winAmt;
    this.coins += winAmt;

    // Record in bet history
    const entry: BetHistoryEntry = {
      bet: betSnapshot,
      netGain: winAmt - betSnapshot,
      teenPatti: this.rounds.filter(r => r.status === 'teen-patti').length,
      doPatti: this.rounds.filter(r => r.status === 'do-patti').length,
      timestamp: new Date()
    };
    this.betHistory = [...this.betHistory, entry].slice(-50);

    if (winAmt > 0) {
      this.playAudio(this.winAudioPlayer);
      this.showWinCard = true;
      this.totalWins++;
      setTimeout(() => {
        if (currentDeal !== this.dealId) return;
        this.showWinCard = false;
        this.resetAfterResult();
      }, 2000);
    } else {
      this.showLossCard = true;
      setTimeout(() => {
        if (currentDeal !== this.dealId) return;
        this.showLossCard = false;
        this.resetAfterResult();
      }, 2000);
    }

    this.isDealing = false;
    this.gameOver = true;
  }

  private resetAfterResult() {
    this.rounds.forEach(r => {
      r.status = 'idle'; r.winRank = ''; r.matchIndices = [];
      r.revealed = [false, false, false]; r.flipping = [false, false, false]; r.cards = [];
    });
    this.gameOver = false;
    this.lastNetGain = 0;
  }



  delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
  trackRound(i: number, r: Round) { return r.index; }
  trackCard(i: number) { return i; }
  getCards(round: Round): (Card | null)[] { return round.cards.length ? round.cards : [null, null, null]; }

  preloadedImages: { [key: string]: HTMLImageElement } = {};
  preloadAllCards() {
    let loaded = 0;
    const total = 52;
    this.fullDeck.forEach(card => {
      const img = new Image();
      img.onload = () => { loaded++; if (loaded === total) this.allCardsLoaded = true; };
      img.src = card.imagePath;
      this.preloadedImages[card.imagePath] = img;
    });
  }



  toggleStakes() {
  this.stakesOpen = !this.stakesOpen;
}
 
selectStake(amount: number) {
  this.betAmount = amount;
  this.stakesOpen = false;          
}
 
onBetInput(event: Event) {
  const raw = +(event.target as HTMLInputElement).value;
  const clamped = Math.min(500, Math.max(10, Math.round(raw / 10) * 10));
  this.betAmount = clamped;
  (event.target as HTMLInputElement).value = String(clamped);
}
 
onBetFocus(event: Event) {
  // select all text on focus for quick overwrite
  (event.target as HTMLInputElement).select();
}
 
changeBet(delta: number) {
  const next = this.betAmount + delta;
  this.betAmount = Math.min(500, Math.max(10, next));
}
}