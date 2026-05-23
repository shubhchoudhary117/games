import { Component, computed, inject } from '@angular/core';
import { RouletteService } from '../../../../pages/roulette-game/roulette.service';
import { TIMER_TOTAL } from '../../../../pages/roulette-game/roulette.model';

@Component({
  selector: 'app-roulette-timer',
  standalone: true,
  imports: [],
  templateUrl: './roulette-timer.component.html',
  styleUrl: './roulette-timer.component.scss'
})
export class RouletteTimerComponent {

rs = inject(RouletteService);
 
  readonly CIRC = 2 * Math.PI * 28; // r=28
 
  dashOffset = computed(() => {
    const pct = this.rs.timerVal() / TIMER_TOTAL;
    return this.CIRC * (1 - pct);
  });
 
  arcColor = computed(() => {
    const v = this.rs.timerVal();
    return v > 5 ? '#2a9c5c' : v > 3 ? '#e09020' : '#cc2200';
  });
  
}
