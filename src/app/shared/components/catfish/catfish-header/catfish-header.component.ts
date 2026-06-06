import { DecimalPipe, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatfishRulesModalComponent } from "../catfish-rules-modal/catfish-rules-modal.component";

@Component({
  selector: 'app-catfish-header',
  standalone: true,
  imports: [FormsModule, NgClass, DecimalPipe, CatfishRulesModalComponent,NgIf],
  templateUrl: './catfish-header.component.html',
  styleUrl: './catfish-header.component.scss'
})
export class CatfishHeaderComponent {

  @Input() user: any;

  showProfileModal = false;
  showRulesModal = false;

  volumeIsOn: boolean = true;
  colorMode: string = 'LIGHT';

  User: any = {
    Settings: {
      Sound_On: true,
      Color_Mode: 'LIGHT'
    }
  };

  ngOnInit() {
    const sound = localStorage.getItem('soundOn');
    const mode = localStorage.getItem('colorMode');

    this.volumeIsOn = sound === 'false' ? false : true;
    this.colorMode = mode || 'LIGHT';

    this.User.Settings.Sound_On = this.volumeIsOn;
    this.User.Settings.Color_Mode = this.colorMode;
  }

  handleSoundSetting() {
    this.volumeIsOn = !this.volumeIsOn;
    this.User.Settings.Sound_On = this.volumeIsOn;
    localStorage.setItem(
      'soundOn',
      String(this.volumeIsOn)
    );
    window.dispatchEvent(
      new CustomEvent('catfish-sound-change', {
        detail: this.volumeIsOn
      })
    );
  }

  handleMode(mode: string) {
    this.colorMode = mode;

    this.User = {
      ...this.User,
      Settings: {
        ...this.User.Settings,
        Color_Mode: mode
      }
    };

    localStorage.setItem('colorMode', mode);
  }
}
