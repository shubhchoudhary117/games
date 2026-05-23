import { Component, Input } from '@angular/core';
import { FortyHotSevenService } from '../../../../pages/forty-hot-seven/forty-hot-seven.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-fory-hot-seven-grid',
  standalone: true,
  imports: [NgIf,NgClass,NgFor],
  templateUrl: './fory-hot-seven-grid.component.html',
  styleUrl: './fory-hot-seven-grid.component.scss'
})
export class ForyHotSevenGridComponent {

  @Input() grid: string[][] = [];
  @Input() winCells: [number, number][] = [];
  @Input() spinningCols: Set<number> = new Set();

  constructor(private svc: FortyHotSevenService) { }

  get rows(): number[] { return Array.from({ length: this.svc.ROWS }, (_, i) => i); }
  get cols(): number[] { return Array.from({ length: this.svc.COLS }, (_, i) => i); }

  getEmoji(r: number, c: number): string {
    return this.svc.getSymbol(this.grid[r]?.[c])?.emoji ?? '?';
  }

  isWin(r: number, c: number): boolean {
    return this.winCells.some(([wr, wc]) => wr === r && wc === c);
  }

  isSpinning(c: number): boolean {
    return this.spinningCols.has(c);
  }

  trackByIndex(index: number): number { return index; }
}
