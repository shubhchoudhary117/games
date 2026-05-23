import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MyBetsService } from './my-bets.service';



 
export interface BetRecord {
  date: string;
  time: string;
  betUsd: number;
  multiplier: number;
  cashOutUsd: number | null; 
}


@Component({
  selector: 'app-my-bets',
  standalone: true,
  imports: [DecimalPipe,NgIf,NgFor],
  templateUrl: './my-bets.component.html',
  styleUrl: './my-bets.component.scss'
})
export class MyBetsComponent {

  isVisible:boolean=false;

  constructor(private myBetsService:MyBetsService){
  }

  bets: BetRecord[] = [
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.08, cashOutUsd: null },
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.08, cashOutUsd: null },
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.15, cashOutUsd: null },
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.15, cashOutUsd: null },
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.66, cashOutUsd: null },
    { time: '20:57', date: '13-04-26', betUsd: 8.13, multiplier: 1.66, cashOutUsd: null },
    { time: '20:56', date: '13-04-26', betUsd: 8.13, multiplier: 3.41, cashOutUsd: 27.74 },
    { time: '20:56', date: '13-04-26', betUsd: 8.13, multiplier: 3.14, cashOutUsd: 25.55 },
    { time: '20:56', date: '13-04-26', betUsd: 8.13, multiplier: 2.37, cashOutUsd: 19.28 },
    { time: '20:56', date: '13-04-26', betUsd: 8.13, multiplier: 1.92, cashOutUsd: 15.62 },
  ];

  ngOnInit(){
    this.myBetsService.myBetsOpen$.subscribe((val)=>{
      this.isVisible=val;
    })
  }

  isWon(bet: BetRecord): boolean {
    return bet.cashOutUsd !== null;
  }

  isHighMultiplier(bet: BetRecord): boolean {
    return bet.multiplier >= 2;
  }

  onClose(): void {
    this.myBetsService.closeMyBets()
  }

  loadMore(): void {
    // hook up to your API/store
    console.log('Load more bets...');
  }

}
