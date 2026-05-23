import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-forty-hot-seven-loadingscreen',
  standalone: true,
  imports: [NgFor,NgIf,NgClass],
  templateUrl: './forty-hot-seven-loadingscreen.component.html',
  styleUrl: './forty-hot-seven-loadingscreen.component.scss'
})
export class FortyHotSevenLoadingscreenComponent {
  @Output() loadingComplete = new EventEmitter<void>();

  progress = 0;
  isComplete = false;
  particles: { left: string; delay: string; duration: string; size: string }[] = [];
  embers: { left: string; top: string; delay: string }[] = [];

  ngOnInit() {
    this.particles = Array.from({ length: 18 }, () => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2.5 + Math.random() * 2}s`,
      size: `${4 + Math.random() * 6}px`
    }));

    this.embers = Array.from({ length: 25 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${40 + Math.random() * 50}%`,
      delay: `${Math.random() * 4}s`
    }));

    this.startLoading();
  }

  startLoading() {
    const steps = [
      { target: 15, delay: 200 },
      { target: 35, delay: 600 },
      { target: 55, delay: 400 },
      { target: 72, delay: 700 },
      { target: 88, delay: 500 },
      { target: 95, delay: 300 },
      { target: 100, delay: 400 },
    ];

    let current = 0;

    const runStep = () => {
      if (current >= steps.length) {
        this.isComplete=true;
        this.loadingComplete.emit()
        // setTimeout(() => {
        //   this.isComplete = true;
        //   setTimeout(() => this.loadingComplete.emit(), 800);
        // }, 300);
        return;
      }

      const step = steps[current++];

      setTimeout(() => {
        this.animateProgress(this.progress, step.target, 300);
        runStep();
      }, step.delay);
    };

    runStep();
  }

  animateProgress(from: number, to: number, duration: number) {
    const start = performance.now();
    const update = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      this.progress = Math.round(from + (to - from) * t);
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
}
