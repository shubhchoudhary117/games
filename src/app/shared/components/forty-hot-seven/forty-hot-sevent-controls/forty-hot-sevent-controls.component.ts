import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-forty-hot-sevent-controls',
  standalone: true,
  imports: [NgFor, NgIf, NgFor, NgClass, DecimalPipe],
  templateUrl: './forty-hot-sevent-controls.component.html',
  styleUrl: './forty-hot-sevent-controls.component.scss'
})
export class FortyHotSeventControlsComponent {
  @Input() balance = 0;
  @Input() currentBet = 120;
  @Input() isSpinning = false;
  @Input() autoplay = false;
  @Input() autoRounds = 0;
  @Input() gambleMode = false;
  @Output() betChange = new EventEmitter<number>();
  @Output() spinClick = new EventEmitter<void>();
  @Output() autoToggle = new EventEmitter<void>();
  @Output() gambleToggle = new EventEmitter<void>();
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  soundOn: boolean = true;
  menuOpen: boolean = false;
  activeMenuTab: string = 'rules';
  betHistory: { bet: number; profit: number }[] = [];


  playSound() {
    this.audioPlayer.nativeElement.play();
  }

  readonly betOptions = [10, 25, 50, 100, 200, 500, 1000, 2000];

  selectBet(amount: number): void {
    if (this.isSpinning) return;
    this.betChange.emit(amount);
  }

  handleSpin() {
    this.spinClick.emit();
    this.playSound()
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    const audio = this.audioPlayer?.nativeElement;
    if (audio) audio.muted = !this.soundOn;
  }

  addToHistory(bet: number, profit: number) {
    this.betHistory.unshift({ bet, profit });
    if (this.betHistory.length > 10) this.betHistory.pop();
  }


}
