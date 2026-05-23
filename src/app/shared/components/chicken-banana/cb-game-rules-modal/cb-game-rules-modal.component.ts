import { Component } from '@angular/core';
import { ChickenBananaMenuService } from '../../../../pages/chicken-banana-game/chicken-banana.menu.service';

@Component({
  selector: 'app-cb-game-rules-modal',
  standalone: true,
  imports: [],
  templateUrl: './cb-game-rules-modal.component.html',
  styleUrl: './cb-game-rules-modal.component.scss'
})
export class CbGameRulesModalComponent {

  constructor(private service:ChickenBananaMenuService){}

  closeModal(){
    this.service.closeGameRulesModal()
  }
}
