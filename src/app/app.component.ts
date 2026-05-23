import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'lobby';


  ngOnInit(): void {

    // CTRL + Mouse Wheel Zoom Disable
    document.addEventListener(
      'wheel',
      this.disableZoomWheel,
      { passive: false }
    );

    // Pinch Zoom Disable (Mobile Safari)
    document.addEventListener(
      'gesturestart',
      this.disableGesture
    );
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardZoom(event: KeyboardEvent) {

    if (
      event.ctrlKey &&
      (
        event.key === '+' ||
        event.key === '-' ||
        event.key === '=' ||
        event.key === '0'
      )
    ) {
      event.preventDefault();
    }
  }
  disableZoomWheel = (event: WheelEvent) => {

    if (event.ctrlKey) {
      event.preventDefault();
    }
  };


  disableGesture = (event: Event) => {

    event.preventDefault();
  };
}
