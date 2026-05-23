import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MinesGameRulesComponent } from "../mines-game-rules/mines-game-rules.component";

@Component({
  selector: 'app-mines-header',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, MinesGameRulesComponent],
  templateUrl: './mines-header.component.html',
  styleUrl: './mines-header.component.scss'
})
export class MinesHeaderComponent {
  showProfileModal: boolean = false;
  showRulesModal: boolean = false;
  soundIsOn: boolean = false;

  handleSoundSetting() {
    this.soundIsOn = !this.soundIsOn;
  }

  closeGameRules(){
    this.showRulesModal=false;
  }
}
