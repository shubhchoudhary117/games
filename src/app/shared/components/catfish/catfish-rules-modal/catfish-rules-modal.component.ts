import { Component, EventEmitter, Input, Output } from '@angular/core';
import {Game_Rules} from "../../../../data/catfish/GameRules"
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-catfish-rules-modal',
  standalone: true,
  imports: [NgClass,NgFor,NgIf],
  templateUrl: './catfish-rules-modal.component.html',
  styleUrl: './catfish-rules-modal.component.scss'
})
export class CatfishRulesModalComponent {
  @Input() showRulesModal!: boolean;
  @Input() User: any;

  @Output() close = new EventEmitter<void>();

  Game_Rules = Game_Rules;

  closeModal() {
    this.close.emit();
  }

}
