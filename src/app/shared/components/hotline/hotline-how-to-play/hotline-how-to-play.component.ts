import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hotline-how-to-play',
  standalone: true,
  imports: [],
  templateUrl: './hotline-how-to-play.component.html',
  styleUrl: './hotline-how-to-play.component.scss'
})
export class HotlineHowToPlayComponent {

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
