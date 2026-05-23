import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-dice-canvas',
  standalone: true,
  imports: [],
  templateUrl: './dice-canvas.component.html',
  styleUrl: './dice-canvas.component.scss',
})
export class DiceCanvasComponent implements OnDestroy {

  @Input() dice1Value: number = 1;
  @Input() dice2Value: number = 1;
  @Input() spinDuration: number = 3000;

  @Output() spinStart = new EventEmitter<void>();
  @Output() spinEnd = new EventEmitter<{ dice1: number; dice2: number; total: number }>();

  // CSS transform applied to each dice element
  dice1Transform = '';
  dice2Transform = '';

  // Whether the spin CSS transition is active
  spinning = false;

  // Snapshot of values at spin-start (so they can't change mid-spin)
  public _d1 = 1;
  public _d2 = 1;

  private spinTimer: any = null;
  private _spinning = false; // internal guard — prevents re-entry

  constructor(private zone: NgZone) { }

  ngOnDestroy(): void {
    if (this.spinTimer) clearTimeout(this.spinTimer);
  }

  /**
   * Called by parent once per round.
   * Parent must set dice1Value / dice2Value BEFORE calling this.
   */
  spin(): void {
    if (this._spinning) return;
    this._spinning = true;

    this._d1 = this.dice1Value;
    this._d2 = this.dice2Value;

    this.spinning = true;
    this.spinStart.emit();

    // Pehle final transform nikalo
    const finalD1 = this.getFaceTransform(this._d1);
    const finalD2 = this.getFaceTransform(this._d2);

    // Spin: final transform se pehle 5 full rotations add karo
    // Isse animation bhi hogi aur final face bhi correct rahega
    const [rx1, ry1] = this.extractRotations(finalD1);
    const [rx2, ry2] = this.extractRotations(finalD2);

    this.dice1Transform = `rotateX(${rx1 + 1800}deg) rotateY(${ry1 + 1800}deg)`;
    this.dice2Transform = `rotateX(${rx2 - 1800}deg) rotateY(${ry2 + 1800}deg)`;

    if (this.spinTimer) clearTimeout(this.spinTimer);

    this.spinTimer = setTimeout(() => {
      this.spinning = false;
      // Final face — bilkul exact value, koi offset nahi
      this.dice1Transform = finalD1;
      this.dice2Transform = finalD2;

      setTimeout(() => {
        this._spinning = false;
        this.zone.run(() => {
          this.spinEnd.emit({
            dice1: this._d1,
            dice2: this._d2,
            total: this._d1 + this._d2,
          });
        });
      }, 300);
    }, this.spinDuration);
  }

  private extractRotations(transform: string): [number, number] {
    const rxMatch = transform.match(/rotateX\(([-\d.]+)deg\)/);
    const ryMatch = transform.match(/rotateY\(([-\d.]+)deg\)/);
    return [
      rxMatch ? parseFloat(rxMatch[1]) : 0,
      ryMatch ? parseFloat(ryMatch[1]) : 0,
    ];
  }

  /**
   * Standard dice face → CSS 3D rotation mapping.
   *
   * Standard cube layout (right-hand rule):
   *   front  = 1   back   = 6
   *   right  = 2   left   = 5
   *   top    = 3   bottom = 4
   *
   * The CSS cube in the template is built with:
   *   .front  translateZ(+35px)   → face 1
   *   .back   translateZ(-35px) rotateY(180deg) → face 6
   *   .right  translateX(+35px) rotateY(90deg)  → face 2
   *   .left   translateX(-35px) rotateY(-90deg) → face 5
   *   .top    translateY(-35px) rotateX(90deg)  → face 3
   *   .bottom translateY(+35px) rotateX(-90deg) → face 4
   *
   * To show face N on front, we rotate the CUBE so that face comes forward.
   */
 private getFaceTransform(face: number): string {

  switch (face) {

    // 1 = front
    case 1:
      return 'rotateX(0deg) rotateY(0deg)';

    // 2 = right
    case 2:
      return 'rotateX(0deg) rotateY(-90deg)';

    // 3 = top
    case 3:
      return 'rotateX(-90deg) rotateY(0deg)';

    // 4 = bottom
    case 4:
      return 'rotateX(90deg) rotateY(0deg)';

    // 5 = left
    case 5:
      return 'rotateX(0deg) rotateY(90deg)';

    // 6 = back
    case 6:
      return 'rotateX(0deg) rotateY(180deg)';

    default:
      return 'rotateX(0deg) rotateY(0deg)';
  }
}
}