import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-slot-column',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './slot-column.component.html',
  styleUrls: ['./slot-column.component.scss'],
})
export class SlotColumnComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() symbols: string[] = [];
  @Input() isSpinning: boolean = false;
  @Input() position: number = 0;
  @Input() winningLines: string[] = [];

  @ViewChild('rouletteRef') rouletteRef!: ElementRef<HTMLDivElement>;

  readonly cellHeight = 112;
  readonly loopCount = 10;

  rouletteItems: string[] = [];
  loading: boolean = true;

  private currentY = 0;
  private rafId: number | null = null;
  private spinSpeed = 0;
  private stopRequested = false;
  private stopTargetY = 0;
  private decelerating = false;
  private loopHeight = 0;
  private resultY = 0;

  private readonly options = ['red', 'blue', 'green', 'yin_yang', 'hakkero', 'yellow', 'wild'];

  ngAfterViewInit(): void {
    this.syncTransform();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['symbols'] && this.symbols.length) {
      this.createRouletteItems();
    }
    if (changes['isSpinning']) {
      if (this.isSpinning) {
        this.startSpin();
      } else {
        this.requestStop();
      }
    }
  }

  ngOnDestroy(): void {
    this.cancelRaf();
  }

  createRouletteItems(): void {
    const body: string[] = [];
    for (let i = 0; i < 47; i++) {
      body.push(this.options[Math.floor(Math.random() * this.options.length)]);
    }
    body[46] = this.symbols[0];
    body[47] = this.symbols[1];
    body[48] = this.symbols[2];

    const loopStrip: string[] = [];
    for (let i = 0; i < this.loopCount; i++) {
      loopStrip.push(this.options[Math.floor(Math.random() * this.options.length)]);
    }

    this.rouletteItems = [...loopStrip, ...body];
    this.loopHeight = this.loopCount * this.cellHeight;

    const resultStartIndex = 46 + this.loopCount;
    this.resultY = -(resultStartIndex * this.cellHeight);

    this.syncTransform();
  }

  private startSpin(): void {
    this.cancelRaf();
    this.stopRequested = false;
    this.decelerating = false;
    this.spinSpeed = 0;
    this.currentY = 0;

    // ── Speed tuning ──────────────────────────────────────────
    const MAX_SPEED = 18;   // px/frame at 60fps  →  ~1080px/s  (characters clearly visible)
    const ACCEL     = 0.2;  // px added per frame until MAX_SPEED is reached
    const DECEL     = 0.2; // multiplier per frame during slow-down (lower = stops faster)
    // ─────────────────────────────────────────────────────────

    const delay = this.position * 250; // col stagger: 0ms / 250ms / 500ms

    const tick = () => {
      if (!this.decelerating) {
        this.spinSpeed = Math.min(this.spinSpeed + ACCEL, MAX_SPEED);
      } else {
        this.spinSpeed *= DECEL;
      }

      this.currentY -= this.spinSpeed;

      // Seamless wrap while free-spinning
      if (!this.decelerating && this.currentY < -this.loopHeight) {
        this.currentY += this.loopHeight;
      }

      // Trigger deceleration when stop is requested
      if (this.stopRequested && !this.decelerating) {
        this.stopTargetY = this.resultY;
        this.decelerating = true;
        // Runway: enough distance for the decel curve to play out smoothly
        const distanceNeeded = 400;
        this.currentY = this.stopTargetY + distanceNeeded;
      }

      // Snap when practically stopped
      if (this.decelerating && this.spinSpeed < 0.4) {
        this.currentY = this.stopTargetY;
        this.syncTransform();
        this.cancelRaf();
        return;
      }

      // Overshot guard
      if (this.decelerating && this.currentY < this.stopTargetY) {
        this.currentY = this.stopTargetY;
        this.syncTransform();
        this.cancelRaf();
        return;
      }

      this.syncTransform();
      this.rafId = requestAnimationFrame(tick);
    };

    setTimeout(() => {
      this.rafId = requestAnimationFrame(tick);
    }, delay);
  }

  private requestStop(): void {
    this.stopRequested = true;
    if (this.rafId === null) {
      this.currentY = this.resultY;
      this.syncTransform();
    }
  }

  private cancelRaf(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private syncTransform(): void {
    if (!this.rouletteRef?.nativeElement) return;
    this.rouletteRef.nativeElement.style.transform = `translateY(${this.currentY}px)`;
  }

  handleImageLoad(): void {
    this.loading = false;
  }

  getSymbolImage(symbol: string): string {
    const images: Record<string, string> = {
      red:      '/assets/slots/slot-images/red.webp',
      blue:     '/assets/slots/slot-images/shangai.webp',
      green:    '/assets/slots/slot-images/lily.webp',
      yin_yang: '/assets/slots/slot-images/yin.webp',
      hakkero:  '/assets/slots/slot-images/hakkero.webp',
      yellow:   '/assets/slots/slot-images/green.webp',
      wild:     '/assets/slots/slot-images/wild.webp',
    };
    return images[symbol] ?? '';
  }

  private get r0(): number { return this.loopCount + 46; }
  private get r1(): number { return this.loopCount + 47; }
  private get r2(): number { return this.loopCount + 48; }

  isWinningSymbol(index: number): boolean {
    if (index < this.loopCount + 46) return false;
    for (const line of this.winningLines ?? []) {
      if (line.startsWith('Horizontal')) {
        if (line.endsWith('1') && index === this.r0) return true;
        if (line.endsWith('2') && index === this.r1) return true;
        if (line.endsWith('3') && index === this.r2) return true;
      }
      if (line.startsWith('Diagonal')) {
        if (line.endsWith('1') && this.position === 0 && index === this.r0) return true;
        if (line.endsWith('1') && this.position === 2 && index === this.r2) return true;
        if (this.position === 1 && index === this.r1) return true;
        if (line.endsWith('2') && this.position === 0 && index === this.r2) return true;
        if (line.endsWith('2') && this.position === 2 && index === this.r0) return true;
      }
    }
    return false;
  }

  getLineRotations(index: number): string[] {
    const rotations: string[] = [];
    for (const line of this.winningLines ?? []) {
      if (
        line.startsWith('Horizontal') &&
        ((line.endsWith('1') && index === this.r0) ||
          (line.endsWith('2') && index === this.r1) ||
          (line.endsWith('3') && index === this.r2))
      ) {
        rotations.push('rotate(0deg)');
      }
      if (line.startsWith('Diagonal')) {
        if (
          (line.endsWith('1') && this.position === 0 && index === this.r0) ||
          (line.endsWith('1') && this.position === 2 && index === this.r2)
        ) {
          rotations.push('rotate(45deg)');
        } else if (
          (line.endsWith('2') && this.position === 0 && index === this.r2) ||
          (line.endsWith('2') && this.position === 2 && index === this.r0)
        ) {
          rotations.push('rotate(-45deg)');
        } else if (this.position === 1 && index === this.r1) {
          const hasDiag1 = this.winningLines.includes('Diagonal 1');
          const hasDiag2 = this.winningLines.includes('Diagonal 2');
          if (hasDiag1 && hasDiag2) {
            rotations.push('rotate(45deg)', 'rotate(-45deg)');
          } else if (hasDiag1) {
            rotations.push('rotate(45deg)');
          } else if (hasDiag2) {
            rotations.push('rotate(-45deg)');
          }
        }
      }
    }
    return rotations;
  }

  trackByIndex(index: number): number {
    return index;
  }
}