import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RoundInfoService } from './round-info.service';
import { NgFor } from '@angular/common';

export interface RoundPlayer {
  name: string;
  avatar: string;
  seed: string;
}

export interface RoundData {
  roundId: number;
  multiplier: string;
  time: string;
  serverSeed: string;
  players: RoundPlayer[];
  sha512Hash: string;
  hex: string;
  decimal: string;
  result: string;
}

@Component({
  selector: 'app-round-info',
  standalone: true,
  imports: [NgFor],
  templateUrl: './round-info.component.html',
  styleUrl: './round-info.component.scss'
})
export class RoundInfoComponent {
  isVisible:boolean=false;

  constructor(private roundInfoService:RoundInfoService){}

  ngOnInit(){
    this.roundInfoService.roundInfoOpen$.subscribe((val)=>{
      this.isVisible=val;
    })
  }

  @Input() roundData: RoundData = {
    roundId: 10568707,
    multiplier: '1.52',
    time: '11:12:01',
    serverSeed: 'kfpccrtUdDFpMfZ2WC8CF87Zr6xyfXpyQipzFATq',
    players: [
      { name: 'd***3', avatar: 'assets/aviator/players-images/1.png', seed: 'K4AoA4FtHp9y4wmjbAj2' },
      { name: 'd***6', avatar: 'assets/aviator/players-images/2.png', seed: 'b0nO90UYQ4yK3MjXRs19' },
      { name: 'd***2', avatar: 'assets/aviator/players-images/3.png', seed: 'HAEVYF00Pd8AktmcRKCT' }
    ],
    sha512Hash: '5d209faf977c20f853ce889a2dc3a2139e7abc842a01f5172a7a05d1c3155901ccdfd698ea4cfc8064',
    hex: '5d209faf977c2',
    decimal: '1638315190745026',
    result: '1.52'
  };

  onClose(){
    this.roundInfoService.closeRoundInfo();
  }
}
