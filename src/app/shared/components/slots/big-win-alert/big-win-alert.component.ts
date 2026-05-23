
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-big-win-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './big-win-alert.component.html',
  styleUrls: ['./big-win-alert.component.scss'],
})
export class BigWinAlertComponent implements OnChanges, OnDestroy {
  @Input() value: number = 0;

  scale: number = 0;
  animatedValue: number = 0;

  private countTimer: any = null;
  private scaleTimer: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.scale = 0;
      this.animatedValue = 0;
      this.clearTimers();

      // Mirror React: setTimeout 3000ms then scale in + start counter
      this.scaleTimer = setTimeout(() => {
        this.scale = 1;
        this.animateValue();
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  animateValue(): void {
    let start = 0;
    const end = Math.round(this.value);

    this.countTimer = setInterval(() => {
      start += this.value / 100;
      this.animatedValue = start;
      if (start >= end) {
        clearInterval(this.countTimer);
        this.animatedValue = end;
      }
    }, 30);
  }

  get formattedAnimatedValue(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    })
      .format(Math.round(this.animatedValue))
      .replace('$', 'K₽');
  }

  private clearTimers(): void {
    if (this.countTimer)  clearInterval(this.countTimer);
    if (this.scaleTimer)  clearTimeout(this.scaleTimer);
  }
}