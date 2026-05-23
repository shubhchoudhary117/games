import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameProvablyService {


  private gameProvablySubject = new BehaviorSubject<boolean>(false);

  openGameProvably$: Observable<boolean> = this.gameProvablySubject.asObservable();

  constructor() { }

  openGameProvably() {
    this.gameProvablySubject.next(true);
  }

  closeGameProvably() {
    this.gameProvablySubject.next(false);
  }

  toggleGameProvably() {
    this.gameProvablySubject.next(!this.gameProvablySubject.value);
  }
}
