import { Component } from '@angular/core';
import { BubbleGameRulesComponent } from "../../bubbles-game/bubble-game-rules/bubble-game-rules.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bubbles-game-header',
  standalone: true,
  imports: [BubbleGameRulesComponent, NgIf],
  templateUrl: './bubbles-game-header.component.html',
  styleUrl: './bubbles-game-header.component.scss'
})
export class BubblesGameHeaderComponent {
  showGameRules:boolean=false;
  showMenus:boolean=false;

  openMenus(){
    this.showMenus=!this.showMenus;
  }

  closeMenus(){
    this.showMenus=false;
  }

  closeGameRules(){
    this.showGameRules=false;
  }

  openGameRules(){
    this.showGameRules=true;
  }
}
