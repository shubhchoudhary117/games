
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MikeStatus = 'normal' | 'win' | 'losing' | 'jackpot';

@Component({
  selector: 'app-render-mike',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './render-mike.component.html',
  styleUrls: ['./render-mike.component.scss'],
})
export class RenderMikeComponent implements OnChanges {
  @Input() status: MikeStatus | undefined = 'normal';

  currentMike: string = '/assets/slots/mike1.webp';

  private readonly mikeImages: Record<MikeStatus, string> = {
    normal:  '/assets/slots/mike1.webp',
    losing:  '/assets/slots/mike2.webp',
    jackpot: '/assets/slots/mike3.webp',
    win:     '/assets/slots/mike4.webp',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status'] && this.status) {
      const target = this.mikeImages[this.status] ?? this.mikeImages['normal'];
      setTimeout(() => {
        this.currentMike = target;
      }, 3000);
    }
  }
}