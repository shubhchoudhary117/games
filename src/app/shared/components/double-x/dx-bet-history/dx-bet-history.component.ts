import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { DoubleXMenuService } from '../../../../pages/double-x-game/services/dx-menu.service';

@Component({
  selector: 'app-dx-bet-history',
  standalone: true,
  imports: [NgFor],
  templateUrl: './dx-bet-history.component.html',
  styleUrl: './dx-bet-history.component.scss'
})
export class DxBetHistoryComponent {

  constructor(private service:DoubleXMenuService){}



   betHistory = [
    {
      date: '12:11 20-05-26',
      bet: 3,
      mult: '2x',
      cashout: '-',
      green: false
    },
    {
      date: '12:11 20-05-26',
      bet: 3,
      mult: '14x',
      cashout: '$ 42',
      green: true
    },
    {
      date: '12:10 20-05-26',
      bet: 3,
      mult: '2x',
      cashout: '-',
      green: false
    },
    {
      date: '12:10 20-05-26',
      bet: 3,
      mult: '14x',
      cashout: '-',
      green: true
    },
    {
      date: '12:09 20-05-26',
      bet: 3,
      mult: '2x',
      cashout: '-',
      green: false
    }
  ];


  closeModal(){
    this.service.closeBetHistoryModal()
  }

}
