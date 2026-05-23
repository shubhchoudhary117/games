import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hilo-game-rules',
  standalone: true,
  imports: [],
  templateUrl: './hilo-game-rules.component.html',
  styleUrl: './hilo-game-rules.component.scss'
})
export class HiloGameRulesComponent {
 @Output() close = new EventEmitter<void>();

  closeGameRules(){
      this.close.emit()
  }
}
