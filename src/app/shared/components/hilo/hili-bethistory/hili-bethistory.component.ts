import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hili-bethistory',
  standalone: true,
  imports: [NgFor,NgIf,NgClass],
  templateUrl: './hili-bethistory.component.html',
  styleUrl: './hili-bethistory.component.scss'
})
export class HiliBethistoryComponent {
   @Output() close = new EventEmitter<void>();
  

  history = [
    { time: '25.04.2026 14:23', bet: 0.30, cashout: 0, multiplier: 0 },
    { time: '25.04.2026 14:16', bet: 0.30, cashout: 0, multiplier: 0 },
    { time: '25.04.2026 13:57', bet: 0.30, cashout: 1.26, multiplier: 4.2 },
    { time: '25.04.2026 13:43', bet: 0.30, cashout: 0.31, multiplier: 1.05 },
    { time: '25.04.2026 13:41', bet: 0.30, cashout: 0.70, multiplier: 2.34 },
    { time: '25.04.2026 13:37', bet: 0.30, cashout: 0.54, multiplier: 1.8 }
  ];

  closeBethistory(){
    this.close.emit()
  }
  
}
