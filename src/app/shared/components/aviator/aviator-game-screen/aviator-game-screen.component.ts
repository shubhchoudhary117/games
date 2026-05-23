import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { BetcontrollerComponent } from "../betcontroller/betcontroller.component";
import { BetPanel, GameState, LiveBet } from '../aviator.models';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RoundInfoService } from '../round-info/round-info.service';

@Component({
  selector: 'app-aviator-game-screen',
  standalone: true,
  imports: [NgStyle, NgIf, NgFor, BetcontrollerComponent, SidebarComponent],
  templateUrl: './aviator-game-screen.component.html',
  styleUrl: './aviator-game-screen.component.scss'
})
export class AviatorGameScreenComponent {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('aviatorBgSound') aviatorBgSoundPlayer!:ElementRef<HTMLAudioElement>;
   @ViewChild('aviatorFlaySound') aviatorFlaySoundPlayer!:ElementRef<HTMLAudioElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  isMobile: boolean = false;
  gameState: GameState = 'waiting';
  multiplier: number = 1.00;
  crashPoint: number = 1.00;
  flightTimeMs: number = 0;
  lastFrameTime: number = 0;
  countdown: number = 0;
  countdownInterval: any;
  private isSoundEnabled = false;
  showWinCard:boolean=false;
  cashoutAmount:number=0;


  // Player State
  balance: number = 3000.00;

  panels: BetPanel[] = [
    { id: 1, amount: 10, isPlacedForNext: false, isActive: false, wonThisRound: false, lastWinAmount: 0, autoBet: false, autoCashOut: false, autoCashOutMultiplier: 2.0, activeTab: 'bet' },
    { id: 2, amount: 10, isPlacedForNext: false, isActive: false, wonThisRound: false, lastWinAmount: 0, autoBet: false, autoCashOut: false, autoCashOutMultiplier: 2.0, activeTab: 'bet' },
  ];

  history: number[] = [7.06, 7.35, 12.49, 3.98, 1.79, 1.50, 1.00, 2.38, 1.04, 1.57, 1.49, 16.34, 30.19, 1.55, 1.26, 3.48, 1.00, 1.24, 1.13, 1.60, 5.82, 1.33, 2.12, 1.09, 3.27, 6.89, 5.96, 1.46, 2.72, 11.75, 1.00, 13.08, 2.80, 1.78, 2.86, 1.11, 1.00, 2.06, 9.58, 5.45, 4.12, 2.48, 52.71, 1.09, 3.16, 3.48, 5.99, 5.68, 1.42, 1.48];
  liveBets: LiveBet[] = [];

  images = [
    'assets/aviator/players-images/1.png',
    'assets/aviator/players-images/2.png',
    'assets/aviator/players-images/3.png',
    'assets/aviator/players-images/4.png',
    'assets/aviator/players-images/5.png',
    'assets/aviator/players-images/6.png',
    'assets/aviator/players-images/7.png'
  ]




  // SVG plane animation sprite sequence
  private planeFrames: HTMLImageElement[] = [];
  private bgSunSvg: HTMLImageElement = new Image();
  private assetsLoaded = 0;
  private planeLoaded = false;

  // Game settings
  isAnimationEnabled: boolean = true;

  // Isolated dynamic visual multiplier render-lock params
  private nextTickTime: number = 0;
  displayMult: number = 1.00;

  // Particles for flying away effect
  private flyAwayX: number = 0;
  private flyAwayY: number = 0;

  constructor(private ngZone: NgZone, private roundInfoService: RoundInfoService) { }


  ngOnInit() {
    this.isMobile = window.matchMedia("(max-width: 768px)").matches;
  }

  oepnRoundInfo() {
    this.roundInfoService.openRoundInfo();
  }


  ngAfterViewInit() {
    this.initCanvas();
    this.loadAssets();
    this.generateMockLiveBets();
    this.startBettingPhase();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    this.initCanvas();
    if (this.gameState !== 'flying') {
      this.drawCanvas(1.00);
    }
  }

  initCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    this.ctx = canvas.getContext('2d');
  }

  loadAssets() {
    this.assetsLoaded = 0;
    const totalAssets = 5; // 4 plane frames + 1 background

    const checkFn = () => {
      this.assetsLoaded++;
      if (this.assetsLoaded === totalAssets) {
        this.planeLoaded = true;
        if (this.gameState !== 'flying') this.drawCanvas(1.00);
      }
    };

    // Load animated Plane Sequence
    for (let i = 0; i < 4; i++) {
      const img = new Image();
      img.onload = checkFn;
      img.src = `/assets/aviator/plane-${i}.svg`;
      this.planeFrames.push(img);
    }

    this.bgSunSvg.onload = checkFn;
    this.bgSunSvg.src = '/assets/aviator/bg-sun.svg';
  }

  generateMockLiveBets() {
    const names = ["John***", "Alex***", "Play***", "User***", "Mike***", "Sarah***", "King***"];
    this.liveBets = Array.from({ length: 10 }, () => {
      const randomIndex = Math.floor(Math.random() * this.images.length);

      return {
        user: names[Math.floor(Math.random() * names.length)],
        amount: Math.floor(Math.random() * 100) + 1,
        image: this.images[randomIndex]
      };
    });
  }

  startBettingPhase() {
    this.gameState = 'betting';
    this.countdown = 6; // Spribe usually has 5-6s
    this.multiplier = 1.00;
    this.displayMult = 1.00;
    this.flyAwayX = 0;
    this.flyAwayY = 0;

    // Process Auto Bets
    this.panels.forEach(p => {
      p.wonThisRound = false;
      p.lastWinAmount = 0;
      if (p.autoBet && !p.isPlacedForNext && this.balance >= p.amount) {
        this.balance -= p.amount;
        p.isPlacedForNext = true;
      }
    });

    // Transfer queued bets to active bets
    this.panels.forEach(p => {
      if (p.isPlacedForNext) {
        p.isActive = true;
      } else {
        p.isActive = false;
      }
    });

    this.generateMockLiveBets();

    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(this.waitLoop.bind(this));
    });

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.startGame();
      }
    }, 1000);
  }

  waitLoop(currentTime: number) {
    if (this.gameState !== 'betting') return;
    this.drawCanvas(1.00);
    this.animationFrameId = requestAnimationFrame(this.waitLoop.bind(this));
  }

  startGame() {
    this.gameState = 'flying';
    this.flightTimeMs = 0;
    this.lastFrameTime = performance.now();
    this.nextTickTime = performance.now();
    this.multiplier = 1.00;
    this.displayMult = 1.00;

    const r = Math.random();
    this.crashPoint = Math.max(1.00, 0.99 / (1 - Math.pow(r, 0.5))); // Flatter distribution for Spribe realism
    if (this.crashPoint > 1000) this.crashPoint = 1000;
    if (Math.random() < 0.02) this.crashPoint = 1.00;

    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    });
  }

  gameLoop(currentTime: number) {
    if (this.gameState !== 'flying') return;

    const dt = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.flightTimeMs += dt;

    // TypeScript transposition of the User's exact Kotlin asynchronous iteration map!
    if (currentTime >= this.nextTickTime) {
      this.multiplier += this.multiplier * 0.008;

      // Calculate dynamic programmatic thread sleep mapping buffer inversely to mass
      const sleepTime = Math.max(10.0, 100 - (this.multiplier * 5));

      this.nextTickTime = currentTime + sleepTime;
      this.displayMult = this.multiplier;
    }

    // Process Auto Cash Outs
    let didAutoCashout = false;
    this.panels.forEach(p => {
      if (p.isActive && p.autoCashOut && this.multiplier >= p.autoCashOutMultiplier && !p.wonThisRound) {
        this.ngZone.run(() => {
          this.cashOut(p);
        });
        didAutoCashout = true;
      }
    });

    if (this.multiplier >= this.crashPoint) {
      this.ngZone.run(() => {
        this.crash();
      });
    } else {
      // Randomly mock live bet cashouts
      if (Math.random() < 0.02) {
        const l = this.liveBets.find(b => !b.multiplier);
        if (l) {
          this.ngZone.run(() => {
            l.multiplier = this.multiplier;
            l.cashout = l.amount * this.multiplier;
          });
        }
      }
      this.drawCanvas(this.displayMult);
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  crash() {
    this.gameState = 'crashed';
    this.multiplier = this.crashPoint;
    this.aviatorFlaySoundPlayer.nativeElement.play();


    // Add to history
    this.history.unshift(parseFloat(this.crashPoint.toFixed(2)));
    if (this.history.length > 50) this.history.pop();

    this.panels.forEach(p => {
      if (p.isActive && !p.wonThisRound) {
        p.isActive = false; // Lost
        p.isPlacedForNext = false; // Not automatically carried over unless auto bet
      }
    });

    this.flyAwayX = 0;
    this.flyAwayY = 0;

    this.drawCanvas(this.multiplier);

    setTimeout(() => {
      this.startBettingPhase();
    }, 4000);
  }

  drawCanvas(currentMult: number) {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.width;
    const h = canvas.height;

    this.ctx!.fillStyle = '#000000';
    this.ctx!.fillRect(0, 0, w, h);

    // Static Sunburst Background Layer
    if (this.planeLoaded && this.isAnimationEnabled) {
      this.ctx!.save();
      // Anchor sunburst perfectly in the absolute bottom-left corner
      this.ctx!.translate(0, h);
      this.ctx!.rotate(performance.now() * 0.0002);
      // Scale up to cover the full screen from the corner radially outward
      const diag = Math.sqrt(w * w + h * h) * 2.0;
      this.ctx!.globalAlpha = 0.8;
      this.ctx!.drawImage(this.bgSunSvg, -diag / 2, -diag / 2, diag, diag);
      this.ctx!.restore();
    }

    // Mapping coordinates for Spribe takeoff physics
    const originX = 0;
    const originY = h;

    // Spribe planes take slightly longer to reach the literal top right. Extending this slows
    // visual tracking speed proportionally over the multiplier lifespan.
    const MAX_ANIMATION_TIME = 6500;
    let progress = this.gameState === 'betting' ? 0 : Math.min(1.0, this.flightTimeMs / MAX_ANIMATION_TIME);

    // Separate X Strategy vs Y Strategy
    // The user requested exactly 50% less initial burst horizontal speed
    // Swapping trigonometric Sin(Ease-Out) to a pure linear progression significantly cuts starting horizontal velocity!
    let pEasedX = progress;
    // Strict cubic vertical climb: rigidly hugs the ground longer, then arcs beautifully to the top!
    let pEasedY = Math.pow(progress, 1.5);

    // Constrain max physics layout. We allocate more padding on the right because the tail stops at maxPlaneX,
    // and the 140px nose extends forward from there.
    const maxPlaneX = w > 600 ? w - 160 : w - 120;

    // Lower max peak altitude slightly out of the literal ceiling bounds
    const maxPlaneY = 110;

    // Start explicitly at 0 so it clips the left screen bound naturally
    const targetX = maxPlaneX * pEasedX;
    const targetY = originY - (originY - maxPlaneY) * pEasedY;

    // Integrate live continuous wobble into the physical coordinates before drawing the path
    // so the trace line tightly binds and moves with the plane's nose natively.
    let wobbleY = 0;
    let wobbleX = 0;
    if (this.gameState === 'flying') {
      // Taper oscillation intensity directly against progress so the plane NEVER dips downwards
      // during its early upward trajectory! Wobble ONLY maximizes exactly at the layout peak!
      const intensity = Math.pow(progress, 3);
      // Increased frequency by 30% as requested
      const rawWobbleY = Math.sin(performance.now() * 0.00065) * 65 * intensity;
      // Asymmetrical Float: Plunges deep down, but only bounces upward slightly!
      wobbleY = rawWobbleY < 0 ? rawWobbleY * 0.4 : rawWobbleY;
      wobbleX = Math.cos(performance.now() * 0.00039) * 8 * intensity;
    }

    const actualTargetX = targetX + wobbleX;
    // Strictly prevent any graphical coordinate from ever bleeding physically below the runway floor
    const actualTargetY = Math.min(originY, targetY + wobbleY);

    if (this.isAnimationEnabled) {
      // Draw solid Spribe curve
      this.ctx!.beginPath();
      this.ctx!.moveTo(originX, originY);
      if (this.gameState === 'flying' || this.gameState === 'crashed') {
        // The control point sits flat on the floor to generate the classic sweep curve!
        const cpX = originX + (actualTargetX - originX) * 0.5;
        const cpY = originY;
        this.ctx!.quadraticCurveTo(cpX, cpY, actualTargetX, actualTargetY);
      } else {
        // Betting phase, ground line
        this.ctx!.lineTo(actualTargetX, originY);
      }

      // Spribe red stroke
      this.ctx!.strokeStyle = '#e50539';
      this.ctx!.lineWidth = 5;

      if (this.gameState !== 'crashed' && this.gameState !== 'betting') {
        this.ctx!.stroke();

        // Solid vertical fill polygon mapping down to floor
        const gradient = this.ctx!.createLinearGradient(0, actualTargetY, 0, originY);
        // User requested significantly increased fill capacity (opacity heavily increased across both stops)
        gradient.addColorStop(0, 'rgba(172, 1, 41, 0.84)'); // Increased from 45% (0.45) to 75% (0.75) 
        gradient.addColorStop(1, 'rgba(209, 0, 0, 0.66)'); // Increased from 1% (0.01) to 15% (0.15) 

        this.ctx!.lineTo(actualTargetX, originY);
        this.ctx!.lineTo(originX, originY);
        this.ctx!.fillStyle = gradient;
        this.ctx!.fill();
      }
    }

    // Draw Multiplier Text and Glow
    if (this.gameState === 'flying' || this.gameState === 'crashed') {
      this.ctx!.save();
      const fontSize = Math.min(130, w / 5);

      // 1. Dynamic Radial Glow behind text!
      const themeHex = this.gameState === 'crashed' ? 'transparent' : this.getHistoryColor(currentMult);
      const glowRadius = Math.max(w, h) * 0.6;
      const glowGradient = this.ctx!.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowRadius);
      glowGradient.addColorStop(0, themeHex);
      glowGradient.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx!.globalAlpha = 0.4;
      this.ctx!.fillStyle = glowGradient;
      this.ctx!.beginPath();
      this.ctx!.arc(w / 2, h / 2, glowRadius, 0, Math.PI * 2);
      this.ctx!.fill();
      this.ctx!.globalAlpha = 1.0;

      // 2. Draw Multiplier Text
      this.ctx!.textAlign = "center";
      this.ctx!.textBaseline = "middle";
      this.ctx!.shadowColor = "rgba(0,0,0,0.4)";
      this.ctx!.shadowOffsetY = 3;
      this.ctx!.shadowBlur = 4;

      if (this.gameState === 'crashed') {
        this.ctx!.fillStyle = '#fff';
        this.ctx!.font = `700 ${40}px 'Inter', 'Roboto', sans-serif`;
        this.ctx!.fillText("FLEW AWAY!", w / 2, h / 2 - fontSize * 0.6);
      }

      this.ctx!.font = `700 ${70}px 'Inter', 'Roboto', sans-serif`;
      this.ctx!.fillStyle = this.gameState === 'crashed' ? '#E11432' : '#FFFFFF';
      this.ctx!.fillText(currentMult.toFixed(2) + "x", w / 2, h / 2 + (this.gameState === 'crashed' ? fontSize * 0.1 : -40));

      this.ctx!.restore();
    }

    // Draw Spribe Plane
    if (this.planeLoaded && this.isAnimationEnabled) {
      const pW = 140; // Spribe precise proportions
      const pH = 65;

      this.ctx!.save();

      // Pitch angle statically locked across the entire trajectory as requested!
      // Bypassing progressive bell-curve tilting; plane retains its exact takeoff pitch angle permanently.
      const tilt = 0.02; // Set to statically point slightly upward.

      if (this.gameState === 'flying') {
        this.ctx!.translate(actualTargetX, actualTargetY);
        this.ctx!.rotate(-tilt);

        // Shift drawing matrix so the (0,0) point (red line tip) targets exactly the bottom wheel!
        const curFrame = this.planeFrames[Math.floor(performance.now() / 40) % 4];
        this.ctx!.drawImage(curFrame, -10, -pH + 5, pW, pH);

      } else if (this.gameState === 'betting') {
        // Plane is grounded at the origin point spinning its engine natively!
        this.ctx!.translate(targetX, targetY);
        this.ctx!.rotate(-tilt);

        const curFrame = this.planeFrames[Math.floor(performance.now() / 40) % 4];
        this.ctx!.drawImage(curFrame, -10, -pH + 5, pW, pH);

      } else if (this.gameState === 'crashed') {
        this.flyAwayX += 45;
        this.flyAwayY -= 25;
        this.ctx!.globalAlpha = Math.max(0, 1 - (this.flyAwayX / 600));
        this.ctx!.translate(actualTargetX + this.flyAwayX, actualTargetY + this.flyAwayY);
        this.ctx!.rotate(-0.8);
        this.ctx!.drawImage(this.planeFrames[0], -10, -pH + 5, pW, pH);

        if (this.flyAwayX < 800) {
          requestAnimationFrame(() => this.drawCanvas(this.multiplier));
        }
      }
      this.ctx!.restore();
    }
  }

  toggleBet(panel: BetPanel) {
    if (this.gameState === 'betting') {
      if (panel.isPlacedForNext) {
        this.balance += panel.amount;
        panel.isPlacedForNext = false;
        panel.isActive = false;
      } else {
        if (this.balance >= panel.amount && panel.amount >= 0.1) {
          this.balance -= panel.amount;
          panel.isPlacedForNext = true;
          panel.isActive = true;
        }
      }
    } else if (this.gameState === 'flying') {
      if (panel.isActive && !panel.wonThisRound) {
        this.cashOut(panel);
      } else {
        if (panel.isPlacedForNext) {
          this.balance += panel.amount;
          panel.isPlacedForNext = false;
        } else {
          if (this.balance >= panel.amount && panel.amount >= 0.1) {
            this.balance -= panel.amount;
            panel.isPlacedForNext = true;
          }
        }
      }
    } else if (this.gameState === 'crashed') {
      if (panel.isPlacedForNext) {
        this.balance += panel.amount;
        panel.isPlacedForNext = false;
      } else {
        if (this.balance >= panel.amount && panel.amount >= 0.1) {
          this.balance -= panel.amount;
          panel.isPlacedForNext = true;
        }
      }
    }
  }

  cashOut(panel: BetPanel) {
    panel.wonThisRound = true;
    panel.isActive = false;
    panel.isPlacedForNext = false;
      this.showWinCard=true;
    panel.lastWinAmount = panel.amount * this.multiplier;
    this.cashoutAmount= panel.amount * this.multiplier;
    this.balance += panel.lastWinAmount;

    setTimeout(() => {
      this.showWinCard=false;
    }, 2000);
  }

  adjustBet(panel: BetPanel, delta: number) {
    if (panel.isPlacedForNext && this.gameState !== 'flying' && this.gameState !== 'crashed') return;
    panel.amount += delta;
    if (panel.amount < 0.1) panel.amount = 0.1;
  }

  setBet(panel: BetPanel, val: number) {
    if (panel.isPlacedForNext && this.gameState !== 'flying' && this.gameState !== 'crashed') return;
    panel.amount = val;
  }

  getButtonState(panel: BetPanel): { text: string, sub: string, classes: any } {
    if (this.gameState === 'betting') {
      if (panel.isPlacedForNext) {
        return { text: 'WAITING FOR', sub: 'NEXT ROUND', classes: { 'btn-cancel': true } };
      }
      return { text: 'BET', sub: panel.amount.toFixed(2) + ' USD', classes: { 'btn-bet': true } };
    }

    if (this.gameState === 'flying') {
      if (panel.isActive && !panel.wonThisRound) {
        return { text: 'CASH OUT', sub: (panel.amount * this.multiplier).toFixed(2) + ' USD', classes: { 'btn-cashout': true } };
      }
      if (panel.isPlacedForNext) {
        return { text: 'CANCEL', sub: '', classes: { 'btn-cancel': true } };
      }
      return { text: 'BET', sub: panel.amount.toFixed(2) + ' USD', classes: { 'btn-bet': true } };
    }

    // crashed
    if (panel.isPlacedForNext) {
      return { text: 'CANCEL', sub: '', classes: { 'btn-cancel': true } };
    }
    return { text: 'BET', sub: panel.amount.toFixed(2) + ' USD', classes: { 'btn-bet': true } };
  }

  getHistoryColor(mult: number): string {
    if (mult < 2.0) return '#34B4FF'; // Cyan/Blue
    if (mult < 10.0) return '#913EF8'; // Purple
    return '#C51F5D'; // Pink / Magenta
  }



  showHistory = false;

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }


  rounds = [
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
    { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' }, { value: 26.17, color: '#913ef8' },
    { value: 1.63, color: '#34b4ff' },
    { value: 43.81, color: '#c017b4' },
    { value: 1.26, color: '#34b4ff' },
    { value: 5.31, color: '#913ef8' },
  ];


  enableSoundOnce() {
  if (!this.isSoundEnabled) {
    this.aviatorBgSoundPlayer.nativeElement.play()
      .then(() => {
        this.isSoundEnabled = true;
      })
      .catch(() => {});
  }
}
}