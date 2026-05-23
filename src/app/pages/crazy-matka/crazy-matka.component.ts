import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CrazyMatkaWheelComponent } from '../../shared/components/crazy-matka/crazy-matka-wheel/crazy-matka-wheel.component';
import { CrazyMatkaWheelTimerComponent } from "../../shared/components/crazy-matka/crazy-matka-wheel-timer/crazy-matka-wheel-timer.component";

@Component({
  selector: 'app-crazy-matka',
  standalone: true,
   imports: [NgIf, NgFor, NgClass, CrazyMatkaWheelComponent, CrazyMatkaWheelTimerComponent],
  templateUrl: './crazy-matka.component.html',
  styleUrl: './crazy-matka.component.scss'
})
export class CrazyMatkaComponent {
 spinWheel = false;
  wheelStart = false;

  selectedWheelNumber = "3";

  wheelBettingChips = [
    { img: 'assets/crazy-wheel/betnumbers/2.png', number: "2" },
    { img: 'assets/crazy-wheel/betnumbers/3.png', number: "3" },
    { img: 'assets/crazy-wheel/betnumbers/6.png', number: "6" },
    { img: 'assets/crazy-wheel/betnumbers/7.png', number: "7" },
    { img: 'assets/crazy-wheel/betnumbers/8.png', number: "8" }
  ];

  moneyCardsData = [
    { img: 'assets/crazy-wheel/bet-money-cards/1.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/2.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/3.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/4.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/5.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/6.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/7.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/8.png' },
    { img: 'assets/crazy-wheel/bet-money-cards/9.png' }
  ];

  oddEventData = [
    { img: 'assets/crazy-wheel/odd-event-number-images/Odd.jpg' },
    { img: 'assets/crazy-wheel/odd-event-number-images/bets-all.jpg' },
    { img: 'assets/crazy-wheel/odd-event-number-images/Even.jpg' }
  ];

  ngOnInit() {}

  startWheel() {
    this.wheelStart = true;
  }
}
