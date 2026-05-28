import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MinesGameRulesComponent } from "../mines-game-rules/mines-game-rules.component";
import { MineSoundService } from '../../../../pages/mines/mine.sound.service';

@Component({
  selector: 'app-mines-header',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, MinesGameRulesComponent],
  templateUrl: './mines-header.component.html',
  styleUrl: './mines-header.component.scss'
})
export class MinesHeaderComponent {
  showProfileModal: boolean = false;
  soundIsOn: boolean = false;
  isOpen = false;
  showLimits = false;
  showRules = false;

  constructor(
    public soundService: MineSoundService
  ) { }

  toggleLimits() {
    this.showLimits = !this.showLimits;
  }

  toggleRules() {
    this.showRules = !this.showRules;
  }

  closeGameRules(){
    this.showRules=false;
  }

  closeMenu() {
    this.showProfileModal = false;
  }

  onVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.soundService.setVolume(+target.value);
  }

  handleSoundSetting() {
    this.soundIsOn = !this.soundIsOn;
  }

 
  toggleSound() {
    this.soundService.toggleSound(
      !this.soundService.isSoundEnabled
    );
  }


}
