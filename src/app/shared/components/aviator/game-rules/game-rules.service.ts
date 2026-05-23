import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameRulesService {


  private gameRulesSubject = new BehaviorSubject<boolean>(false);

  openGameRules$: Observable<boolean> = this.gameRulesSubject.asObservable();

  constructor() { }

  openGameRules() {
    this.gameRulesSubject.next(true);
  }

  closeGameRules() {
    this.gameRulesSubject.next(false);
  }

  toggleGameRules() {
    this.gameRulesSubject.next(!this.gameRulesSubject.value);
  }
}
