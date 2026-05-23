import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hilo-how-to-play',
  standalone: true,
  imports: [],
  templateUrl: './hilo-how-to-play.component.html',
  styleUrl: './hilo-how-to-play.component.scss'
})
export class HiloHowToPlayComponent {
 @Output() close = new EventEmitter<void>();

  closeHowToPlay(){
      this.close.emit()
  }
}
