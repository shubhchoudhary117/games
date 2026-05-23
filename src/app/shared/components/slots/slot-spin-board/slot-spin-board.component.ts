import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SlotProps } from '../../../../types/slots/slots.types';
import { SlotColumnComponent } from '../slot-column/slot-column.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';

interface ReelLine { line: number[]; }

@Component({
  selector: 'app-slot-spin-board',
  standalone: true,
  imports: [SlotColumnComponent, NgIf, CommonModule, NgFor],
  templateUrl: './slot-spin-board.component.html',
  styleUrl: './slot-spin-board.component.scss',
})
export class SlotSpinBoardComponent implements OnChanges {
  @Input() grid: string[]        = [];
  @Input() isSpinning            = false;
  @Input() data: SlotProps | null = null;
  @Input() winningLines: string[] = [];
  @Input() loadedImages          = 0;
  @Output() loadedImagesChange   = new EventEmitter<number>();

  readonly reelLines: ReelLine[] = [
    { line: [0, 3, 6] },
    { line: [1, 4, 7] },
    { line: [2, 5, 8] },
  ];

  ngOnChanges(_: SimpleChanges): void {}

  onImageLoad(): void {
    this.loadedImagesChange.emit(this.loadedImages + 1);
  }

  getColumnSymbols(reelLine: ReelLine): string[] {
    return [
      this.grid[reelLine.line[0]] ?? 'red',
      this.grid[reelLine.line[1]] ?? 'red',
      this.grid[reelLine.line[2]] ?? 'red',
    ];
  }

  getFormattedPayout(): string {
    if (!this.data?.totalPayout || this.data.totalPayout <= 0 || this.isSpinning) return '';
    return (
      'Won ' +
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
        .format(this.data.totalPayout)
        .replace('$', 'K₽')
    );
  }

  trackByIndex(index: number): number { return index; }
}