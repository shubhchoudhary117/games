import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HowToPlayService {


  private howToPlaySubject = new BehaviorSubject<boolean>(false);

  howToPlayOpen$: Observable<boolean> = this.howToPlaySubject.asObservable();

  constructor() { }

  openHowToPlay() {
    this.howToPlaySubject.next(true);
  }

  closeHowToPlay() {
    this.howToPlaySubject.next(false);
  }

  toggleHowToPlay() {
    this.howToPlaySubject.next(!this.howToPlaySubject.value);
  }
}
