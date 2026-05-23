import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardType, HotlineGameService } from './hotline.service';
import { HotlineHowToPlayComponent } from "../../shared/components/hotline/hotline-how-to-play/hotline-how-to-play.component";

interface ResultData {
  win: boolean;
  type: CardType;
  payout: number;
}

@Component({
  selector: 'app-hotline-game',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, FormsModule, HotlineHowToPlayComponent],
  templateUrl: './hotline-game.component.html',
  styleUrl: './hotline-game.component.scss',
})
export class HotlineGameComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── Canvas / wrapper refs ─────────────────────────────────────────────────
  @ViewChild('gameCvs') gameCvsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wrapEl') wrapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('placeBetAudio') placeBetAudioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('gameOverAudio') gameOverAudioRef!: ElementRef<HTMLAudioElement>;

  private ctx!: CanvasRenderingContext2D;
  private rafId = 0;
  private resizeObs!: ResizeObserver;

  // ── UI state signals ──────────────────────────────────────────────────────
  buttonsDisabled = signal(false);
  toastMsg = signal<string | null>(null);
  showWinState = signal(false);
  winBannerData = signal<{ label: string; card: string; amt: string } | null>(null);
  instructText = signal('PICK A COLOR TO SPIN');
  instructColor = signal('#28A774');

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private bannerTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Component-level state ─────────────────────────────────────────────────
  showMenu = false;
  showStakes = false;
  betAmount = 10;
  showHowToPlay:boolean = false;

  // ── Derived from service ──────────────────────────────────────────────────
  balance = computed(() => this.game.balanceFormatted());
  pays = computed(() => this.game.currentPays());

  // ── Card colors for canvas drawing ───────────────────────────────────────
  private readonly COLORS: Record<CardType, { g0: string; g1: string; border: string; shadow: string }> = {
    red: { g0: '#e02a48', g1: '#6a0c18', border: '#f04060', shadow: 'rgba(224,42,72,.8)' },
    yellow: { g0: '#f5a623', g1: '#6a3c00', border: '#f5c842', shadow: 'rgba(245,166,35,.9)' },
    black: { g0: '#2e3e52', g1: '#0a1018', border: '#4a6080', shadow: 'rgba(0,10,30,.6)' },
  };

  constructor(public game: HotlineGameService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    const gc = this.gameCvsRef.nativeElement;
    this.ctx = gc.getContext('2d')!;
    this.resizeCanvas();
    this.game.initBeltIdle(gc.width);

    this.resizeObs = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObs.observe(this.wrapRef.nativeElement);

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObs?.disconnect();
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (this.buttonsDisabled()) return;
    if (e.code === 'KeyR') this.choiceAndSpin('red');
    if (e.code === 'KeyY') this.choiceAndSpin('yellow');
    if (e.code === 'KeyB') this.choiceAndSpin('black');
  }

  // ── Canvas resize ─────────────────────────────────────────────────────────
  resizeCanvas(): void {
    const wrap = this.wrapRef.nativeElement;
    const gc = this.gameCvsRef.nativeElement;
    gc.width = Math.min(wrap.clientWidth, 960);
    gc.height = 250;
  }

  playSound(name: 'placeBet' | 'gameOver'): void {
    if (name === 'placeBet') {
      this.placeBetAudioRef.nativeElement.currentTime = 0;
      this.placeBetAudioRef.nativeElement.play();
    } else if (name === 'gameOver') {
      this.gameOverAudioRef.nativeElement.currentTime = 0;
      this.gameOverAudioRef.nativeElement.play();
    }
  }

  closeHowToPlay(){
    this.showHowToPlay = false;
  }

  openHotToPlay(){
    this.showHowToPlay = true;
  }

  // ── Main RAF loop ─────────────────────────────────────────────────────────
  private loop(): void {
    const justStopped = this.game.tick();

    if (justStopped) {
       this.playSound('gameOver');
      setTimeout(() => {
        const res = this.game.evaluate();
        this.displayResult(res.win, res.type, res.payout);

        setTimeout(() => {
          this.game.initBeltIdle(this.gameCvsRef.nativeElement.width);
          this.draw();
        }, 400);

        setTimeout(() => {
          this.game.resetAfterSpin();
          this.buttonsDisabled.set(false);
          this.instructText.set('PICK A COLOR TO SPIN');
          this.instructColor.set('#28A774');
        }, 2600);
      }, 300);
    }

    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  // ── Canvas draw ───────────────────────────────────────────────────────────
  private draw(): void {
    const gc = this.gameCvsRef.nativeElement;
    const c = this.ctx;
    const CW = this.game.CW;
    const CH = this.game.CH;
    const STRIDE = this.game.STRIDE;
    const s = this.game.state;

    c.clearRect(0, 0, gc.width, gc.height);
    const cy = (gc.height - CH) / 2;
    const cenX = gc.width / 2;

    c.save();
    c.beginPath();
    c.rect(0, 0, gc.width, gc.height);
    c.clip();

    const beltLen = s.belt.length;
    if (!beltLen) { c.restore(); return; }

    const firstVisible = Math.floor((s.offset - cenX - CW) / STRIDE);
    const lastVisible = Math.ceil((s.offset + gc.width - cenX + CW) / STRIDE);

    for (let idx = firstVisible; idx <= lastVisible; idx++) {
      const beltIdx = ((idx % beltLen) + beltLen) % beltLen;
      const cardX = idx * STRIDE - s.offset + cenX - STRIDE / 2;
      if (cardX + CW < 0 || cardX > gc.width) continue;
      const cardCx = cardX + CW / 2;
      const atCenter = Math.abs(cardCx - cenX) < CW / 2 + 4;
     const highlight = atCenter && s.phase === 'stopped';
      this.drawCard(c, cardX, cy, s.belt[beltIdx].type, highlight);
    }

    c.restore();
  }

  private drawCard(
    c: CanvasRenderingContext2D,
    x: number, y: number,
    type: CardType,
    highlight: boolean
  ): void {
    const CW = this.game.CW;
    const CH = this.game.CH;
    const col = this.COLORS[type];
    const s = this.game.state;

    c.save();
    if (highlight) { c.shadowColor = col.shadow; c.shadowBlur = 40; }

    // Background gradient
    const g = c.createLinearGradient(x, y, x, y + CH);
    g.addColorStop(0, col.g0);
    g.addColorStop(1, col.g1);
    this.rr(c, x, y, CW, CH, 10);
    c.fillStyle = g;
    c.fill();

    // Shine
    const shine = c.createLinearGradient(x, y, x, y + CH * 0.45);
    shine.addColorStop(0, 'rgba(255,255,255,.18)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    this.rr(c, x, y, CW, CH, 10);
    c.fillStyle = shine;
    c.fill();

    // Border
    
    c.shadowBlur = 0;
    c.strokeStyle = highlight ? '#f5c842' : col.border;
    c.lineWidth = highlight ? 3 : 1.8;
    this.rr(c, x, y, CW, CH, 10);
    c.stroke();

    // Card symbol
    c.textAlign = 'center';
    c.textBaseline = 'middle';

    if (type === 'yellow') {
      c.font = `${CH * 0.44}px serif`;
      c.fillStyle = '#ffffff';
      c.shadowColor = 'rgba(255, 200, 0, 0.8)';
      c.shadowBlur = 10;
      c.fillText('🔥', x + CW / 2, y + CH / 2);
    } else {
      const cr = CH * 0.18;
      c.beginPath();
      c.arc(x + CW / 2, y + CH / 2, cr, 0, Math.PI * 2);
      const dg = c.createRadialGradient(
        x + CW / 2, y + CH / 2, 0,
        x + CW / 2, y + CH / 2, cr
      );
      dg.addColorStop(0, type === 'red' ? 'rgba(255,180,180,.5)' : 'rgba(180,200,255,.2)');
      dg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = dg;
      c.fill();
      c.strokeStyle = type === 'red' ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.22)';
      c.lineWidth = 2;
      c.stroke();


    }

    // Glow pulse when stopped on this card
    if (highlight && s.phase === 'stopped') {
      const wa = 0.12 + 0.14 * Math.sin(s.glowT * 2);
      c.fillStyle = `rgba(255,220,60,${wa})`;
      this.rr(c, x, y, CW, CH, 10);
      c.fill();

      c.save();
      c.strokeStyle = `rgba(255,240,100,${wa * 1.5})`;
      c.lineWidth = 1;
      for (let a = 0; a < 6; a++) {
        const ang = a * (Math.PI / 3) + s.glowT * 0.5;
        const r1 = CH * 0.12;
        const r2 = CH * 0.22;
        c.beginPath();
        c.moveTo(x + CW / 2 + Math.cos(ang) * r1, y + CH / 2 + Math.sin(ang) * r1);
        c.lineTo(x + CW / 2 + Math.cos(ang) * r2, y + CH / 2 + Math.sin(ang) * r2);
        c.stroke();
      }
      c.restore();
    }

    c.restore();
  }

  private rr(
    c: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ): void {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  // ── Choice + spin ─────────────────────────────────────────────────────────
  choiceAndSpin(choice: CardType): void {
    if (this.buttonsDisabled()) return;
    this.game.selectChoice(choice);
    setTimeout(() => this.onSpin(), 70);
  }

  private onSpin(): void {
    this.playSound('placeBet');
    const result = this.game.startSpin(this.gameCvsRef.nativeElement.width);

    if (result === 'no_choice') { this.showToast('Choose RED, FIRE or BLACK!'); return; }
    if (result === 'no_balance') { this.showToast('Insufficient balance!'); return; }
    if (result === 'already_spinning') return;

    if (result === 'ok') {
      this.buttonsDisabled.set(true);
      this.instructText.set('SPINNING...');
      this.instructColor.set('#f5a623');
      this.showWinState.set(false);
    }
  }

  // ── Display result ────────────────────────────────────────────────────────
  private displayResult(win: boolean, type: CardType, payout: number): void {
   
    if (win) {
      const label = type === 'yellow' ? 'HOTLINE HIT!' : 'YOU WIN!';
      const card = type === 'yellow' ? 'FIRE 🔥' : type.toUpperCase();
      const amt = `+$${payout.toFixed(2)}`;
      this.winBannerData.set({ label, card, amt });
      this.showWinState.set(true);
      if (this.bannerTimer) clearTimeout(this.bannerTimer);
      this.bannerTimer = setTimeout(() => this.showWinState.set(false), 4000);
    } else {
      this.instructText.set(`${type.toUpperCase()} — BETTER LUCK NEXT TIME`);
      this.instructColor.set('#ff5555');
    }
  }

  // ── Toast notification ────────────────────────────────────────────────────
  showToast(msg: string): void {
    this.toastMsg.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMsg.set(null), 1850);
  }

  // ── Template helpers ──────────────────────────────────────────────────────
  isSelected(c: CardType): boolean { return this.game.choice() === c; }
  getRedMult(): string { return `X${this.pays().red}`; }
  getYelMult(): string { return `X${this.pays().yellow}`; }
  getBlkMult(): string { return `X${this.pays().black}`; }

  // ── Menu ──────────────────────────────────────────────────────────────────
  toggleMenu(): void { this.showMenu = !this.showMenu; }

  // ── Bet controls ──────────────────────────────────────────────────────────
  adjustBet(dir: number): void {
    this.betAmount = Math.max(0.10, Math.round((this.betAmount + dir) * 100) / 100);
    this.game.state.bet = this.betAmount;
    this.game.bet.set(this.betAmount);
  }

  selectStake(s: number): void {
    this.betAmount = s;
    this.game.state.bet = s;
    this.game.bet.set(s);
    this.showStakes = false;
  }

  onBetInputChange(): void {
    const v = Math.max(0.10, this.betAmount);
    this.betAmount = v;
    this.game.state.bet = v;
    this.game.bet.set(v);
  }

  closeBanner(): void {
    this.showWinState.set(false);
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
  }
}