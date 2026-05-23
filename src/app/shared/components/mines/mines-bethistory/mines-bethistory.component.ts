import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-mines-bethistory',
  standalone: true,
  imports: [NgClass,NgIf,NgFor,DecimalPipe],
  templateUrl: './mines-bethistory.component.html',
  styleUrl: './mines-bethistory.component.scss'
})
export class MinesBethistoryComponent {
  userIsCashout: boolean = false;
  gameIsCatfished: boolean = false;

  betHistories: any[] = [];

  selectedBetsHistory: string = "MY_BETS";

  filteredBetHistories: any[] = [
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 },
    { amount: 100, mines: 3, isCollect: true, winAmount: 1000 }
  ];

  loading: boolean = true;

  handleHistoryType(type: string) {
    this.selectedBetsHistory = type;
  }

  getReversedHistories() {
    return [...this.filteredBetHistories].reverse();
  }
}
