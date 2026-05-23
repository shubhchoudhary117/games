import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameLimitsService {

 private gameLimitsSubject = new BehaviorSubject<boolean>(false);
 
   openGameLimits$: Observable<boolean> = this.gameLimitsSubject.asObservable();
 
   constructor() {}
 
   openGameLimits() {
     this.gameLimitsSubject.next(true);
   }
 
   closeGameLimits() {
     this.gameLimitsSubject.next(false);
   }
 
   toggleGameLimits() {
     this.gameLimitsSubject.next(!this.gameLimitsSubject.value);
   }

   
}
