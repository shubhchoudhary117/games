import { Component } from '@angular/core';
import { ChickenBananaMenuService } from '../../../../pages/chicken-banana-game/chicken-banana.menu.service';

@Component({
  selector: 'app-cb-bethistory',
  standalone: true,
  imports: [],
  templateUrl: './cb-bethistory.component.html',
  styleUrl: './cb-bethistory.component.scss'
})
export class CbBethistoryComponent {

  constructor(private service:ChickenBananaMenuService){}
  
    closeModal(){
      this.service.closeBetHistoryModal()
    }
}
