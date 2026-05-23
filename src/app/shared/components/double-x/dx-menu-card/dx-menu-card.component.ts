import { Component } from '@angular/core';
import { DoubleXMenuService } from '../../../../pages/double-x-game/services/dx-menu.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dx-menu-card',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './dx-menu-card.component.html',
  styleUrl: './dx-menu-card.component.scss'
})
export class DxMenuCardComponent {


  constructor(
      public dxMenuService: DoubleXMenuService
    ) {}
  
    openGameRulesModal(): void {
      this.dxMenuService.closeAllModals();
      this.dxMenuService.openGameRulesModal();
    }
  
    openBetHistoryModal(): void {
      this.dxMenuService.closeAllModals();
      this.dxMenuService.openBetHistoryModal();
    }
  
    openHowToPlayModal(): void {
      this.dxMenuService.closeAllModals();
      this.dxMenuService.openHowToPlayModal();
    }
  
    toggleSound(): void {
      this.dxMenuService.toggleSound();
    }
  
    toggleMusic(): void {
      this.dxMenuService.toggleMusic();
    }
}
