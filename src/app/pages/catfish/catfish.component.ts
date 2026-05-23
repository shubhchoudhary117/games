import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, ViewChild } from '@angular/core';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { dummyCatfishes } from '../../data/catfish/DummyData';
import { CatfishHeaderComponent } from "../../shared/components/catfish/catfish-header/catfish-header.component";

export interface SwipeProfile {
  id: number;
  name: string;
  age: number;
  image: string;
  isCatfish: boolean;
}

@Component({
  selector: 'app-catfish',
  standalone: true,
  imports: [DecimalPipe, NgFor, NgStyle, NgIf, NgClass, FormsModule, CatfishHeaderComponent],
  templateUrl: './catfish.component.html',
  styleUrl: './catfish.component.scss'
})
export class CatfishComponent {
  @ViewChild('topCardRef') topCardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('backgroundAudio') backgroundAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('cashoutAudio') cashoutAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('catfishedAudio') catfishedAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('swepAudio') swepAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('multiplierScroll') multiplierScrollRef!: ElementRef<HTMLDivElement>;
  readonly baseProfiles = dummyCatfishes.slice(0, 25).map((p: any, i: number) => ({
    id: i,
    name: p.name,
    age: p.age,
    image: p.img,
    isCatfish: false
  }));

  // ── Game state ────────────────────────────────────────────
  stack: SwipeProfile[] = [];
  roundProfiles: SwipeProfile[] = [];   // all 25 for this round
  swipedProfiles: SwipeProfile[] = [];  // profiles swiped so far

  gameActive = false;
  gameState: 'idle' | 'loading' | 'playing' | 'result' = 'idle';
  loadingProgress = 0;
  loadingMessage = 'Initializing game...';

  // Result
  resultType: 'cashout' | 'gameover' | 'catfish' = 'cashout';
  resultAmount = 0;

  // Cashout tracking
  safeSwipes = 0;
  currentCashoutAmount = 0;

  balance = 0.00;
  betAmount = 10;
  catfishCount = 2;
  stakeOptions = [10, 50, 100, 200];
  catfishOptions = [3, 5, 10, 24];

  readonly multiplierLadder = [
    1.08, 1.17, 1.29, 1.41, 1.56, 1.74,
    1.94, 2.18, 2.48, 2.83, 3.26, 3.81
  ];

  get multiplierDisplay(): string[] {
    return this.multiplierLadder.map(m => 'x' + m.toFixed(2));
  }

  // ── Drag state ────────────────────────────────────────────
  private pointerDown = false;
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private rafId = 0;

  cardTx = 0; cardTy = 0; cardRot = 0; cardOpacity = 1;
  nopeOpacity = 0; likeOpacity = 0;
  nextScale = 0.94; nextOpacity = 0.7;
  animating = false;
  cardTransition = 'none';

  get topCard(): SwipeProfile | null { return this.stack[0] ?? null; }
  get nextCard(): SwipeProfile | null { return this.stack[1] ?? null; }

  constructor(private cdr: ChangeDetectorRef, private zone: NgZone) { }
  ngOnInit() { }
  ngOnDestroy() { cancelAnimationFrame(this.rafId); }

  // ── Build round: shuffle + assign catfish ─────────────────
  private buildRound(): SwipeProfile[] {
    const shuffled = [...this.baseProfiles]
      .sort(() => Math.random() - 0.5)
      .map(p => ({ ...p, isCatfish: false }));

    const count = Math.min(this.catfishCount, shuffled.length);
    for (let i = 0; i < count; i++) shuffled[i].isCatfish = true;

    return shuffled.sort(() => Math.random() - 0.5);
  }

  playSound(type: 'cashout' | 'catfished' | 'swep' | 'background') {
    let audio!: HTMLAudioElement;

    if (type === 'cashout') {
      audio = this.cashoutAudioRef.nativeElement;
    } else if (type === 'catfished') {
      audio = this.catfishedAudioRef.nativeElement;
    } else if (type === 'swep') {
      audio = this.swepAudioRef.nativeElement;
    } else {
      audio = this.backgroundAudioRef.nativeElement;
    }

    if (!audio) return;

    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Audio play blocked:', err);
      });
    }
  }

  // ── Start Game ────────────────────────────────────────────
  startGame() {
    this.playSound('background');
    if (this.gameState === 'loading') return;

    this.gameState = 'loading';
    this.loadingProgress = 0;
    this.loadingMessage = 'Loading profiles...';
    this.swipedProfiles = [];
    this.safeSwipes = 0;
    this.currentCashoutAmount = this.betAmount;
    this.cdr.detectChanges();

    this.roundProfiles = this.buildRound();

    const imageUrls = this.roundProfiles.map(p => p.image);
    const total = imageUrls.length;
    let loaded = 0;

    const messages = ['Loading profiles...', 'Preparing cards...', 'Setting up the game...', 'Almost ready...'];

    const checkDone = () => {
      loaded++;
      this.loadingProgress = Math.round((loaded / total) * 100);
      const msgIndex = Math.min(Math.floor((this.loadingProgress / 100) * messages.length), messages.length - 1);
      this.loadingMessage = messages[msgIndex];
      this.cdr.detectChanges();

      if (loaded >= total) {
        this.loadingProgress = 100;
        this.loadingMessage = 'Get ready!';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.stack = [...this.roundProfiles];
          this.gameState = 'playing';
          this.gameActive = true;
          this.currentCashoutAmount = this.betAmount;
          this.resetCard(false);
          this.cdr.detectChanges();
        }, 3000);
      }
    };

    if (total === 0) {
      this.loadingProgress = 100; this.loadingMessage = 'Get ready!';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.stack = [...this.roundProfiles];
        this.gameState = 'playing'; this.gameActive = true;
        this.resetCard(false); this.cdr.detectChanges();
      }, 3000);
      return;
    }

    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = checkDone;
      img.onerror = checkDone;
      img.src = url;
    });
  }

  // ── Cash Out ──────────────────────────────────────────────
  onCashout() {
    if (!this.gameActive || this.animating) return;
    this.resultType = 'cashout';
    this.playSound('cashout');
    this.resultAmount = this.currentCashoutAmount;
    this.endGame();
  }

  // ── End Game → show result ────────────────────────────────
  private endGame() {
    this.gameActive = false;
    this.pointerDown = false;
    cancelAnimationFrame(this.rafId);
    this.resetCard(false);
    this.gameState = 'result';
    this.cdr.detectChanges();
  }

  // ── Play Again ────────────────────────────────────────────
  playAgain() {
    this.gameState = 'idle';
    this.swipedProfiles = [];
    this.safeSwipes = 0;
    this.currentCashoutAmount = this.betAmount;
    this.stack = [];
    this.roundProfiles = [];
    this.cdr.detectChanges();
  }

  // ── Pointer Events ────────────────────────────────────────
  onPointerDown(e: PointerEvent) {
    if (!this.gameActive || this.animating || !this.topCard) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.pointerDown = true;
    this.startX = e.clientX; this.startY = e.clientY;
    this.currentX = 0; this.currentY = 0;
    this.cardTransition = 'none';
    cancelAnimationFrame(this.rafId);
    this.tick();
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(e: PointerEvent) {
    if (!this.pointerDown) return;
    this.currentX = e.clientX - this.startX;
    this.currentY = e.clientY - this.startY;
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(e: PointerEvent) {
    if (!this.pointerDown) return;
    this.pointerDown = false;
    cancelAnimationFrame(this.rafId);
    const dx = this.currentX;
    if (Math.abs(dx) >= 100) {
      this.flyOut(dx > 0 ? 'right' : 'left');
    } else {
      this.cardTransition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s';
      this.cardTx = 0; this.cardTy = 0; this.cardRot = 0; this.cardOpacity = 1;
      this.nopeOpacity = 0; this.likeOpacity = 0;
      this.nextScale = 0.94; this.nextOpacity = 0.7;
      this.cdr.detectChanges();
    }
  }

  private tick() {
    this.rafId = requestAnimationFrame(() => {
      if (!this.pointerDown) return;
      const dx = this.currentX; const dy = this.currentY;
      const progress = Math.max(0, (Math.abs(dx) - 30)) / 70;
      this.nopeOpacity = dx < 0 ? Math.min(1, progress) : 0;
      this.likeOpacity = dx > 0 ? Math.min(1, progress) : 0;
      this.nextScale = 0.94 + progress * 0.06;
      this.nextOpacity = 0.7 + progress * 0.3;
      this.cardTx = dx; this.cardTy = dy * 0.3; this.cardRot = dx * 0.08;
      this.cdr.detectChanges();
      this.tick();
    });
  }

  onNope() {
    if (!this.gameActive || this.animating || !this.topCard) return; {
      this.flyOut('left');
      this.playSound('swep');
    }
  }
  onLike() {
    if (!this.gameActive || this.animating || !this.topCard) return; {
      this.flyOut('right');
      this.playSound('swep');
    }
  }

  // ── Core fly-out + game logic ─────────────────────────────
  private flyOut(dir: 'left' | 'right') {
    if (!this.topCard) return;
    const card = { ...this.topCard };
    const isLike = dir === 'right';

    this.animating = true;
    this.pointerDown = false;
    cancelAnimationFrame(this.rafId);

    const targetX = dir === 'left' ? -800 : 800;
    const targetRot = dir === 'left' ? -30 : 30;

    this.nopeOpacity = dir === 'left' ? 1 : 0;
    this.likeOpacity = dir === 'right' ? 1 : 0;
    this.cardTransition = 'transform 0.38s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.38s ease';
    this.cardTx = targetX; this.cardTy = -60; this.cardRot = targetRot; this.cardOpacity = 0;
    this.nextScale = 1; this.nextOpacity = 1;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.swipedProfiles.push(card);
      this.stack = this.stack.slice(1);
      if (isLike && card.isCatfish) {
        this.resultType = 'catfish';
        this.playSound('catfished');
        this.resultAmount = 0;
        this.animating = false;
        this.endGame();
        return;
      }

      // ── SAFE SWIPE: update cashout ──
      if (!card.isCatfish) {
        this.safeSwipes++;
        const idx = Math.min(this.safeSwipes - 1, this.multiplierLadder.length - 1);
        this.currentCashoutAmount = parseFloat((this.betAmount * this.multiplierLadder[idx]).toFixed(2));
        setTimeout(() => {
          this.scrollToActiveChip();
        }, 50);
      }

      // ── ALL CARDS GONE without hitting catfish = WIN ──
      if (this.stack.length === 0) {
        this.resultType = 'cashout';
        this.resultAmount = this.currentCashoutAmount;
        this.animating = false;
        this.endGame();
        return;
      }

      this.resetCard(false);
      this.animating = false;
      this.cdr.detectChanges();
    }, 400);
  }

  private resetCard(withTransition: boolean) {
    this.cardTransition = withTransition ? 'transform 0.3s ease' : 'none';
    this.cardTx = 0; this.cardTy = 0; this.cardRot = 0; this.cardOpacity = 1;
    this.nopeOpacity = 0; this.likeOpacity = 0;
    this.nextScale = 0.94; this.nextOpacity = 0.7;
  }

  private scrollToActiveChip() {
    const container = this.multiplierScrollRef?.nativeElement;
    if (!container) return;

    const activeIndex = this.safeSwipes - 1;
    if (activeIndex < 0) return;

    const chips = container.children;
    const activeChip = chips[activeIndex] as HTMLElement;

    if (!activeChip) return;

    const containerWidth = container.offsetWidth;
    const chipLeft = activeChip.offsetLeft;
    const chipWidth = activeChip.offsetWidth;

    const scrollPosition = chipLeft - (containerWidth / 2) + (chipWidth / 2);

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }

  // ── Bet helpers (locked during play) ─────────────────────
  setBet(v: number) { if (this.gameState === 'idle') this.betAmount = v; }
  increaseBet() { if (this.gameState !== 'idle') return; const i = this.stakeOptions.indexOf(this.betAmount); if (i < this.stakeOptions.length - 1) this.betAmount = this.stakeOptions[i + 1]; }
  decreaseBet() { if (this.gameState !== 'idle') return; const i = this.stakeOptions.indexOf(this.betAmount); if (i > 0) this.betAmount = this.stakeOptions[i - 1]; }
  setMax() { if (this.gameState === 'idle') this.betAmount = this.stakeOptions[this.stakeOptions.length - 1]; }
  setMin() { if (this.gameState === 'idle') this.betAmount = this.stakeOptions[0]; }
  setCatfish(v: number) { if (this.gameState === 'idle') this.catfishCount = v; }
  increaseCatfish() { if (this.gameState !== 'idle') return; const i = this.catfishOptions.indexOf(this.catfishCount); if (i < this.catfishOptions.length - 1) this.catfishCount = this.catfishOptions[i + 1]; }
  decreaseCatfish() { if (this.gameState !== 'idle') return; const i = this.catfishOptions.indexOf(this.catfishCount); if (i > 0) this.catfishCount = this.catfishOptions[i - 1]; }
}