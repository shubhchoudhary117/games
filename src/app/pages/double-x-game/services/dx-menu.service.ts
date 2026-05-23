// chicken-banana-menu.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DoubleXMenuService {

 

  private howToPlayModalSubject =
    new BehaviorSubject<boolean>(false);

  howToPlayModal$ =
    this.howToPlayModalSubject.asObservable();

  openHowToPlayModal(): void {
    this.howToPlayModalSubject.next(true);
  }

  closeHowToPlayModal(): void {
    this.howToPlayModalSubject.next(false);
  }

  /* =========================
     GAME RULES MODAL
  ========================= */

  private gameRulesModalSubject =
    new BehaviorSubject<boolean>(false);

  gameRulesModal$ =
    this.gameRulesModalSubject.asObservable();

  openGameRulesModal(): void {
    this.gameRulesModalSubject.next(true);
  }

  closeGameRulesModal(): void {
    this.gameRulesModalSubject.next(false);
  }

  /* =========================
     BET HISTORY MODAL
  ========================= */

  private betHistoryModalSubject =
    new BehaviorSubject<boolean>(false);

  betHistoryModal$ =
    this.betHistoryModalSubject.asObservable();

  openBetHistoryModal(): void {
    this.betHistoryModalSubject.next(true);
  }

  closeBetHistoryModal(): void {
    this.betHistoryModalSubject.next(false);
  }

  /* =========================
     SOUND TOGGLE
  ========================= */

  private soundEnabledSubject =
    new BehaviorSubject<boolean>(false);

  soundEnabled$ =
    this.soundEnabledSubject.asObservable();

  get soundEnabled(): boolean {
    return this.soundEnabledSubject.value;
  }

  toggleSound(): void {
    this.soundEnabledSubject.next(
      !this.soundEnabledSubject.value
    );
  }

  /* =========================
     MUSIC TOGGLE
  ========================= */

  private musicEnabledSubject =
    new BehaviorSubject<boolean>(false);

  musicEnabled$ =
    this.musicEnabledSubject.asObservable();

  get musicEnabled(): boolean {
    return this.musicEnabledSubject.value;
  }

  toggleMusic(): void {
    this.musicEnabledSubject.next(
      !this.musicEnabledSubject.value
    );
  }

  /* =========================
     CLOSE ALL
  ========================= */

  closeAllModals(): void {
    this.howToPlayModalSubject.next(false);
    this.gameRulesModalSubject.next(false);
    this.betHistoryModalSubject.next(false);
  }
}