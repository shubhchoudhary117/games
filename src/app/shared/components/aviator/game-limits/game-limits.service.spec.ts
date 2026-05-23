import { TestBed } from '@angular/core/testing';

import { GameLimitsService } from './game-limits.service';

describe('GameLimitsService', () => {
  let service: GameLimitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameLimitsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
