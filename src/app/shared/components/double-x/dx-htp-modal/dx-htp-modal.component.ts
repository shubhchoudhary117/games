import { Component } from '@angular/core';
import { DoubleXMenuService } from '../../../../pages/double-x-game/services/dx-menu.service';

@Component({
  selector: 'app-dx-htp-modal',
  standalone: true,
  imports: [],
  templateUrl: './dx-htp-modal.component.html',
  styleUrl: './dx-htp-modal.component.scss'
})
export class DxHtpModalComponent {

   constructor(private service:DoubleXMenuService){}
    
      closeModal(){
        this.service.closeHowToPlayModal()
      }
}
