import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type ModalType = 'how-to-play' | 'game-rules' | 'bet-history' | null;

export interface BetHistoryEntry {
  bet: number;
  netGain: number;
  teenPatti: number;
  doPatti: number;
  timestamp: Date;
}


@Component({
  selector: 'app-patto-king-menucard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './patto-king-menucard.component.html',
  styleUrl: './patto-king-menucard.component.scss'
})
export class PattoKingMenucardComponent {

  @Input() menuOpen = false;
  @Input() coins = 0;
  @Input() betHistory: BetHistoryEntry[] = [];
  @Input() totalWins = 0;

  // ── Outputs to parent
  @Output() menuClose   = new EventEmitter<void>();
  @Output() soundChange = new EventEmitter<boolean>();

  // ── Local state
  activeModal: ModalType = null;
  soundOn = true;

  // ── User profile (customize or pass as @Input)
  username = 'King Player';
  playerLevel = 'LV 5';
  avatarSrc = 'assets/patto-king/avtar.jpeg';

  // ── How to Play steps
  howToPlaySteps = [
    {
      title: 'Set Your Bet',
      desc: 'Use the + / − buttons at the bottom to choose your bet amount. Min: 10, Max: 500 coins.'
    },
    {
      title: 'Deal Cards',
      desc: 'Press the "DEAL CARDS" button. 3 cards will be dealt across 5 rounds.'
    },
    {
      title: 'Cards Flip',
      desc: 'In each round, cards will automatically flip one by one.'
    },
    {
      title: 'Teen Patti → 5×',
      desc: 'If all three cards share the same rank (e.g. K K K) — you win 5× your bet!'
    },
    {
      title: 'Do Patti → 2×',
      desc: 'If any two cards share the same rank (e.g. A A 7) — you win double your bet.'
    },
    {
      title: 'No Match → Loss',
      desc: 'If no two cards match, the bet for that round is lost.'
    },
    {
      title: 'Result',
      desc: 'After all 5 rounds are complete, the total winnings are added to your coins.'
    }
  ];

  ngOnInit() {
    // Load saved sound preference
    const saved = localStorage.getItem('pk-sound');
    if (saved !== null) {
      this.soundOn = saved === 'true';
    }
    // Load saved username if any
    const savedName = localStorage.getItem('pk-username');
    if (savedName) this.username = savedName;
  }

  // ── Computed
  get netProfit(): number {
    return this.betHistory.reduce((sum, e) => sum + e.netGain, 0);
  }

  get betHistoryReversed(): BetHistoryEntry[] {
    return [...this.betHistory].reverse();
  }

  // ── Actions
  closeMenu() {
    this.menuClose.emit();
  }

  openModal(type: ModalType) {
    this.activeModal = type;
  }

  closeModal() {
    this.activeModal = null;
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    localStorage.setItem('pk-sound', String(this.soundOn));
    this.soundChange.emit(this.soundOn);
  }
}