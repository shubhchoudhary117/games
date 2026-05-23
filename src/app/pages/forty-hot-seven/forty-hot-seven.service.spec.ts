import { TestBed } from '@angular/core/testing';

import { FortyHotSevenService } from './forty-hot-seven.service';

describe('FortyHotSevenService', () => {
  let service: FortyHotSevenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FortyHotSevenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
