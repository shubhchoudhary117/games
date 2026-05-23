import { Component, inject } from '@angular/core';
import { Scroll } from '@angular/router';
import { RouletteService } from '../../../../pages/roulette-game/roulette.service';

@Component({
  selector: 'app-roulette-header',
  standalone: true,
  imports: [],
  templateUrl: './roulette-header.component.html',
  styleUrl: './roulette-header.component.scss'
})
export class RouletteHeaderComponent {

  readonly ScrollIcon = Scroll;
  rs = inject(RouletteService);
 
  showRules() {
    alert('EUROPEAN ROULETTE RULES\n\n• Straight Up: 35:1\n• Red / Black, Odd / Even, 1-18 / 19-36: 1:1\n• Column: 2:1\n• 0 wins for the house on even-money bets\n\nGood luck!');
  }
}
