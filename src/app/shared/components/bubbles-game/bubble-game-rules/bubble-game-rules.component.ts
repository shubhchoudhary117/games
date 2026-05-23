import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bubble-game-rules',
  standalone: true,
  imports: [NgFor],
  templateUrl: './bubble-game-rules.component.html',
  styleUrl: './bubble-game-rules.component.scss'
})
export class BubbleGameRulesComponent {

   @Output() closeModal = new EventEmitter<void>();
 
  activeTab = 0;
 
  sections = [
    {
      icon: '🎮',
      title: 'How to Play',
      html: `
        <ul>
          <li>Choose the number of bubbles by changing the number of <strong>rows and columns</strong></li>
          <li>Choose bubbles to pop</li>
          <li>Pop it by pressing <strong>"Place Bet"</strong> button. Find the winning bubble and a reward is yours!</li>
        </ul>
      `
    },
    {
      icon: '📋',
      title: 'Game Details',
      html: `
        <h3>Place Bet</h3>
        <p>Enter a valid amount in the field <strong>"Bet Amount"</strong>.<br>
        Choose the number of columns (from <strong>2 to 10</strong>) and rows (from <strong>1 to 10</strong>).<br>
        Changing the size of the playing field changes the number of bubbles from <strong>2 to 100</strong>.<br>
        Tap on bubbles you want to pop. The <strong>less you mark, the higher payout</strong> you can get!<br>
        Press <strong>"Place Bet"</strong> to pop chosen bubbles.</p>
 
        <h3>Gameplay</h3>
        <p>Pop bubbles looking for the ⭐ star.<br>
        There is only <strong>1 winning bubble</strong> with a star, regardless of the size of the playing field.<br>
        One round – one attempt to find the winning bubble, so choose wisely!</p>
 
        <h3>Saving Pattern</h3>
        <p>By default, the game clears bubbles selected in previous rounds. However, you can save the previous pattern by tapping the <strong>"Save Pattern"</strong> button.</p>
 
        <h3>Min &amp; Max Multiplier</h3>
        <p>The minimum win multiplier is <strong>×1.01</strong>.<br>
        The maximum win multiplier is <strong>×97</strong>. However, the maximum win is limited by the operator and can be accessed from the <strong>"Limits"</strong> section in the settings menu.</p>
 
        <h3>RTP</h3>
        <p>The game relies on a coefficient called <strong>"RTP"</strong> (Return to Player) — the statistical average of payouts over billions of rounds.<br>
        Bubbles has <strong>RTP 97.0%</strong></p>
      `
    },
    {
      icon: '🔄',
      title: 'Autoplay',
      html: `
        <p>You can enable <strong>Autoplay</strong> mode and configure the number of rounds from <strong>5 to 100</strong>.</p>
        <p>You can stop Autoplay at any time by clicking the <strong>"Stop Autoplay"</strong> button.</p>
      `
    },
    {
      icon: '⚙️',
      title: 'Settings',
      html: `
        <p>Click the <strong>settings icon</strong> in the top right corner to open the settings menu. In Settings you can:</p>
        <ul>
          <li>Change your nickname</li>
          <li>View bet limits: <strong>Minimum Bet, Maximum Bet, Maximum Profit</strong></li>
          <li>Turn sounds on / off</li>
          <li>View your betting history</li>
        </ul>
      `
    },
    {
      icon: '🔌',
      title: 'Disconnection',
      html: `
        <p>We prioritize the security and satisfaction of our players, even during unexpected internet interruptions:</p>
        <ul>
          <li>If a bet is placed after a disconnection, it will <strong>not be sent to the server</strong>, no funds will be deducted, and the game will not proceed.</li>
          <li>If a disconnection occurs during an active game, the <strong>game state on the server will remain unchanged</strong>. You can resume once the connection is restored.</li>
        </ul>
      `
    }
  ];
 
  close(): void {
    this.closeModal.emit();
  }
 
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('rules-modal-overlay')) {
      this.close();
    }
  }
}
