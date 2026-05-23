import { Injectable, signal, computed } from '@angular/core';

export type CardType = 'red' | 'yellow' | 'black';
export type GamePhase = 'idle' | 'accel' | 'cruise' | 'decel' | 'stopped';
export type ChoiceType = CardType | null;

export interface BeltCard {
  type: CardType;
}

export interface GameState {
  balance: number;
  bet: number;
  choice: ChoiceType;
  spinning: boolean;
  belt: BeltCard[];
  offset: number;
  speed: number;
  targetOffset: number;
  winnerIdx: number;
  winnerType: CardType | null;
  phase: GamePhase;
  history: CardType[];
  glowT: number;
}

@Injectable({ providedIn: 'root' })
export class HotlineGameService {

  // ── Canvas / belt constants ──────────────────────────────────────────────
  readonly CW = 76;
  readonly CH = 114;
  readonly GAP = 10;
  readonly STRIDE = 86;          // CW + GAP

  // ── Payout table ─────────────────────────────────────────────────────────
  readonly PAYS = { red: 2, yellow: 32, black: 2 };

  // ── Physics ───────────────────────────────────────────────────────────────
  readonly MAX_SPD   = 20;
  readonly ACCEL     = 3;
  readonly MIN_ROUNDS = 1;
  readonly DECEL_PX  = 280;

  // ── Probabilities ─────────────────────────────────────────────────────────
  readonly P_RED = 0.44;
  readonly P_YEL = 0.12;

  // ── Stake presets ─────────────────────────────────────────────────────────
  readonly AMOUNT_STAKES = [
    0.10, 0.20, 0.50, 1, 2, 5, 10, 25,
    50, 100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000
  ];

  // ── Mutable game state ────────────────────────────────────────────────────
  state: GameState = {
    balance: 27819.60,
    bet: 10,
    choice: null,
    spinning: false,
    belt: [],
    offset: 0,
    speed: 0,
    targetOffset: 0,
    winnerIdx: 0,
    winnerType: null,
    phase: 'idle',
    history: [],
    glowT: 0,
  };

  // ── Reactive signals ──────────────────────────────────────────────────────
  balance  = signal(27819.60);
  bet      = signal(10);
  choice   = signal<ChoiceType>(null);
  spinning = signal(false);
  phase    = signal<GamePhase>('idle');
  history  = signal<CardType[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────
  currentPays      = computed(() => this.PAYS);
  balanceFormatted = computed(() =>
    this.balance().toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
  betFormatted = computed(() => this.bet().toFixed(2));

  // ── Helpers ───────────────────────────────────────────────────────────────
  randType(): CardType {
    const r = Math.random();
    return r < this.P_RED ? 'red' : r < this.P_RED + this.P_YEL ? 'yellow' : 'black';
  }

  // ── Belt initialisation (idle scroll) ────────────────────────────────────
  initBeltIdle(canvasWidth: number): void {
    const visible = Math.ceil(canvasWidth / this.STRIDE) + 10;
    this.state.belt = [];
    for (let i = 0; i < visible + 6; i++) {
      this.state.belt.push({ type: this.randType() });
    }
    this.state.offset = 0;
    this.state.phase  = 'idle';
    this.state.speed  = 0;
    this.phase.set('idle');
  }

  // ── Choice selection ──────────────────────────────────────────────────────
  selectChoice(c: CardType): void {
    this.state.choice = c;
    this.choice.set(c);
  }

  // ── Spin start ────────────────────────────────────────────────────────────
  startSpin(canvasWidth: number): 'no_choice' | 'no_balance' | 'already_spinning' | 'ok' {
    if (this.state.spinning || this.state.phase !== 'idle') return 'already_spinning';
    if (!this.state.choice)                                  return 'no_choice';
    if (this.state.bet > this.balance())                     return 'no_balance';

    // Deduct bet
    this.balance.update(b => b - this.state.bet);
    this.state.spinning = true;
    this.spinning.set(true);

    // Decide winner
    this.state.winnerType = this.randType();

    // Build belt
    const beltSize   = Math.ceil(canvasWidth / this.STRIDE) + 28;
    const belt: BeltCard[] = [];
    for (let i = 0; i < beltSize; i++) belt.push({ type: this.randType() });

    const winnerSlot = Math.floor(beltSize * 0.65);
    belt[winnerSlot] = { type: this.state.winnerType };
    this.state.belt      = belt;
    this.state.winnerIdx = winnerSlot;

    // Compute target offset (multiple full loops + land on winner)
    const beltTotalW          = beltSize * this.STRIDE;
    const loops               = Math.ceil(this.MIN_ROUNDS) + 1;
    this.state.targetOffset   = winnerSlot * this.STRIDE + loops * beltTotalW;
    this.state.offset         = 0;
    this.state.speed          = 0;
    this.state.phase          = 'accel';
    this.phase.set('accel');

    return 'ok';
  }

  // ── Per-frame physics tick ────────────────────────────────────────────────
  tick(): boolean {
    this.state.glowT += 0.06;
    let justStopped = false;

    switch (this.state.phase) {
      case 'accel':
        this.state.speed   = Math.min(this.state.speed + this.ACCEL, this.MAX_SPD);
        this.state.offset += this.state.speed;
        if (this.state.speed >= this.MAX_SPD) {
          this.state.phase = 'cruise';
          this.phase.set('cruise');
        }
        break;

      case 'cruise':
        this.state.offset += this.state.speed;
        if (this.state.targetOffset - this.state.offset <= this.DECEL_PX) {
          this.state.phase = 'decel';
          this.phase.set('decel');
        }
        break;

      case 'decel': {
        const rem        = Math.max(0, this.state.targetOffset - this.state.offset);
        const t          = rem / this.DECEL_PX;
        this.state.speed = Math.max(0.4, this.MAX_SPD * t * t);
        this.state.offset += this.state.speed;
        if (this.state.offset >= this.state.targetOffset) {
          this.state.offset = this.state.targetOffset;
          this.state.speed  = 0;
          this.state.phase  = 'stopped';
          this.phase.set('stopped');
          justStopped       = true;
        }
        break;
      }
    }

    return justStopped;
  }

  // ── Evaluate outcome after belt stops ────────────────────────────────────
  evaluate(): { win: boolean; type: CardType; payout: number } {
    const type = this.state.winnerType!;
    const win  = this.state.choice === type;

    // Push to history
    const hist = [...this.history(), type];
    if (hist.length > 80) hist.shift();
    this.history.set(hist);
    this.state.history = hist;

    let payout = 0;
    if (win) {
      payout = this.state.bet * this.PAYS[type];
      this.balance.update(b => b + payout);
    }

    return { win, type, payout };
  }

  // ── Reset after spin cycle completes ─────────────────────────────────────
  resetAfterSpin(): void {
    this.state.spinning = false;
    this.spinning.set(false);
  }
}