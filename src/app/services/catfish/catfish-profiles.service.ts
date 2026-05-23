import { Injectable } from '@angular/core';
import { dummyCatfishes } from '../../data/catfish/DummyData';

@Injectable({
  providedIn: 'root'
})
export class CatfishProfileService {

  getRandomProfiles(count: number = 25) {
    const shuffledArray = [...dummyCatfishes];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray.slice(0, count);
  }
}