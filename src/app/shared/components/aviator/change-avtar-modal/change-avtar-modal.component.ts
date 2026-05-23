import { Component } from '@angular/core';
import { ChangeAvtarService } from './change-avtar.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-change-avtar-modal',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './change-avtar-modal.component.html',
  styleUrl: './change-avtar-modal.component.scss'
})
export class ChangeAvtarModalComponent {
  avatarList: string[] = [];
  selectedAvatar = '';
  isVisible: boolean = false;


  constructor(private avatarService: ChangeAvtarService) { }

  ngOnInit(): void {
    this.avatarList = this.avatarService.getAvatarList();
    this.selectedAvatar = this.avatarService.getAvatar();
    this.avatarService.openChangeAvtar$.subscribe((val) => {
      this.isVisible = val;
    })
  }

  selectAvatar(path: string): void {
    this.selectedAvatar = path;
    this.avatarService.setAvatar(path);
    this.avatarService.closeChangeAvtar()
  }

  isSelected(path: string): boolean {
    return this.selectedAvatar === path;
  }

  onClose() {
    this.avatarService.closeChangeAvtar();
  }
}
