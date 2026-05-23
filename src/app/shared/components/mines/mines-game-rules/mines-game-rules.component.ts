import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game_Rules } from '../../../../data/catfish/GameRules';

@Component({
  selector: 'app-mines-game-rules',
  standalone: true,
  imports: [NgClass, NgIf,NgFor],
  templateUrl: './mines-game-rules.component.html',
  styleUrl: './mines-game-rules.component.scss'
})
export class MinesGameRulesComponent {
  @Input() showRulesModal: boolean = false;
  @Output() close=new EventEmitter<void>();
  Game_Rules = Game_Rules;

  closeModal() {  
      this.close.emit();
  }
}
