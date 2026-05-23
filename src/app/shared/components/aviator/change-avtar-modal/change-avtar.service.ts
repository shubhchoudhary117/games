import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChangeAvtarService {

  private readonly STORAGE_KEY = 'selected_avatar';
  private readonly DEFAULT_AVATAR = 'assets/aviator/avtars/av1.png';

  changeAvtarSubject = new BehaviorSubject<boolean>(false);
  openChangeAvtar$: Observable<boolean> = this.changeAvtarSubject.asObservable();

  private currentAvatarSubject = new BehaviorSubject<string>(this.loadFromStorage());
  currentAvatar$ = this.currentAvatarSubject.asObservable();

  private loadFromStorage(): string {
    return localStorage.getItem(this.STORAGE_KEY) ?? this.DEFAULT_AVATAR;
  }

  setAvatar(path: string): void {
    localStorage.setItem(this.STORAGE_KEY, path);
    this.currentAvatarSubject.next(path);
  }

  getAvatar(): string {
    return this.currentAvatarSubject.getValue();
  }

  getAvatarList(): string[] {
    return Array.from({ length: 41 }, (_, i) => `assets/aviator/avtars/av${i + 1}.png`);
  }

  openChangeAvtar() {
     this.changeAvtarSubject.next(true);
   }
 
   closeChangeAvtar() {
     this.changeAvtarSubject.next(false);
   }


}
