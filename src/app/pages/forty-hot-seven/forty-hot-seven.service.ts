import { Injectable } from '@angular/core';
import { EvaluateResult, SlotSymbol } from './forty-hot-seven.types';

@Injectable({
  providedIn: 'root'
})
export class FortyHotSevenService {

  readonly SYMBOLS: SlotSymbol[] = [
    { id:'cherry',  emoji:'🍒', weight:20, payout:{3:5,  4:10, 5:20}   },
    { id:'orange',  emoji:'🍊', weight:18, payout:{3:6,  4:12, 5:25}   },
    { id:'lemon',   emoji:'🍋', weight:16, payout:{3:8,  4:16, 5:30}   },
    { id:'grapes',  emoji:'🍇', weight:14, payout:{3:10, 4:20, 5:40}   },
    { id:'bell',    emoji:'🔔', weight:10, payout:{3:15, 4:30, 5:60}   },
    { id:'star',    emoji:'⭐', weight:7,  payout:{3:20, 4:50, 5:100}  },
    { id:'seven',   emoji:'7️⃣', weight:4,  payout:{3:50, 4:150,5:500}  },
    { id:'diamond', emoji:'💎', weight:2,  payout:{3:80, 4:250,5:1000} },
  ];

  readonly PAYLINES: number[][] = [
    [1,1,1,1,1],
    [0,0,0,0,0],
    [2,2,2,2,2],
    [0,1,2,1,0],
    [2,1,0,1,2],
    [0,0,1,2,2],
    [2,2,1,0,0],
    [1,0,0,0,1],
    [1,2,2,2,1],
    [0,1,1,1,2],
  ];

  readonly ROWS = 3;
  readonly COLS  = 5;

  getSymbol(id: string): SlotSymbol | undefined {
    return this.SYMBOLS.find(s => s.id === id);
  }

  randomSymbol(): string {
    const total = this.SYMBOLS.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const s of this.SYMBOLS) {
      r -= s.weight;
      if (r <= 0) return s.id;
    }
    return this.SYMBOLS[0].id;
  }

  generateGrid(): string[][] {
    return Array.from({ length: this.ROWS }, () =>
      Array.from({ length: this.COLS }, () => this.randomSymbol())
    );
  }

  evaluate(grid: string[][], currentBet: number): EvaluateResult {
    let totalWin = 0;
    const winCells: [number, number][] = [];

    for (const line of this.PAYLINES) {
      const syms = line.map((row, col) => grid[row][col]);
      let count = 1;
      for (let i = 1; i < this.COLS; i++) {
        if (syms[i] === syms[0]) count++;
        else break;
      }
      if (count >= 3) {
        const sym = this.getSymbol(syms[0]);
        const multiplier = sym?.payout[count] ?? 0;
        totalWin += multiplier * (currentBet / 10);
        for (let i = 0; i < count; i++) {
          const r = line[i], c = i;
          if (!winCells.some(([wr, wc]) => wr === r && wc === c)) {
            winCells.push([r, c]);
          }
        }
      }
    }

    return { totalWin: Math.round(totalWin), winCells };
  }

  delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
