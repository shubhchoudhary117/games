import { NgIf, NgClass, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BetPanel, GameState } from '../aviator.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-betcontroller',
  standalone: true,
  imports: [FormsModule, NgClass, NgIf, NgSwitchDefault],
  templateUrl: './betcontroller.component.html',
  styleUrl: './betcontroller.component.scss'
})
export class BetcontrollerComponent {
  @Input() panels!: BetPanel[];
  @Input() gameState!: GameState;

  @Output() toggleAction = new EventEmitter<BetPanel>();
  @Output() adjustBet = new EventEmitter<{ panel: BetPanel; delta: number }>();
  @Output() setBet = new EventEmitter<{ panel: BetPanel; amount: number }>();
  showWinCard:boolean=false;
  winAmount:number=0

  setTab(tab: 'bet' | 'auto',panel:BetPanel) {
    panel.activeTab = tab;
  }

  toggleAutoBet(event: Event,panel:BetPanel) {
    const input = event.target as HTMLInputElement;
    panel.autoBet = input.checked;
  }

  toggleAutoCashOut(event: Event,panel:BetPanel) {
    const input = event.target as HTMLInputElement;
    panel.autoCashOut = input.checked;
    if (panel.autoCashOut && !panel.autoCashOutMultiplier) {
      panel.autoCashOutMultiplier = 1.10;
    }
  }

   disableAmountEdit(panel:BetPanel): boolean {
    return panel.isPlacedForNext && this.gameState !== 'flying' && this.gameState !== 'crashed';
  }

  onAmountChange(value: number | string,panel:BetPanel): void {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return;
    panel.amount = amount < 0.1 ? 0.1 : amount;
  }

  getButtonState(panel:BetPanel) {
    if (this.gameState === 'betting') {
      if (panel.isPlacedForNext) {
        return {
          text: 'Cancel',
          sub: 'Waiting for Next round',
          classes: 'btn-cancel'
        };
      }

      return {
        text: 'Bet',
        sub: `${panel.amount.toFixed(2)} USD`,
        classes: 'btn-bet'
      };
    }

    if (this.gameState === 'flying') {
      if (panel.isActive && !panel.wonThisRound) {
        return {
          text: 'Cash Out',
          sub: `${panel.amount.toFixed(2)} USD`,
          classes: 'btn-cashout'
        };
      }

      if (panel.isPlacedForNext) {
        return {
          text: 'Cancel',
          sub: 'Waiting for Next round',
          classes: 'btn-cancel'
        };
      }

      return {
        text: 'Bet',
        sub: `${panel.amount.toFixed(2)} USD`,
        classes: 'btn-bet'
      };
    }

    if (this.gameState === 'crashed') {
      if (panel.isPlacedForNext) {
        return {
          text: 'Cancel',
          sub: 'Next round',
          classes: 'btn-cancel'
        };
      }

      return {
        text: 'Bet',
        sub: `${panel.amount.toFixed(2)} USD`,
        classes: 'btn-bet'
      };
    }

    return {
      text: 'Bet',
      sub: `${panel.amount.toFixed(2)} USD`,
      classes: 'btn-bet'
    };
  }

  increseAmount(amount:number,panel:BetPanel){
    panel.amount+=amount;
  }

  descreseAmount(amount:number,panel:BetPanel){
    panel.amount-=amount;
  }


}
