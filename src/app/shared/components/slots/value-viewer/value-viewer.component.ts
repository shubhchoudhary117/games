
import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../../../core/auth/user.service';

@Component({
  selector: 'app-value-viewer',
  standalone: true,
  imports: [CommonModule,NgIf,NgFor],
  templateUrl: './value-viewer.component.html',
  styleUrls: ['./value-viewer.component.scss'],
})
export class ValueViewerComponent {
  @Input() type: 'balance' | 'bet' | 'wins' = 'balance';
  @Input() betAmount: number = 0;
  @Input() totalWins: number = 0;

  private userService = inject(UserService);

  get displayValue(): number {
    switch (this.type) {
      case 'balance': return this.userService.userData?.walletBalance ?? 0;
      case 'bet':     return this.betAmount;
      case 'wins':    return this.totalWins;
    }
  }

  
  get formattedValue(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    })
      .format(this.displayValue)
      .replace('$', 'K₽');
  }
}