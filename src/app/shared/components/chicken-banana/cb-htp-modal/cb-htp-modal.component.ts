import { Component } from '@angular/core';
import { ChickenBananaMenuService } from '../../../../pages/chicken-banana-game/chicken-banana.menu.service';

@Component({
  selector: 'app-cb-htp-modal',
  standalone: true,
  imports: [],
  templateUrl: './cb-htp-modal.component.html',
  styleUrl: './cb-htp-modal.component.scss'
})
export class CbHtpModalComponent {

  constructor(private service:ChickenBananaMenuService){}
  
    closeModal(){
      this.service.closeHowToPlayModal()
    }
}
