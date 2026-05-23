// cb-menu-card.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChickenBananaMenuService } from '../../../../pages/chicken-banana-game/chicken-banana.menu.service';

@Component({
  selector: 'app-cb-menu-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cb-menu-card.component.html',
  styleUrl: './cb-menu-card.component.scss'
})
export class CbMenuCardComponent {

  constructor(
    public chickenBananaMenuService: ChickenBananaMenuService
  ) {}

  openGameRulesModal(): void {
    this.chickenBananaMenuService.closeAllModals();
    this.chickenBananaMenuService.openGameRulesModal();
  }

  openBetHistoryModal(): void {
    this.chickenBananaMenuService.closeAllModals();
    this.chickenBananaMenuService.openBetHistoryModal();
  }

  openHowToPlayModal(): void {
    this.chickenBananaMenuService.closeAllModals();
    this.chickenBananaMenuService.openHowToPlayModal();
  }

  toggleSound(): void {
    this.chickenBananaMenuService.toggleSound();
  }

  toggleMusic(): void {
    this.chickenBananaMenuService.toggleMusic();
  }
}