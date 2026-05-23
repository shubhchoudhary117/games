import { AsyncPipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CbMenuCardComponent } from "../../shared/components/chicken-banana/cb-menu-card/cb-menu-card.component";
import { CbHtpModalComponent } from "../../shared/components/chicken-banana/cb-htp-modal/cb-htp-modal.component";
import { CbGameRulesModalComponent } from "../../shared/components/chicken-banana/cb-game-rules-modal/cb-game-rules-modal.component";
import { CbBethistoryComponent } from "../../shared/components/chicken-banana/cb-bethistory/cb-bethistory.component";
import { ChickenBananaMenuService } from './chicken-banana.menu.service';

@Component({
  selector: 'app-chicken-banana-game',
  standalone: true,
  imports: [DecimalPipe, AsyncPipe, CbMenuCardComponent, NgIf, CbHtpModalComponent, CbGameRulesModalComponent, CbBethistoryComponent],
  templateUrl: './chicken-banana-game.component.html',
  styleUrl: './chicken-banana-game.component.scss'
})
export class ChickenBananaGameComponent implements OnInit {
  showMenuCard: boolean = false;
  showHtpModal: boolean = false;
  dummyData = [
    { id: 1, widget: "assets/chicken-banana/game-multipliers/bananas.png", amount: 100, label: "Bananas" },
    { id: 2, widget: "assets/chicken-banana/game-multipliers/hen.png", amount: 200, label: "Hen" },
    { id: 3, widget: "assets/chicken-banana/game-multipliers/major.png", amount: 400, label: "Major" },
    { id: 4, widget: "assets/chicken-banana/game-multipliers/chicken-bucket.png", amount: 300, label: "Chicken Bucket" },
    { id: 5, widget: "assets/chicken-banana/game-multipliers/mini.png", amount: 500, label: "Mini" },
    { id: 6, widget: "assets/chicken-banana/game-multipliers/pill-banana.png", amount: 50, label: "Pill Banana" },
    { id: 7, widget: "assets/chicken-banana/game-multipliers/two-banana.png", amount: 340, label: "Two Banana" },
    { id: 8, widget: "assets/chicken-banana/game-multipliers/legpice.png", amount: 450, label: "Leg Piece" }
  ];
  currentMultipliers: any[] = [];
  gamePicks: any[] = [];
  gameStarted = false;
  gameWon = false;
  winningItem: any = null;
  showAutoplayModal = false;
  autoPlayOptions = [
    10,
    25,
    50,
    100,
    250,
    500,
    750,
    1000
  ];
  selectedAutoplayCount = 10;
  isAutoplayRunning = false;
  autoplayRemaining = 0;
  autoplayInterval: any;
  holdTimeout: any;
  balance = 100000;
  betAmount = 200;
  lastWin = 0;
  isAutoOpening = false;

  @ViewChild('bgSound') bgSoundPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('pickSound') pickSound!: ElementRef<HTMLAudioElement>;
  @ViewChild('winSound') winSound!: ElementRef<HTMLAudioElement>;


  constructor(public chickenBananaMenuService: ChickenBananaMenuService) {
    this.chickenBananaMenuService.musicEnabled$
      .subscribe(() => {
        if (this.bgSoundPlayer) {
          this.updateMusicState();
        }

      });
  }

  ngOnInit(): void {
    this.currentMultipliers = this.getRandomFiveMultipliers();
    this.initializeGame();

  }


  startGame() {
    if (this.balance < this.betAmount) return;
    this.updateMusicState();
    this.balance -= this.betAmount;
    this.gameWon = false;
    this.winningItem = null;
    this.gameStarted = true;
    this.lastWin = 0;

    this.currentMultipliers = this.getRandomFiveMultipliers();

    this.initializeGame();
  }

  // =====================
  // RANDOM MULTIPLIERS
  // =====================

  getRandomFiveMultipliers() {

    const shuffled = [...this.dummyData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    return shuffled.map(item => ({
      ...item,
      uniqueId: crypto.randomUUID()
    }));
  }

  // =====================
  // INITIALIZE GAME
  // =====================

  initializeGame() {

    this.gamePicks = [];

    const winningMultiplier =
      this.currentMultipliers[
      Math.floor(Math.random() * this.currentMultipliers.length)
      ];

    for (let i = 0; i < 20; i++) {

      const randomItem =
        this.currentMultipliers[
        Math.floor(Math.random() * this.currentMultipliers.length)
        ];

      this.gamePicks.push({
        id: i + 1,
        revealed: false,
        matched: false,
        item: randomItem
      });
    }

    const randomIndexes: number[] = [];

    while (randomIndexes.length < 3) {

      const randomIndex = Math.floor(Math.random() * 20);

      if (!randomIndexes.includes(randomIndex)) {
        randomIndexes.push(randomIndex);
      }
    }

    randomIndexes.forEach(index => {
      this.gamePicks[index].item = winningMultiplier;
    });
  }

  // =====================
  // OPEN BOX
  // =====================

  openBox(box: any) {

    if (
      box.revealed ||
      this.gameWon ||
      !this.gameStarted
    ) return;

    // PICK SOUND
    this.playPickSound();

    box.revealed = true;

    const matchedItems = this.gamePicks.filter(
      x =>
        x.revealed &&
        x.item.id === box.item.id
    );

    if (matchedItems.length >= 3) {

      matchedItems.forEach(item => {
        item.matched = true;
      });

      setTimeout(() => {

        // WIN SOUND
        this.playWinSound();

        this.gameWon = true;
        this.winningItem = box.item;

        const wonAmount = box.item.amount;

        this.lastWin = wonAmount;

        this.balance += wonAmount;

        const remainingBoxes = this.gamePicks.filter(
          item => !item.revealed
        );

        remainingBoxes.forEach(item => {

          item.revealed = true;
          item.autoFlip = true;

        });

        this.gamePicks.forEach(item => {

          if (!item.matched) {
            item.showOverlay = true;
          }

        });

        setTimeout(() => {
          this.resetGame();
        }, 4000);

      }, 800);
    }
  }

  // =====================
  // GO BUTTON
  // =====================

  autoOpenRandomBox() {

    if (
      !this.gameStarted ||
      this.gameWon ||
      this.isAutoOpening
    ) return;

    const unopenedBoxes =
      this.gamePicks.filter(x => !x.revealed);

    if (!unopenedBoxes.length) return;

    this.isAutoOpening = true;

    const randomBox =
      unopenedBoxes[
      Math.floor(Math.random() * unopenedBoxes.length)
      ];

    this.openBox(randomBox);

    setTimeout(() => {
      this.isAutoOpening = false;
    }, 500);
  }

  // =====================
  // BET ACTIONS
  // =====================

  increaseBet() {

    this.betAmount += 50;
  }

  decreaseBet() {

    if (this.betAmount > 50) {
      this.betAmount -= 50;
    }
  }

  // =====================
  // RESET
  // =====================

  resetGame() {

    this.gameWon = false;
    this.winningItem = null;
    this.gameStarted = false;
    this.gamePicks = [];

    this.currentMultipliers =
      this.getRandomFiveMultipliers();

    this.initializeGame();

    if (this.isAutoplayRunning &&
      this.autoplayRemaining > 0) {

      setTimeout(() => {
        this.startGame();
      }, 700);
    }
  }



  // =====================
  // AUTOPLAY
  // =====================



  openAutoplayModal() {

    this.showAutoplayModal = true;
  }



  closeAutoplayModal() {

    this.showAutoplayModal = false;
  }



  selectAutoplay(value: number) {

    this.selectedAutoplayCount = value;
  }


  onSliderChange(event: any) {

    this.selectedAutoplayCount =
      +event.target.value;
  }


  startAutoplay() {

    this.closeAutoplayModal();

    this.autoplayRemaining =
      this.selectedAutoplayCount;

    this.isAutoplayRunning = true;

    // start game if not started
    if (!this.gameStarted) {
      this.startGame();
    }

    this.runAutoplay();
  }


  runAutoplay() {

    this.autoplayInterval = setInterval(() => {

      if (
        !this.isAutoplayRunning ||
        this.autoplayRemaining <= 0
      ) {

        this.stopAutoplay();
        return;
      }

      this.autoOpenRandomBox();

      this.autoplayRemaining--;

    }, 700);
  }



  stopAutoplay() {

    this.isAutoplayRunning = false;

    clearInterval(this.autoplayInterval);
  }



  startHoldAutoplay() {
    this.holdTimeout = setTimeout(() => {
      this.openAutoplayModal();

    }, 700);
  }

  cancelHoldAutoplay() {
    clearTimeout(this.holdTimeout);
  }


  openMenusCard() {
    this.showMenuCard = !this.showMenuCard;
  }


  // =====================
  // SOUND EFFECTS
  // =====================

  playPickSound(): void {

    if (!this.chickenBananaMenuService.soundEnabled) {
      return;
    }

    const audio = this.pickSound.nativeElement;

    audio.currentTime = 0;
    audio.volume = 0.4;

    audio.play();
  }


  playWinSound(): void {
    if (!this.chickenBananaMenuService.soundEnabled) {
      return;
    }
    const audio = this.winSound.nativeElement;
    audio.currentTime = 0;
    audio.volume = 0.5;

    audio.play();
  }




  updateMusicState(): void {

    const audio = this.bgSoundPlayer.nativeElement;

    // MUSIC OFF
    if (!this.chickenBananaMenuService.musicEnabled) {

      audio.pause();

      audio.currentTime = 0;

      return;
    }

    // MUSIC ON
    audio.volume = 0.03;

    audio.play()
      .catch(() => { });
  }

  ngOnDestroy(): void {
    if (this.bgSoundPlayer?.nativeElement) {
      this.bgSoundPlayer.nativeElement.pause();
      this.bgSoundPlayer.nativeElement.currentTime = 0;
      this.bgSoundPlayer.nativeElement.src = '';
      this.bgSoundPlayer.nativeElement.load();
    }
  }


  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.pauseBgMusic();
    } else {
      this.playBgMusic();
    }
  }

  pauseBgMusic(): void {
    if (this.bgSoundPlayer?.nativeElement) {
      this.bgSoundPlayer.nativeElement.pause();
    }
  }

  playBgMusic(): void {
    if (
      !this.bgSoundPlayer?.nativeElement ||
      !this.chickenBananaMenuService.musicEnabled
    ) {
      return;
    }
    this.bgSoundPlayer.nativeElement
      .play()
      .catch(() => { });
  }

}