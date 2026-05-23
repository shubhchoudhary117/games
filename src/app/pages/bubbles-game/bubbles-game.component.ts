import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BubblesGameHeaderComponent } from "../../shared/components/bubbles/bubbles-game-header/bubbles-game-header.component";
import { BubbleGameRulesComponent } from "../../shared/components/bubbles-game/bubble-game-rules/bubble-game-rules.component";

interface FireParticle {
  id: number;
  dx: number;
  dy1: number;
  dy2: number;
  dy3: number;
  dur: number;
  delay: number;
  size: number;
  color: string;
  type: 'fire' | 'ember';
}

interface BubbleParticles {
  bubbleIndex: number;
  particles: FireParticle[];
}

@Component({
  selector: 'app-bubbles-game',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, NgIf, NgFor, NgStyle, BubblesGameHeaderComponent, BubbleGameRulesComponent],
  templateUrl: './bubbles-game.component.html',
  styleUrl: './bubbles-game.component.scss'
})
export class BubblesGameComponent implements OnInit {
  rows = 5;
  cols = 6;
  bubbles: number[] = [];
  selectedBubbles: number[] = [];
  today = new Date();
  balance = 1000;
  betAmount = 1;
  randomCount = 1;
  isPlacingBet = false;
  winningBubble: number = -1;
  bubbleResult: Map<number, 'winner' | 'popped'> = new Map();
  isRevealing: boolean = false;
  activeParticles: BubbleParticles[] = [];
  private particleIdCounter = 0;
  showWinCard = false;
  winAmount = '0.00';
  showGameRules: boolean = false;
  private STORAGE_KEY = 'bubbles_selected';
  @ViewChild('bubblesBlastAudio') bubblesBlastAudioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('gameWinAudio') gameWinAudioPlayer!: ElementRef<HTMLAudioElement>;
   isMobile:boolean = false; 

  readonly fireColors = ['#fff200', '#ffcc00', '#ff9900', '#ff6600', '#ff3300', '#ffaa00', '#ffffff', '#ffdd00'];
  readonly emberColors = ['#ff9900', '#ffcc00', '#ff6600', '#ff3300', '#ffff00'];

  get payout(): number {
    const total = this.rows * this.cols;
    const selected = this.selectedBubbles.length || 1;
    return parseFloat((total / selected).toFixed(2));
  }

  get payoutDisplay(): string {
    return `X${this.payout.toFixed(2)} * ${this.betAmount.toFixed(2)} $ = ${(this.payout * this.betAmount).toFixed(2)} $`;
  }

  get maxRandom(): number {
    return this.rows * this.cols;
  }

  ngOnInit(): void {
    this.generateGrid();
    this.loadSelectedBubbles();

    this.isMobile=window.matchMedia("(max-width:768px)").matches;
  }

  private saveSelectedBubbles(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.selectedBubbles));
  }

  bubbleAnimParams: { delay: number; duration: number; tx1: number; ty1: number; tx2: number; ty2: number }[] = [];

  generateGrid(): void {
    this.bubbles = Array(this.rows * this.cols).fill(0);
    this.bubbleResult = new Map();
    this.activeParticles = [];

    this.bubbleAnimParams = this.bubbles.map(() => ({
      duration: +(1.0 + Math.random() * 0.4).toFixed(2),
      delay: +(Math.random() * 2.4).toFixed(2),
      tx1: 1,
      ty1: 1,
      tx2: 2,
      ty2: 2,
    }));
  }

  getBubbleStyle(i: number): Record<string, string> {
    const p = this.bubbleAnimParams[i];
    if (!p) return {};
    return {
      '--b-delay': `${p.delay}s`,
      '--b-duration': `${p.duration}s`,
      '--b-tx1': `${p.tx1}px`,
      '--b-ty1': `-${p.ty1}px`,
      '--b-tx2': `${p.tx2}px`,
      '--b-ty2': `-${p.ty2}px`,
    };
  }

  getParticleStyle(p: FireParticle): Record<string, string> {
    return {
      '--dx': `${p.dx}px`,
      '--dy1': `${p.dy1}px`,
      '--dy2': `${p.dy2}px`,
      '--dy3': `${p.dy3}px`,
      '--pdur': `${p.dur}s`,
      '--pdelay': `${p.delay}s`,
      'width': `${p.size}px`,
      'height': `${p.size}px`,
      'background': p.color,
      'box-shadow': p.type === 'fire' ? `0 0 6px 3px ${p.color}99` : `0 0 4px 2px ${p.color}`,
      'border-radius': p.type === 'fire' ? '50% 50% 30% 30%' : '50%',
      'animation-duration': `${p.dur}s`,
      'animation-delay': `${p.delay}s`,
    };
  }

  getParticlesForBubble(bubbleIndex: number): FireParticle[] {
    return this.activeParticles.find(bp => bp.bubbleIndex === bubbleIndex)?.particles ?? [];
  }

  private generateParticles(bubbleIndex: number): void {
    const particles: FireParticle[] = [];

    // 🔥 Fire particles — upward rising
    for (let i = 0; i < 18; i++) {
      const angle = (Math.random() * 280) - 140;
      const rad = angle * Math.PI / 180;
      const dist = 18 + Math.random() * 22;
      particles.push({
        id: this.particleIdCounter++,
        type: 'fire',
        dx: Math.sin(rad) * dist,
        dy1: -(15 + Math.random() * 15),
        dy2: -(30 + Math.random() * 20),
        dy3: -(48 + Math.random() * 25),
        dur: +(0.45 + Math.random() * 0.3).toFixed(2),
        delay: +(Math.random() * 0.06).toFixed(2),
        size: +(7 + Math.random() * 7).toFixed(1),
        color: this.fireColors[Math.floor(Math.random() * this.fireColors.length)],
      });
    }

    // ✨ Ember sparks — outward all directions
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * 360;
      const rad = angle * Math.PI / 180;
      const dist = 22 + Math.random() * 32;
      particles.push({
        id: this.particleIdCounter++,
        type: 'ember',
        dx: Math.cos(rad) * dist,
        dy1: Math.sin(rad) * dist - Math.random() * 15,
        dy2: 0,
        dy3: 0,
        dur: +(0.28 + Math.random() * 0.28).toFixed(2),
        delay: +(Math.random() * 0.05).toFixed(2),
        size: 4,
        color: this.emberColors[Math.floor(Math.random() * this.emberColors.length)],
      });
    }

    this.activeParticles.push({ bubbleIndex, particles });
  }

  toggleBubble(index: number): void {
    if (this.selectedBubbles.includes(index)) {
      this.selectedBubbles = this.selectedBubbles.filter(i => i !== index);
    } else {
      this.selectedBubbles.push(index);
    }

    this.saveSelectedBubbles();
  }

  clearBubbles(): void {
    this.selectedBubbles = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  increaseVertical(): void {
    if (this.rows < 6) { this.rows++; this.generateGrid(); }
  }
  decreaseVertical(): void {
    if (this.rows > 1) { this.rows--; this.generateGrid(); }
  }
  increaseHorizontal(): void {
    if (this.cols < 10) { this.cols++; this.generateGrid(); }
  }
  decreaseHorizontal(): void {
    if (this.cols > 1) { this.cols--; this.generateGrid(); }
  }

  chooseRandomly(): void {
    const total = this.rows * this.cols;
    const count = Math.min(this.randomCount, total);
    const shuffled = [...Array(total).keys()].sort(() => Math.random() - 0.5);
    this.selectedBubbles = shuffled.slice(0, count);
  }

  setBetMin(): void { this.betAmount = 1; }
  setBetMax(): void { this.betAmount = this.balance; }
  increaseBet(): void { this.betAmount = Math.min(this.betAmount + 1, this.balance); }
  decreaseBet(): void { this.betAmount = Math.max(this.betAmount - 1, 1); }

  placeBet(): void {
    if (this.selectedBubbles.length === 0 || this.isPlacingBet) return;

    this.isPlacingBet = true;
    this.bubbleResult = new Map();
    this.activeParticles = [];
    this.isRevealing = false;

    setTimeout(() => {
      const total = this.rows * this.cols;
      this.winningBubble = Math.floor(Math.random() * total);
      const won = this.selectedBubbles.includes(this.winningBubble);

      if (won) {
        const earned = this.betAmount * (this.payout - 1);
        this.balance += earned;
        this.winAmount = earned.toFixed(2);
        this.gameWinAudioPlayer.nativeElement.play();
        setTimeout(() => {
          this.showWinCard = true;
        }, 600);
      } else {
        this.balance -= this.betAmount;
      }
      this.balance = parseFloat(this.balance.toFixed(2));

      this.isPlacingBet = false;
      this.isRevealing = true;

      const losers = this.selectedBubbles.filter(i => i !== this.winningBubble);

      losers.forEach(bubbleIndex => {
        this.generateParticles(bubbleIndex);
      });
      // this.bubblesBlastAudioPlayer.nativeElement.play();
      this.playBlastSound();

      setTimeout(() => {
        losers.forEach(bubbleIndex => {
          this.bubbleResult.set(bubbleIndex, 'popped');
        });
        this.bubbleResult = new Map(this.bubbleResult);
      }, 80);

      setTimeout(() => {
        this.bubbleResult.set(this.winningBubble, 'winner');
        this.bubbleResult = new Map(this.bubbleResult);
      }, 400);

      setTimeout(() => {
        this.activeParticles = [];
      }, 900);

      setTimeout(() => {
        this.bubbleResult = new Map();
        this.winningBubble = -1;
        this.isRevealing = false;
        this.showWinCard = false;
      }, 3000);

    }, 800);
  }

  onRandomSliderChange(value: number): void {
    this.randomCount = Math.max(1, Math.min(value, this.maxRandom));
  }

  get gridTemplateColumns(): string {
    return `repeat(${this.cols}, 1fr)`;
  }

  onVerticalSlider(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.rows = val;
    this.generateGrid();

    const total = this.rows * this.cols;
    const count = Math.min(this.randomCount, total);
    const shuffled = [...Array(total).keys()].sort(() => Math.random() - 0.5);
    this.selectedBubbles = shuffled.slice(0, count);
  }

  onHorizontalSlider(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.cols = val;
    this.generateGrid();
    const total = this.rows * this.cols;
    const count = Math.min(this.randomCount, total);
    const shuffled = [...Array(total).keys()].sort(() => Math.random() - 0.5);
    this.selectedBubbles = shuffled.slice(0, count);
  }

  getBubbleResult(i: number): string {
    return this.bubbleResult.get(i) ?? '';
  }

  private playBlastSound(): void {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(120, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
    boomGain.gain.setValueAtTime(1.2, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.start(ctx.currentTime);
    boom.stop(ctx.currentTime + 0.35);

    // 🔥 Layer 2: White noise crackle/fire
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(ctx.currentTime);

    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(400, ctx.currentTime);
    click.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
    clickGain.gain.setValueAtTime(0.8, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.1);

    setTimeout(() => ctx.close(), 600);
  }

  dismissWinCard(): void {
    this.showWinCard = false;
  }

  private loadSelectedBubbles(): void {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      this.selectedBubbles = JSON.parse(data);
    }
  }

  deleteChoosedBubbles(): void {
    this.selectedBubbles = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }



  
}