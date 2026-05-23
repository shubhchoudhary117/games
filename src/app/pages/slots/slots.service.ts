import { Injectable } from '@angular/core';
import { SlotProps, SpinResultItem } from '../../types/slots/slots.types';

@Injectable({ providedIn: 'root' })
export class SlotsService {

  private symbols = ['red', 'blue', 'green', 'yin_yang', 'hakkero', 'yellow', 'wild'];

  spinSlots(betAmount: number): Promise<SlotProps> {
    return new Promise((resolve) => {

      setTimeout(() => {

        const grid = this.generateGrid();

        const isWin = Math.random() < 0.35; // 35% win chance
        const result: SpinResultItem[] = [];

        let totalPayout = 0;

        if (isWin) {
          const lines = this.getRandomWinningLines();

          lines.forEach((line) => {
            const symbols = this.getSymbolsForLine(grid, line);

            const multiplier = this.getMultiplier(symbols);
            const payout = betAmount * multiplier;

            result.push({
              line,
              symbols,
              payout
            });

            totalPayout += payout;
          });
        }

        const response: SlotProps = {
          userId: 'demo-user',
          betAmount,
          gridState: grid,
          lastSpinResult: result,
          manekiNekoFeature: Math.random() < 0.1, // 10% feature chance
          totalPayout
        };

        resolve(response);

      }, 1000); // fake delay

    });
  }

  // 🎯 Generate 3x3 grid
  private generateGrid(): string[] {
    return Array.from({ length: 9 }, () =>
      this.symbols[Math.floor(Math.random() * this.symbols.length)]
    );
  }

  // 🎯 Random winning lines
  private getRandomWinningLines(): string[] {
    const allLines = [
      'Horizontal 1',
      'Horizontal 2',
      'Horizontal 3',
      'Diagonal 1',
      'Diagonal 2'
    ];

    const count = Math.floor(Math.random() * 2) + 1; // 1–2 lines

    return allLines
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  // 🎯 Extract symbols from grid based on line
  private getSymbolsForLine(grid: string[], line: string): string[] {

    if (line === 'Horizontal 1') return [grid[0], grid[1], grid[2]];
    if (line === 'Horizontal 2') return [grid[3], grid[4], grid[5]];
    if (line === 'Horizontal 3') return [grid[6], grid[7], grid[8]];

    if (line === 'Diagonal 1') return [grid[0], grid[4], grid[8]];
    if (line === 'Diagonal 2') return [grid[2], grid[4], grid[6]];

    return [];
  }

  // 🎯 Multiplier logic (important)
  private getMultiplier(symbols: string[]): number {

    const unique = new Set(symbols);

    // jackpot (same symbols)
    if (unique.size === 1) {
      return 5 + Math.floor(Math.random() * 5); // 5x – 10x
    }

    // semi match
    if (unique.size === 2) {
      return 2 + Math.floor(Math.random() * 3); // 2x – 4x
    }

    return 1; // minimum win
  }
}