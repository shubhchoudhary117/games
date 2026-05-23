import { Component, inject } from '@angular/core';
import { RouletteService } from '../../../../pages/roulette-game/roulette.service';
import { formatNum } from '../../../../pages/roulette-game/roulette.model';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-roulette-win-popup',
  standalone: true,
  imports: [NgClass,DecimalPipe],
  templateUrl: './roulette-win-popup.component.html',
  styleUrl: './roulette-win-popup.component.scss'
})
export class RouletteWinPopupComponent {

  rs = inject(RouletteService);
  formatNum = formatNum;
 
  get popup() { return this.rs.winPopup(); }
 
  get colorEmoji(): string {
    const c = this.popup.color;
    return c === 'green' ? '🟢 GREEN' : c === 'red' ? '🔴 RED' : '⚫ BLACK';
  }
}
