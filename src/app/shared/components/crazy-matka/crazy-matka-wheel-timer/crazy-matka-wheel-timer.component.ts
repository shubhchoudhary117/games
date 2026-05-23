import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-crazy-matka-wheel-timer',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './crazy-matka-wheel-timer.component.html',
  styleUrl: './crazy-matka-wheel-timer.component.scss'
})
export class CrazyMatkaWheelTimerComponent {
  @Input() duration: number = 10;
  @Output() onComplete = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();

  timeLeft: number = 0;
  interval: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['duration']) {
      this.startTimer();
    }
  }

  startTimer() {
    this.clearTimer();

    this.timeLeft = this.duration;

    this.interval = setInterval(() => {
      if (this.timeLeft <= 1) {
        this.timeLeft = 0;
        this.clearTimer();
        this.onComplete.emit();
      } else {
        this.timeLeft--;
      }
    }, 1000);
  }

  clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.onReset.emit();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  get progressPercentage(): number {
    return (this.timeLeft / this.duration) * 100;
  }
}
