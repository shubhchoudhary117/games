import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private sidebarSubject = new BehaviorSubject<boolean>(false);

  
  sidebarOpen$: Observable<boolean> = this.sidebarSubject.asObservable();

  constructor() {}

  openSidebar() {
    this.sidebarSubject.next(true);
  }

  closeSidebar() {
    this.sidebarSubject.next(false);
  }

  toggleSidebar() {
    this.sidebarSubject.next(!this.sidebarSubject.value);
  }
}