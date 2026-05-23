import { TestBed } from '@angular/core/testing';

import { GameProvablyService } from './game-provably.service';

describe('GameProvablyService', () => {
  let service: GameProvablyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameProvablyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
