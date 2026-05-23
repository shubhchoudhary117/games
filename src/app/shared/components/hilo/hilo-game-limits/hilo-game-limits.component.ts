import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hilo-game-limits',
  standalone: true,
  imports: [],
  templateUrl: './hilo-game-limits.component.html',
  styleUrl: './hilo-game-limits.component.scss'
})
export class HiloGameLimitsComponent {
 @Output() close = new EventEmitter<void>();

  closeGameLimits(){
      this.close.emit()
  }
}
