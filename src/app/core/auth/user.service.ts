// services/user/user.service.ts
import { Injectable } from '@angular/core';

export interface UserData {
  walletBalance: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  userData: UserData = { walletBalance: 10000 };

  deductBalance(amount: number): void {
    this.userData.walletBalance = Math.max(0, this.userData.walletBalance - amount);
  }

  creditBalance(amount: number): void {
    this.userData.walletBalance += amount;
  }

  toggleUserFlow(show: boolean): void {
    console.log('Toggle user flow:', show);
  }
}