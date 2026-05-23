import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyBetsService {

 private myBetsSubject = new BehaviorSubject<boolean>(false);

  myBetsOpen$: Observable<boolean> = this.myBetsSubject.asObservable();

  constructor() {}

  openMyBets() {
    this.myBetsSubject.next(true);
  }

  closeMyBets() {
    this.myBetsSubject.next(false);
  }

  toggleMyBets() {
    this.myBetsSubject.next(!this.myBetsSubject.value);
  }
}
