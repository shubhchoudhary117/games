import { TestBed } from '@angular/core/testing';

import { RoundInfoService } from './round-info.service';

describe('RoundInfoService', () => {
  let service: RoundInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoundInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
