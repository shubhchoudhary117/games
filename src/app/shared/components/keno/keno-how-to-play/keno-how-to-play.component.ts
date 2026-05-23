import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-keno-how-to-play',
  standalone: true,
  imports: [NgIf],
  templateUrl: './keno-how-to-play.component.html',
  styleUrl: './keno-how-to-play.component.scss'
})
export class KenoHowToPlayComponent {

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

}
