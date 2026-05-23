import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-slots-header',
  standalone: true,
  imports: [CommonModule,NgIf],
  templateUrl: './slots-header.component.html',
  styleUrl: './slots-header.component.scss'
})
export class SlotsHeaderComponent implements OnInit, OnDestroy {

  balance: number = 10000;
  betAmount: number = 10;
  winAmount: number = 0;
  isMenuOpen: boolean = false;
  private coinInterval: any;

  menuItems = [
    { icon: '🏠', label: 'Lobby' },
    { icon: '📜', label: 'History' },
    { icon: '🎁', label: 'Bonuses' },
    { icon: '🔊', label: 'Sound' },
    { icon: '❓', label: 'Help' },
  ];

  ngOnInit() {
    // Simulate occasional small balance changes for a "live" feel
    this.coinInterval = setInterval(() => {
      const delta = (Math.random() * 4 - 2);
      this.winAmount = parseFloat(Math.max(0, this.winAmount + delta).toFixed(0));
    }, 4000);
  }

  ngOnDestroy() {
    clearInterval(this.coinInterval);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  formatCurrency(val: number): string {
    return 'KP' + val.toLocaleString('en-US');
  }
}