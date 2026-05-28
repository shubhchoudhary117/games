// mines-game-rules.component.ts

import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface RuleItem {
  title: string;
  isOpen: boolean;
  points: string[];
}

@Component({
  selector: 'app-mines-game-rules',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './mines-game-rules.component.html',
  styleUrl: './mines-game-rules.component.scss'
})
export class MinesGameRulesComponent {

  @Output() close =
    new EventEmitter<void>();

  accordions: RuleItem[] = [
    {
      title: 'How to Play?',
      isOpen: false,
      points: [
        'Choose your bet amount and mine count',
        'Open tiles and collect gems',
        'Each gem increases multiplier',
        'Avoid mines to stay in game',
        'Cash out anytime before mine hit'
      ]
    },

    {
      title: 'Game Details',
      isOpen: false,
      points: [
        'Higher mines give bigger rewards',
        'Every round uses provably fair RNG',
        'Multipliers update instantly',
        'Game result is final after mine hit'
      ]
    },

    {
      title: 'Autoplay',
      isOpen: false,
      points: [
        'Configure automatic rounds',
        'Auto stop on profit or loss',
        'Increase bet after wins or losses',
        'Pause autoplay anytime'
      ]
    },

    {
      title: 'Settings',
      isOpen: false,
      points: [
        'Toggle game sounds',
        'Change nickname',
        'Open limits section',
        'Manage gameplay preferences'
      ]
    },

    {
      title: 'Bets History',
      isOpen: false,
      points: [
        'View all bets history',
        'Track your previous wins',
        'Check top multipliers',
        'Monitor recent rounds'
      ]
    },

    {
      title: 'Disconnection Policy',
      isOpen: false,
      points: [
        'Rounds continue securely on server',
        'Reconnect to restore current game',
        'Results remain محفوظ after disconnect'
      ]
    },

    {
      title: 'Version',
      isOpen: false,
      points: [
        'Game Version : 1.0.3',
        'RNG Version : 2.0.0',
        'UI Version : Premium Dark'
      ]
    }
  ];

  toggleAccordion(index: number) {
    this.accordions[index].isOpen =
      !this.accordions[index].isOpen;
  }

  closeModal() {
    this.close.emit();
  }
}