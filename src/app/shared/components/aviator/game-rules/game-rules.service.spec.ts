import { TestBed } from '@angular/core/testing';

import { GameRulesService } from './game-rules.service';

describe('GameRulesService', () => {
  let service: GameRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
