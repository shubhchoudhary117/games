import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FortyHotSevenService } from './forty-hot-seven.service';
import { FortyHotSeventControlsComponent } from "../../shared/components/forty-hot-seven/forty-hot-sevent-controls/forty-hot-sevent-controls.component";
import { ForyHotSevenGridComponent } from "../../shared/components/forty-hot-seven/fory-hot-seven-grid/fory-hot-seven-grid.component";
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FortyHotSevenLoadingscreenComponent } from "../../shared/components/forty-hot-seven/forty-hot-seven-loadingscreen/forty-hot-seven-loadingscreen.component";

@Component({
  selector: 'app-forty-hot-seven',
  standalone: true,
  imports: [FortyHotSeventControlsComponent, ForyHotSevenGridComponent, DecimalPipe, NgFor, NgIf, FortyHotSevenLoadingscreenComponent],
  templateUrl: './forty-hot-seven.component.html',
  styleUrl: './forty-hot-seven.component.scss'
})
export class FortyHotSevenComponent {
  isGameLoading=true;
  balance    = 938;
  currentBet = 120;
  isSpinning = false;
  autoplay   = false;
  autoRounds = 0;
  gambleMode = false;
  grid: string[][]          = [];
  winCells: [number,number][] = [];
  spinningCols              = new Set<number>();
  winAmount    = 0;
  showWin      = false;
  showBigWin   = false;
  clock        = '';

    @ViewChild('winAudioPlayer') winAudioPlayer!: ElementRef<HTMLAudioElement>;
  
  

  private smokeInterval?: ReturnType<typeof setInterval>;
  private clockInterval?: ReturnType<typeof setInterval>;
  private keyHandler = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.handleSpin(); }
  };

  readonly smokeParticles: { left: string; dur: string; delay: string }[] = [];

  constructor(
    private svc: FortyHotSevenService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.grid = this.svc.generateGrid();
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    document.addEventListener('keydown', this.keyHandler);
    this.smokeInterval = setInterval(() => this.addSmoke(), 600);
  }

  ngOnDestroy(): void {
    clearInterval(this.smokeInterval);
    clearInterval(this.clockInterval);
    document.removeEventListener('keydown', this.keyHandler);
  }

  // ─── Clock ───────────────────────────────────────────────────────────────
  updateClock(): void {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.clock = `⏱ ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  // ─── Smoke ───────────────────────────────────────────────────────────────
  addSmoke(): void {
    const p = {
      left:  `${Math.random() * 100}%`,
      dur:   `${3 + Math.random() * 3}s`,
      delay: `${Math.random() * 2}s`,
    };
    this.smokeParticles.push(p);
    if (this.smokeParticles.length > 30) this.smokeParticles.shift();
  }

  // ─── Spin ────────────────────────────────────────────────────────────────
  async handleSpin(): Promise<void> {
    if (this.isSpinning) return;
    if (this.balance < this.currentBet) { alert('Insufficient balance!'); return; }

    this.isSpinning = true;
    this.showWin    = false;
    this.showBigWin = false;
    this.winCells   = [];
    this.balance   -= this.currentBet;
    this.spinningCols = new Set([0, 1, 2, 3, 4]);

    const newGrid = this.svc.generateGrid();

    for (let c = 0; c < this.svc.COLS; c++) {
      await this.svc.delay(200 + c * 180);
      for (let r = 0; r < this.svc.ROWS; r++) {
        this.grid[r][c] = newGrid[r][c];
      }
      this.spinningCols = new Set([...this.spinningCols].filter(x => x !== c));
      this.cdr.markForCheck();
    }

    await this.svc.delay(200);

    const { totalWin, winCells } = this.svc.evaluate(this.grid, this.currentBet);

    if (totalWin > 0) {
      this.winAudioPlayer.nativeElement.play();
      this.balance  += totalWin;
      this.winAmount = totalWin;
      this.winCells  = winCells;
      this.showWin   = true;
      if (totalWin >= this.currentBet * 5) {
        this.showBigWin = true;
        setTimeout(() => { this.showBigWin = false; this.cdr.markForCheck(); }, 2200);
      }
      this.spawnCoins();
    }

    this.isSpinning = false;
    this.cdr.markForCheck();

    // Autoplay
    if (this.autoplay && this.autoRounds > 0) {
      this.autoRounds--;
      if (this.autoRounds <= 0) { this.autoplay = false; }
      await this.svc.delay(800);
      this.handleSpin();
    }
  }

  onBetChange(amount: number): void { this.currentBet = amount; }

  onAutoToggle(): void {
    if (this.isSpinning) return;
    this.autoplay   = !this.autoplay;
    this.autoRounds = this.autoplay ? 10 : 0;
    if (this.autoplay) this.handleSpin();
  }

  onGambleToggle(): void { this.gambleMode = !this.gambleMode; }

  // ─── Coins ───────────────────────────────────────────────────────────────
  spawnCoins(): void {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 18; i++) {
      const coin = document.createElement('div');
      coin.className = 'hs-coin';
      coin.textContent = '🪙';
      const angle = Math.random() * Math.PI * 2;
      const dist  = 100 + Math.random() * 200;
      coin.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      coin.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      coin.style.left  = cx + 'px';
      coin.style.top   = cy + 'px';
      coin.style.animationDelay = Math.random() * 0.3 + 's';
      document.body.appendChild(coin);
      setTimeout(() => coin.remove(), 1600);
    }
  }

  onLoadingComplete(){
    this.isGameLoading=false
  }
}
