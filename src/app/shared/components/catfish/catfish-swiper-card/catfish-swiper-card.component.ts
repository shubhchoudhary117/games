import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-catfish-swiper-card',
  standalone: true,
  imports: [NgFor,NgIf,NgClass],
  templateUrl: './catfish-swiper-card.component.html',
  styleUrl: './catfish-swiper-card.component.scss'
})
export class CatfishSwiperCardComponent {
  @Input() image!: string;
  @Input() name!: string;

  @Output() swipeAction = new EventEmitter<{ direction: string, name: string }>();

  @ViewChild('card', { static: true }) card!: ElementRef;

  private startX = 0;
  private currentX = 0;

  onPanStart(event: any) {
    this.startX = event.center.x;
  }

  onPanMove(event: any) {
    this.currentX = event.deltaX;

    const rotate = this.currentX * 0.05;
    this.card.nativeElement.style.transform =
      `translateX(${this.currentX}px) rotate(${rotate}deg)`;
  }

  onPanEnd() {
    const threshold = 120;

    if (this.currentX > threshold) {
      this.swipeRight();
    } else if (this.currentX < -threshold) {
      this.swipeLeft();
    } else {
      this.resetPosition();
    }
  }

  swipeRight() {
    this.card.nativeElement.style.transform = 'translateX(1000px) rotate(20deg)';
    this.swipeAction.emit({ direction: 'right', name: this.name });
  }

  swipeLeft() {
    this.card.nativeElement.style.transform = 'translateX(-1000px) rotate(-20deg)';
    this.swipeAction.emit({ direction: 'left', name: this.name });
  }

  resetPosition() {
    this.card.nativeElement.style.transform = 'translateX(0px) rotate(0deg)';
  }
}
