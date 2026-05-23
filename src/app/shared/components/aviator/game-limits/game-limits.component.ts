import { Component } from '@angular/core';
import { GameLimitsService } from './game-limits.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-game-limits',
  standalone: true,
  imports: [NgClass],
  templateUrl: './game-limits.component.html',
  styleUrl: './game-limits.component.scss'
})
export class GameLimitsComponent {
  isVisible: boolean = false;

  constructor(private gameLimitsService: GameLimitsService) { }

  ngOnInit() {
    this.gameLimitsService.openGameLimits$.subscribe((val) => {
      this.isVisible = val;
    })
  }

  onClose() {
    this.gameLimitsService.closeGameLimits();
  }
}
