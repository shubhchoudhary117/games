import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoundInfoService {

   private roundInfoSubject = new BehaviorSubject<boolean>(false);
  
    roundInfoOpen$: Observable<boolean> = this.roundInfoSubject.asObservable();
  
    constructor() {}
  
    openRoundInfo() {
      this.roundInfoSubject.next(true);
    }
  
    closeRoundInfo() {
      this.roundInfoSubject.next(false);
    }
  
    toggleRoundInfo() {
      this.roundInfoSubject.next(!this.roundInfoSubject.value);
    }
}
