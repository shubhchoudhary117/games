import { NgIf } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-crazy-matka-wheel',
  standalone: true,
  imports: [NgIf],
  templateUrl: './crazy-matka-wheel.component.html',
  styleUrl: './crazy-matka-wheel.component.scss'
})
export class CrazyMatkaWheelComponent {
  @Input() stopOnNumber: string = '';

  @ViewChild('canvasRef', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  spinning = false;
  spinSpeed = 0;
  angle = 0;
  animationFrame: any;

  WheelWidth = 400;
  WheelHeight = 400;

  centerImg = new Image();
  imageLoaded = false;

  tickAudio = new Audio('assets/wheel/audios/wheel_tick.mp3');

  wheelISStart = false; // replace with NgRx if needed

  segments = [
    "2", "CRAZY MATKA", "0", "3", "9", "1", "0", "5", "4", "3",
    "9", "6", "7", "1", "9", "5", "8", "4", "2", "8",
    "2", "CRAZY MATKA", "0", "3", "9", "1", "0", "5", "4", "3",
    "9", "6", "7", "1", "9", "5", "8", "4", "2", "8"
  ];

  colors = [
    "#6a3d8e", "#8e44ad", "#3498db", "#2ecc71", "#f1c40f",
    "#e67e22", "#e74c3c", "#1abc9c", "#9b59b6"
  ];

  ngOnInit() {
    this.tickAudio.volume = 1;
  }

  ngAfterViewInit() {
    this.drawWheel();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
    this.tickAudio.pause();
  }

  // ================= CANVAS =================
  setupCanvas(): CanvasRenderingContext2D | null {
    const canvas = this.canvasRef.nativeElement;
    const scale = window.devicePixelRatio || 1;

    canvas.width = this.WheelWidth * scale;
    canvas.height = this.WheelHeight * scale;
    canvas.style.width = `${this.WheelWidth}px`;
    canvas.style.height = `${this.WheelHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    return ctx;
  }

  drawWheel() {
    const ctx = this.setupCanvas();
    if (!ctx) return;

    const centerX = this.WheelWidth / 2;
    const centerY = this.WheelHeight / 2;
    const radius = Math.min(this.WheelWidth, this.WheelHeight) * 0.4;

    ctx.clearRect(0, 0, this.WheelWidth, this.WheelHeight);

    this.segments.forEach((segment, i) => {
      const startAngle = this.angle + (i * 2 * Math.PI / this.segments.length);
      const endAngle = startAngle + (2 * Math.PI / this.segments.length);

      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.6, centerX, centerY, radius);
      gradient.addColorStop(0, this.shadeColor(this.colors[i % this.colors.length], 20));
      gradient.addColorStop(1, this.colors[i % this.colors.length]);

      ctx.fillStyle = segment === "CRAZY MATKA" ? "#e91e63" : gradient;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#f3b00f";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + Math.PI / this.segments.length);

      ctx.fillStyle = "#fff";
      ctx.textAlign = "right";
      ctx.font = segment === "CRAZY MATKA"
        ? "bold 12px Arial"
        : "bold 18px Arial";

      ctx.fillText(segment, radius - 20, 7);
      ctx.restore();
    });
  }

  shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, R * (100 + percent) / 100);
    G = Math.min(255, G * (100 + percent) / 100);
    B = Math.min(255, B * (100 + percent) / 100);

    return `#${Math.round(R).toString(16).padStart(2, '0')}${Math.round(G).toString(16).padStart(2, '0')}${Math.round(B).toString(16).padStart(2, '0')}`;
  }

  // ================= LOGIC =================
  getTargetSegmentIndex(val: string) {
    return this.segments.findIndex(s => s === val);
  }

  getCurrentSegmentIndex(): number {
    const normalized = ((this.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const segAngle = (2 * Math.PI) / this.segments.length;
    const pointerAngle = (3 * Math.PI / 2);
    const angleFromPointer = (pointerAngle - normalized + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(angleFromPointer / segAngle);
  }

  spinWheel() {
    if (this.spinning) return;
    this.spinning = true;

    let targetAngle = 0;

    if (this.stopOnNumber) {
      const idx = this.getTargetSegmentIndex(this.stopOnNumber);
      if (idx >= 0) {
        const segAngle = (2 * Math.PI) / this.segments.length;
        targetAngle = (3 * Math.PI / 2) - (idx * segAngle) - (segAngle / 2);
        targetAngle += 20 * 2 * Math.PI;
      }
    }

    const startAngle = this.angle;
    const duration = 20000;
    const startTime = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      this.angle = startAngle + (targetAngle - startAngle) * easeOut(progress);
      this.drawWheel();

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.spinning = false;

        const finalIndex = this.getCurrentSegmentIndex();
        alert(`Stopped on: ${this.segments[finalIndex]}`);

        this.resetWheel();
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  resetWheel() {
    cancelAnimationFrame(this.animationFrame);
    this.spinning = false;
    this.angle = 0;
    this.drawWheel();
  }
}
