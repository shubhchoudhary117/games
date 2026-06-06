import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DoubleXMenuService {

  /* =========================
     MENU CARD
  ========================= */

  private menuCardSubject =
    new BehaviorSubject<boolean>(false);

  menuCard$ =
    this.menuCardSubject.asObservable();

  get menuCard(): boolean {
    return this.menuCardSubject.value;
  }

  openMenuCard(): void {
    this.menuCardSubject.next(true);
  }

  closeMenuCard(): void {
    this.menuCardSubject.next(false);
  }

  toggleMenuCard(): void {
    this.menuCardSubject.next(
      !this.menuCardSubject.value
    );
  }

  /* =========================
     HOW TO PLAY MODAL
  ========================= */

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

    this.closeMenuCard();

    this.howToPlayModalSubject.next(false);

    this.gameRulesModalSubject.next(false);

    this.betHistoryModalSubject.next(false);
  }
}