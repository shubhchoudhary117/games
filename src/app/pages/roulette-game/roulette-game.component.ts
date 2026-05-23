// src/app/components/wheel/wheel.component.ts
import {
  Component, ElementRef, ViewChild, AfterViewInit,
  OnDestroy, inject, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WHEEL_ORDER } from './roulette.model';

/* ── Canvas geometry constants ── */
const R_OUTER_BOWL   = 196;
const R_BOWL_INNER   = 188;
const R_BALL_TRACK   = 178;
const R_BALL_TRACK_I = 164;
const R_NUM_OUTER    = 162;
const R_NUM_INNER    = 122;
const R_CONE         = 114;
const R_HUB          = 26;

const N     = WHEEL_ORDER.length;
const SLICE = (2 * Math.PI) / N;

/* ── Easing ── */
const EASE_PHASE = 0.65;
const EASE_V     = 2 / (1 + EASE_PHASE);
const EASE_D1    = EASE_V * EASE_PHASE;
function spinEase(t: number): number {
  if (t <= EASE_PHASE) return EASE_V * t;
  const t2 = (t - EASE_PHASE) / (1 - EASE_PHASE);
  return EASE_D1 + (1 - EASE_D1) * (1 - Math.pow(1 - t2, 2));
}

@Component({
  selector: 'app-wheel',
  standalone: true,
  imports: [CommonModule, TimerComponent, WinPopupComponent],
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.scss'],
})
export class WheelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('wheelCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private rs   = inject(RouletteService);
  private zone = inject(NgZone);

  private ctx!: CanvasRenderingContext2D;
  private W = 400; private H = 400;
  private CX = 200; private CY = 200;

  private wheelAngle  = 0;
  private ballAngle   = 0;
  private ballDropProg = 0;  // 0 = track, 1 = pocket

  private animId  = 0;
  private spinStart    = 0;
  private spinDuration = 0;
  private wStart = 0; private wEnd = 0;
  private bStart = 0; private bEnd = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.W = canvas.width;
    this.H = canvas.height;
    this.CX = this.W / 2;
    this.CY = this.H / 2;

    this.drawWheel(0, 0);
    this.zone.runOutsideAngular(() => this.idleAnimate());

    // Start timer; on expiry → spin
    this.rs.startTimer(() => this.zone.runOutsideAngular(() => this.startSpin()));
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    this.rs.stopTimer();
  }

  // ─────────────────────────────────
  // IDLE
  // ─────────────────────────────────
  private idleAnimate = () => {
    if (this.rs.spinning()) return;
    this.wheelAngle += 0.003;
    if (this.ballDropProg === 0) this.ballAngle -= 0.005;
    this.drawWheel(this.wheelAngle, this.ballAngle);
    this.animId = requestAnimationFrame(this.idleAnimate);
  };

  // ─────────────────────────────────
  // SPIN START
  // ─────────────────────────────────
  private startSpin() {
    this.zone.run(() => this.rs.spinning.set(true));
    cancelAnimationFrame(this.animId);

    /* Random target */
    const idx    = Math.floor(Math.random() * N);
    const target = WHEEL_ORDER[idx];

    /*
      Wheel end: pocket idx sits at top (-π/2)
      wheelEnd + idx * SLICE = -π/2 + 2πk
      => wheelEnd = -π/2 - idx*SLICE + 2πk
      choose k for ≥ 10 full turns forward
    */
    const rawW = -Math.PI / 2 - idx * SLICE;
    const kW   = Math.ceil((this.wheelAngle + 10 * 2 * Math.PI - rawW) / (2 * Math.PI));
    this.wStart = this.wheelAngle;
    this.wEnd   = rawW + kW * 2 * Math.PI;

    /* Ball: counter-clockwise to -π/2, ≥ 14 full turns */
    const targetBall = -Math.PI / 2;
    const adj = ((this.ballAngle - targetBall) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    this.bStart = this.ballAngle;
    this.bEnd   = this.ballAngle - (14 * 2 * Math.PI + adj);

    this.ballDropProg = 0;
    this.spinDuration = 10000 + Math.random() * 3000;
    this.spinStart    = performance.now();

    // Store target so finishSpin knows it
    this._pendingTarget = target;
    this.animId = requestAnimationFrame(this.animateSpin);
  }

  private _pendingTarget = 0;

  // ─────────────────────────────────
  // SPIN ANIMATE
  // ─────────────────────────────────
  private animateSpin = () => {
    const t = Math.min((performance.now() - this.spinStart) / this.spinDuration, 1);
    const e = spinEase(t);

    this.wheelAngle   = this.wStart + (this.wEnd - this.wStart) * e;
    this.ballAngle    = this.bStart + (this.bEnd - this.bStart) * e;
    this.ballDropProg = t <= EASE_PHASE ? 0 : (t - EASE_PHASE) / (1 - EASE_PHASE);

    this.drawWheel(this.wheelAngle, this.ballAngle);

    if (t < 1) {
      this.animId = requestAnimationFrame(this.animateSpin);
    } else {
      this.wheelAngle   = this.wEnd;
      this.ballAngle    = this.bEnd;
      this.ballDropProg = 1;
      this.finishSpin();
    }
  };

  // ─────────────────────────────────
  // FINISH SPIN
  // ─────────────────────────────────
  private finishSpin() {
    this.drawWheel(this.wheelAngle, this.ballAngle);  // ball fully in pocket
    const num = this._pendingTarget;

    this.zone.run(() => {
      this.rs.spinning.set(false);
      this.rs.finishRound(num);
    });

    // Wait for popup to be shown, then after 4.5s restart
    setTimeout(() => {
      this.zone.runOutsideAngular(() => {
        this.ballDropProg = 0;
        this.animId = requestAnimationFrame(this.idleAnimate);
        this.zone.run(() =>
          this.rs.startTimer(() =>
            this.zone.runOutsideAngular(() => this.startSpin())
          )
        );
      });
    }, 4600);
  }

  // ─────────────────────────────────
  // DRAW WHEEL
  // ─────────────────────────────────
  private drawWheel(wAngle: number, bAngle: number) {
    const { ctx, W, H, CX, CY } = this;
    ctx.clearRect(0, 0, W, H);

    /* Shadow */
    const sg = ctx.createRadialGradient(CX,CY,R_OUTER_BOWL-10,CX,CY,R_OUTER_BOWL+18);
    sg.addColorStop(0,'rgba(0,0,0,0)'); sg.addColorStop(1,'rgba(0,0,0,0.7)');
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_OUTER_BOWL+18,0,Math.PI*2);
    ctx.fillStyle=sg; ctx.fill(); ctx.restore();

    /* Mahogany bowl */
    const bg = ctx.createRadialGradient(CX-55,CY-55,20,CX,CY,R_OUTER_BOWL);
    bg.addColorStop(0,'#6b2f0e'); bg.addColorStop(0.3,'#8b3d12');
    bg.addColorStop(0.6,'#5a2208'); bg.addColorStop(0.85,'#3d1605'); bg.addColorStop(1,'#2a0e02');
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_OUTER_BOWL,0,Math.PI*2);
    ctx.fillStyle=bg; ctx.fill(); ctx.restore();

    /* Gold outer trim */
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_BOWL_INNER+2,0,Math.PI*2); ctx.lineWidth=4;
    const gr1=ctx.createLinearGradient(CX-R_BOWL_INNER,CY,CX+R_BOWL_INNER,CY);
    gr1.addColorStop(0,'#8a6010'); gr1.addColorStop(0.25,'#f0d060');
    gr1.addColorStop(0.5,'#d4a020'); gr1.addColorStop(0.75,'#f5e070'); gr1.addColorStop(1,'#8a6010');
    ctx.strokeStyle=gr1; ctx.stroke(); ctx.restore();

    /* Ball track */
    const tg=ctx.createRadialGradient(CX,CY,R_BALL_TRACK_I,CX,CY,R_BALL_TRACK);
    tg.addColorStop(0,'#7a3a10'); tg.addColorStop(0.4,'#9a4a18');
    tg.addColorStop(0.8,'#6a2e08'); tg.addColorStop(1,'#4a1e04');
    ctx.save();
    ctx.beginPath(); ctx.arc(CX,CY,R_BALL_TRACK,0,Math.PI*2); ctx.fillStyle=tg; ctx.fill();
    ctx.beginPath(); ctx.arc(CX,CY,R_BALL_TRACK_I,0,Math.PI*2); ctx.fillStyle='#3d1605'; ctx.fill();
    ctx.restore();

    /* Ball track gold border */
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_BALL_TRACK_I,0,Math.PI*2); ctx.lineWidth=2;
    const gi=ctx.createLinearGradient(CX-R_BALL_TRACK_I,CY,CX+R_BALL_TRACK_I,CY);
    gi.addColorStop(0,'#7a5010'); gi.addColorStop(0.5,'#e8c040'); gi.addColorStop(1,'#7a5010');
    ctx.strokeStyle=gi; ctx.stroke(); ctx.restore();

    /* Diamond deflectors */
    for(let d=0;d<8;d++){
      const da=d*(Math.PI*2/8);
      const dr=(R_BALL_TRACK+R_BALL_TRACK_I)/2;
      const dx=CX+Math.cos(da)*dr, dy=CY+Math.sin(da)*dr;
      ctx.save(); ctx.translate(dx,dy); ctx.rotate(da+Math.PI/4);
      ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(4,0); ctx.lineTo(0,6); ctx.lineTo(-4,0); ctx.closePath();
      const dg=ctx.createRadialGradient(-1,-1,0,0,0,6);
      dg.addColorStop(0,'#fffbe0'); dg.addColorStop(0.4,'#e8c040'); dg.addColorStop(1,'#9a6010');
      ctx.fillStyle=dg; ctx.fill(); ctx.strokeStyle='#c8a030'; ctx.lineWidth=0.7; ctx.stroke(); ctx.restore();
    }

    /* Number pockets (spinning rotor) */
    for(let i=0;i<N;i++){
      const startA=wAngle+i*SLICE-SLICE/2, endA=startA+SLICE;
      const num=WHEEL_ORDER[i], col=numColor(num);
      const midA=wAngle+i*SLICE;
      const midX=CX+Math.cos(midA)*(R_NUM_OUTER+R_NUM_INNER)/2;
      const midY=CY+Math.sin(midA)*(R_NUM_OUTER+R_NUM_INNER)/2;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX+Math.cos(startA)*R_NUM_INNER,CY+Math.sin(startA)*R_NUM_INNER);
      ctx.arc(CX,CY,R_NUM_OUTER,startA,endA);
      ctx.arc(CX,CY,R_NUM_INNER,endA,startA,true);
      ctx.closePath();
      const pg=ctx.createRadialGradient(midX-Math.cos(midA)*6,midY-Math.sin(midA)*6,0,midX,midY,26);
      if(col==='red'){
        pg.addColorStop(0,'#e62a00'); pg.addColorStop(0.5,'#c41a00'); pg.addColorStop(1,'#7a0c00');
      } else if(col==='black'){
        pg.addColorStop(0,'#2a2a2a'); pg.addColorStop(0.5,'#111'); pg.addColorStop(1,'#000');
      } else {
        pg.addColorStop(0,'#1a8040'); pg.addColorStop(0.5,'#0d5c28'); pg.addColorStop(1,'#073818');
      }
      ctx.fillStyle=pg; ctx.fill(); ctx.restore();

      /* Fret */
      ctx.save(); ctx.beginPath();
      ctx.moveTo(CX+Math.cos(startA)*R_NUM_INNER,CY+Math.sin(startA)*R_NUM_INNER);
      ctx.lineTo(CX+Math.cos(startA)*R_NUM_OUTER,CY+Math.sin(startA)*R_NUM_OUTER);
      ctx.strokeStyle='#d4a030'; ctx.lineWidth=1.8; ctx.stroke(); ctx.restore();

      /* Number text */
      ctx.save();
      const textR=(R_NUM_OUTER+R_NUM_INNER)/2+1;
      ctx.translate(CX+Math.cos(midA)*textR,CY+Math.sin(midA)*textR);
      ctx.rotate(midA+Math.PI/2);
      ctx.font='bold 11px Oswald, Arial';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.strokeStyle='rgba(0,0,0,0.8)'; ctx.lineWidth=2.5; ctx.strokeText(String(num),0,0);
      ctx.fillStyle='#ffffff'; ctx.fillText(String(num),0,0);
      ctx.restore();
    }

    /* Gold pocket rim */
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_NUM_OUTER,0,Math.PI*2); ctx.lineWidth=2.5;
    const rr=ctx.createLinearGradient(CX-R_NUM_OUTER,CY,CX+R_NUM_OUTER,CY);
    rr.addColorStop(0,'#8a6010'); rr.addColorStop(0.3,'#f0d060'); rr.addColorStop(0.6,'#d4a020'); rr.addColorStop(1,'#8a6010');
    ctx.strokeStyle=rr; ctx.stroke(); ctx.restore();

    /* Inner gold ring */
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_NUM_INNER,0,Math.PI*2); ctx.lineWidth=3.5;
    const ir=ctx.createLinearGradient(CX-R_NUM_INNER,CY,CX+R_NUM_INNER,CY);
    ir.addColorStop(0,'#7a5008'); ir.addColorStop(0.25,'#f0d060');
    ir.addColorStop(0.5,'#c89018'); ir.addColorStop(0.75,'#f5e070'); ir.addColorStop(1,'#7a5008');
    ctx.strokeStyle=ir; ctx.stroke(); ctx.restore();

    /* Center cone */
    const cg=ctx.createRadialGradient(CX-28,CY-28,5,CX,CY,R_CONE);
    cg.addColorStop(0,'#7a3010'); cg.addColorStop(0.3,'#9a4018');
    cg.addColorStop(0.6,'#6a2808'); cg.addColorStop(0.85,'#4a1a04'); cg.addColorStop(1,'#3a1202');
    ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R_CONE,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill(); ctx.restore();

    /* Gold spokes */
    for(let s=0;s<4;s++){
      const sa=wAngle*0.3+s*(Math.PI/2);
      const len=R_CONE-R_HUB-8;
      const x1=CX+Math.cos(sa)*(R_HUB+4), y1=CY+Math.sin(sa)*(R_HUB+4);
      const x2=CX+Math.cos(sa)*(R_HUB+len), y2=CY+Math.sin(sa)*(R_HUB+len);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      const spg=ctx.createLinearGradient(x1,y1,x2,y2);
      spg.addColorStop(0,'#c89018'); spg.addColorStop(0.3,'#f8e060');
      spg.addColorStop(0.7,'#d4a020'); spg.addColorStop(1,'#b07010');
      ctx.strokeStyle=spg; ctx.lineWidth=9; ctx.lineCap='round'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle='rgba(255,248,180,0.4)'; ctx.lineWidth=2.5; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(x2,y2,5,0,Math.PI*2);
      const cpg=ctx.createRadialGradient(x2-1,y2-1,1,x2,y2,5);
      cpg.addColorStop(0,'#fffbe0'); cpg.addColorStop(1,'#a07010');
      ctx.fillStyle=cpg; ctx.fill(); ctx.restore();
    }

    /* Hub */
    for(let r=R_HUB;r>0;r-=7){
      const hg=ctx.createRadialGradient(CX-R_HUB*0.3,CY-R_HUB*0.3,0,CX,CY,r);
      hg.addColorStop(0,'#ffe880'); hg.addColorStop(0.4,'#d4a020');
      hg.addColorStop(0.8,'#9a6010'); hg.addColorStop(1,'#7a4808');
      ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,r,0,Math.PI*2);
      ctx.fillStyle=hg; ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.beginPath(); ctx.arc(CX-5,CY-5,7,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,220,0.3)'; ctx.fill(); ctx.restore();

    /* Ball — drops from outer track into pocket */
    const BALL_TRACK_MID = (R_BALL_TRACK + R_BALL_TRACK_I) / 2;
    const POCKET_MID     = (R_NUM_OUTER + R_NUM_INNER) / 2;
    const bR = BALL_TRACK_MID + (POCKET_MID - BALL_TRACK_MID) * Math.min(this.ballDropProg, 1);
    const bx=CX+Math.cos(bAngle)*bR, by=CY+Math.sin(bAngle)*bR;
    const bSize = 6.5 - this.ballDropProg * 1.0;
    ctx.save();
    ctx.beginPath(); ctx.arc(bx+2,by+2,bSize,0,Math.PI*2);
    ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(bx,by,bSize,0,Math.PI*2);
    const ball=ctx.createRadialGradient(bx-2.5,by-2.5,0.5,bx,by,bSize);
    ball.addColorStop(0,'#ffffff'); ball.addColorStop(0.3,'#e8e8e8');
    ball.addColorStop(0.7,'#b0b0b0'); ball.addColorStop(1,'#808080');
    ctx.fillStyle=ball; ctx.fill();
    ctx.beginPath(); ctx.arc(bx-2,by-2,Math.max(1.2,2-this.ballDropProg),0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fill(); ctx.restore();

    /* Top pointer */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CX-11,CY-R_NUM_OUTER-11); ctx.lineTo(CX+11,CY-R_NUM_OUTER-11);
    ctx.lineTo(CX+4,CY-R_NUM_OUTER+3);   ctx.lineTo(CX,CY-R_NUM_OUTER+9);
    ctx.lineTo(CX-4,CY-R_NUM_OUTER+3);   ctx.closePath();
    const ptr=ctx.createLinearGradient(CX,CY-R_NUM_OUTER-11,CX,CY-R_NUM_OUTER+9);
    ptr.addColorStop(0,'#ffe060'); ptr.addColorStop(0.5,'#d4a020'); ptr.addColorStop(1,'#a07010');
    ctx.fillStyle=ptr; ctx.fill(); ctx.strokeStyle='#8a6010'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX,CY-R_NUM_OUTER-15,6,0,Math.PI*2);
    const pin=ctx.createRadialGradient(CX-1,CY-R_NUM_OUTER-17,1,CX,CY-R_NUM_OUTER-15,6);
    pin.addColorStop(0,'#fff8d0'); pin.addColorStop(1,'#a07818');
    ctx.fillStyle=pin; ctx.fill(); ctx.strokeStyle='#c89020'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  }
}