import { Component } from '@angular/core';
import { DoubleXMenuService } from '../../../../pages/double-x-game/services/dx-menu.service';

@Component({
  selector: 'app-dx-game-rules-modal',
  standalone: true,
  imports: [],
  templateUrl: './dx-game-rules-modal.component.html',
  styleUrl: './dx-game-rules-modal.component.scss'
})
export class DxGameRulesModalComponent {

   constructor(private service:DoubleXMenuService){}
  
    closeModal(){
      this.service.closeGameRulesModal()
    }
}
