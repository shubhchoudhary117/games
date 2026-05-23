import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { GameProvablyService } from './game-provably.service';

@Component({
  selector: 'app-game-provably',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './game-provably.component.html',
  styleUrl: './game-provably.component.scss'
})
export class GameProvablyComponent {

  isVisible: boolean = false;

  constructor(private gameProvablyService:GameProvablyService){}

  ngOnInit(){
    this.gameProvablyService.openGameProvably$.subscribe((val)=>{
      this.isVisible=val;
    })
  }

  onClose() {
    this.gameProvablyService.closeGameProvably();
  }



  seedMode: 'random' | 'manual' = 'random';

  clientSeedRandom: string = 'Q2AlyjYoIondBMTh7fy5';
  clientSeedManual: string = 'mL0pOTBFVpBCK2qZ4DXC';
  serverSeedSHA256: string = 'e2c95350bd3742fe9008b2cf2125e86a4d0e473b9744198f50440e1c744b501c';

  manualSeedInput: string = '';
  copiedRandom: boolean = false;
  copiedManual: boolean = false;

 

  onOverlayClick(): void {
    this.onClose();
  }

  copyToClipboard(text: string, type: 'random' | 'manual'): void {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'random') {
        this.copiedRandom = true;
        setTimeout(() => (this.copiedRandom = false), 1500);
      } else {
        this.copiedManual = true;
        setTimeout(() => (this.copiedManual = false), 1500);
      }
    });
  }

  changeSeed(): void {
    if (this.manualSeedInput.trim()) {
      this.clientSeedManual = this.manualSeedInput.trim();
      this.manualSeedInput = '';
    }
  }

  openWhatIsProvablyFair(): void {
    window.open('https://en.wikipedia.org/wiki/Provably_fair', '_blank');
  }
}
