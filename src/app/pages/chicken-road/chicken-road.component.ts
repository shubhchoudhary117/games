import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var spine: any;

interface Step {
  id: number;
  multiplier: number;
  status: 'upcoming' | 'safe' | 'crashed';
  carType?: 'police' | 'taxi' | 'sports';
  ambientCar?: 'police' | 'taxi' | 'sports';
  ambientDelay?: string;
  ambientDuration?: string;
}

type Mode = 'easy' | 'medium' | 'hard' | 'hardcore';

const MODES = {
  easy: { len: 24, badSpots: 1 },
  medium: { len: 22, badSpots: 3 },
  hard: { len: 20, badSpots: 5 },
  hardcore: { len: 15, badSpots: 10 }
};

@Component({
  selector: 'app-chicken-road',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgClass],
  templateUrl: './chicken-road.component.html',
  styleUrl: './chicken-road.component.scss'
})
export class ChickenRoadComponent implements OnInit, AfterViewInit {
  title = 'chicken-road';
  gameState: 'menu' | 'playing' | 'gameover' | 'cashout' = 'menu';
  selectedMode: Mode = 'easy';

  steps: Step[] = [];
  currentStepIndex = -1;
  crashPointIndex: number | null = null;

  isHopping = false;
  popAnimation = false;
  screenShake = false;
  isMenuOpen: boolean = false;
  betAmount: number = 3;
  showHowToPlay: boolean = false;
  spinePlayer: any = null;
  resetTimeout: any = null;
  showBetHistory = false;
  showRules = false;
  showGameProvablyModal = false;

  bets = [
    { date: '13:04 24-04-26', bet: 3, mult: 0, win: null },
    { date: '12:59 24-04-26', bet: 3, mult: 1.75, win: 5.25 },
    { date: '12:54 24-04-26', bet: 3, mult: 0, win: null },
    { date: '12:53 24-04-26', bet: 3, mult: 1.17, win: 3.51 }
  ];

  openRules() {
    this.showRules = true;
  }

  closeRules() {
    this.showRules = false;
  }

  openBetHistory() {
    this.showBetHistory = true;
  }
  closeBetHistory() {
    this.showBetHistory = false;
  }

  openGameProvably() {
    this.showGameProvablyModal = true;
  }
  closeGameProvably() {
    this.showGameProvablyModal = false;
  }

  get modeConfig() {
    return MODES[this.selectedMode];
  }

  get currentMultiplier() {
    if (this.currentStepIndex === -1) return 1.0;
    return this.steps[this.currentStepIndex]?.multiplier || 1.0;
  }

  get currentCashout() {
    return this.betAmount * this.currentMultiplier;
  }

  ngOnInit() {
    this.initBoard();
  }

  ngAfterViewInit() {
    // Initialize the High-Quality Spine Animation using the exact requested chicken asset!
    this.spinePlayer = new spine.SpinePlayer("spine-chicken-container", {
      jsonUrl: "/assets/chicken-road/chiken.json",
      atlasUrl: "/assets/chicken-road/chiken.atlas",
      animation: "idle",
      alpha: true,
      backgroundColor: "#00000000",
      showControls: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      viewport: {
        x: -140,
        y: -30,
        width: 280,
        height: 320,
      }
    });
  }

  playSpineAnimation(anim: string, loop: boolean = true) {
    if (this.spinePlayer && this.spinePlayer.animationState) {
      if (this.spinePlayer.skeleton) {
        this.spinePlayer.skeleton.setToSetupPose();
      }
      if (typeof this.spinePlayer.animationState.setAnimation === 'function') {
        this.spinePlayer.animationState.setAnimation(0, anim, loop);
      } else {
        this.spinePlayer.setAnimation(anim, loop);
      }
    }
  }

  setMode(mode: Mode) {
    if (this.gameState === 'playing') return;
    this.selectedMode = mode;
    this.initBoard();
  }

  setBet(amount: number) {
    if (this.gameState === 'playing') return;
    this.betAmount = amount;
  }

  initBoard() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout);

    this.steps = [];
    this.screenShake = false;
    const config = this.modeConfig;
    const TOTAL_SPOTS = 25;

    let currentM = 0.99;
    const carTypes: ('police' | 'taxi' | 'sports')[] = ['police', 'taxi', 'sports'];

    for (let i = 0; i < config.len; i++) {
      currentM *= (TOTAL_SPOTS - i) / (TOTAL_SPOTS - config.badSpots - i);

      const rCar = carTypes[Math.floor(Math.random() * carTypes.length)];
      const ambCar = carTypes[Math.floor(Math.random() * carTypes.length)];
      const delay = (Math.random() * 2).toFixed(2) + 's';
      const duration = (1.5 + Math.random() * 1).toFixed(2) + 's';

      this.steps.push({
        id: i,
        multiplier: currentM,
        status: 'upcoming',
        carType: rCar,
        ambientCar: ambCar,
        ambientDelay: delay,
        ambientDuration: duration
      });
    }

    this.crashPointIndex = null;
    let remainingTotal = TOTAL_SPOTS;
    let remainingBad = config.badSpots;

    for (let i = 0; i < config.len; i++) {
      if (Math.random() < remainingBad / remainingTotal) {
        this.crashPointIndex = i;
        break;
      }
      remainingTotal--;
    }

    this.currentStepIndex = -1;
    this.gameState = 'menu';
    this.playSpineAnimation('idle', true);
  }

  startGame() {
    this.initBoard();
    this.gameState = 'playing';
  }

  cashout() {
    if (this.gameState !== 'playing' || this.currentStepIndex === -1) return;
    this.gameState = 'cashout';
    this.playSpineAnimation('win', true);
    this.scheduleReset();
  }

  handleHowToPlay() {
    this.showHowToPlay = true;
  }
  closeHowToPlay() {
    this.showHowToPlay = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  scheduleReset() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      if (this.gameState === 'gameover' || this.gameState === 'cashout') {
        this.initBoard();
      }
    }, 3500); // 3.5s to review win / crash before auto-panning backward to start
  }

  handleManholeClick(stepId: number) {
    if (stepId === this.currentStepIndex + 1) {
      this.spinAndGo();
    }
  }

  spinAndGo() {
    if (this.gameState !== 'playing' || this.isHopping) return;

    this.isHopping = true;
    const targetIndex = this.currentStepIndex + 1;

    // Play Jump Animation
    this.playSpineAnimation('jump', false);
    if (this.spinePlayer && this.spinePlayer.animationState) {
      // Automatically queue idle after jump
      if (typeof this.spinePlayer.animationState.addAnimation === 'function') {
        this.spinePlayer.animationState.addAnimation(0, 'idle', true, 0);
      }
    }

    setTimeout(() => {
      this.isHopping = false;
      this.currentStepIndex = targetIndex;

      if (this.crashPointIndex === targetIndex) {
        this.steps[targetIndex].status = 'crashed';
        setTimeout(() => {
          this.gameState = 'gameover';
          this.screenShake = true;
          this.playSpineAnimation('death', false);
          this.scheduleReset();
        }, 220); // 220ms perfectly perfectly perfectly lines up with 0.5s driveDownCrash animation hitting center (250ms half-way)!
      } else {
        this.steps[targetIndex].status = 'safe';
        this.triggerPop();

        if (targetIndex === this.modeConfig.len - 1) {
          this.gameState = 'cashout';
          this.playSpineAnimation('win', true);
          this.scheduleReset();
        }
      }
    }, 400);
  }

  triggerPop() {
    this.popAnimation = false;
    setTimeout(() => {
      this.popAnimation = true;
    }, 10);
  }

  getCameraTranslateX() {
    const laneWidth = 150;
    let index = this.currentStepIndex;
    if (this.isHopping && this.gameState === 'playing') {
      index += 1;
    }
    const offset = Math.max(0, index + 1) * laneWidth;
    return `translateX(-${offset}px)`;
  }



  //  close on outside click
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: any) {
    const clickedInside = event.target.closest('.user-menu') || event.target.closest('.icon-only');
    if (!clickedInside) {
      this.isMenuOpen = false;
    }
  }
}
