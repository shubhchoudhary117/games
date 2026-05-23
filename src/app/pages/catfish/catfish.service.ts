import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { dummyCatfishes } from '../../data/catfish/DummyData';

const DUMMY_PROFILES_POOL=dummyCatfishes;


// In-memory game state — insertBet mein set hota hai, swipeCard mein use hota hai
let _currentGameProfiles: typeof DUMMY_PROFILES_POOL = [];
let _catfishProfileIds: string[] = [];

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class CatfishApiService {

  // HttpClient aur TokenService hataye — dummy mein kaam nahi aate
  constructor() {}

  // ── getUser ───────────────────────────────────────────────────────────────
  getUser(): Observable<any> {
    return of({
      data: {
        id: 'dummy-user-001',
        name: 'Test Player',
        coin: 10000,
        Settings: { Color_Mode: 'DARK', Sound_On: true },
      }
    }).pipe(delay(200));
  }

  // ── insertBet ─────────────────────────────────────────────────────────────
  insertBet(payload: { amount: number; numberOfProfiles: number }): Observable<any> {
    const catfishCount = payload.numberOfProfiles ?? 2;
    const shuffled     = shuffleArray(DUMMY_PROFILES_POOL);
    const catfishes    = shuffled.filter((p:any) => p.isCatFish).slice(0, catfishCount);
    const normals      = shuffled.filter((p:any) => !p.isCatFish).slice(0, 25 - catfishes.length);
    const profiles     = shuffleArray([...catfishes, ...normals]).slice(0, 25);

    // Game state save karo taaki swipeCard mein catfish check ho sake
    _currentGameProfiles = profiles;
    _catfishProfileIds   = catfishes.map((p:any) => p.profileId);

    return of({
      data: {
        id: 'dummy-game-' + Date.now(),
        profiles,
      }
    }).pipe(delay(300));
  }

  // ── swipeCard ─────────────────────────────────────────────────────────────
  swipeCard(payload: {
    id: string;
    swipeType: 'LEFT' | 'RIGHT' | 'COLLECT';
    profileId: string;
  }): Observable<any> {

    // COLLECT = cancel ya cashout
    if (payload.swipeType === 'COLLECT') {
      return of({
        data: {
          responseStatus: { status: true },
          isCatFish: false,
          winAmt: 0,
          profiles: _currentGameProfiles,
        }
      }).pipe(delay(200));
    }

    // LEFT / RIGHT — profileId se check karo catfish hai ya nahi
    const isCatFish = _catfishProfileIds.includes(payload.profileId);

    return of({
      data: {
        responseStatus: { status: true },
        isCatFish,
        winAmt: 0,  // component khud Multipliers array se calculate karta hai
        profiles: _currentGameProfiles,
      }
    }).pipe(delay(150));
  }

  // ── getBetHistories ───────────────────────────────────────────────────────
  getBetHistories(): Observable<any> {
    return of({
      data: [
        { id: '1', betAmount: 10,  catfishAmount: 2, result: 'CASHOUT', winAmount: 14.40, date: new Date() },
        { id: '2', betAmount: 50,  catfishAmount: 3, result: 'LOSS',    winAmount: 0,     date: new Date() },
        { id: '3', betAmount: 100, catfishAmount: 2, result: 'CASHOUT', winAmount: 127,   date: new Date() },
      ]
    }).pipe(delay(200));
  }
}