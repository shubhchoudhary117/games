import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbBethistoryComponent } from './cb-bethistory.component';

describe('CbBethistoryComponent', () => {
  let component: CbBethistoryComponent;
  let fixture: ComponentFixture<CbBethistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CbBethistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CbBethistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
