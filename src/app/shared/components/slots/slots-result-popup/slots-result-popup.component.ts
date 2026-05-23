import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-slots-result-popup',
  standalone: true,
  imports: [NgIf,NgFor,DecimalPipe,NgClass],
  templateUrl: './slots-result-popup.component.html',
  styleUrl: './slots-result-popup.component.scss'
})
export class SlotsResultPopupComponent {
  @Input() type: 'win' | 'loss' = 'win';
  @Input() winAmount = 0;
  @Input() betAmount = 0;
  @Input() winningLines: string[] = [];

  @Output() collect = new EventEmitter<void>();
  @Output() playAgain = new EventEmitter<void>();

  get isWin(): boolean { return this.type === 'win'; }

  get formattedAmount(): string {
    return new Intl.NumberFormat('en-US').format(this.winAmount);
  }

  get lineLabel(): string {
    if (!this.winningLines.length) return '—';
    return this.winningLines.slice(0, 2).join(', ');
  }

  onCollect(): void { this.collect.emit(); }
  onPlayAgain(): void { this.playAgain.emit(); }
}
