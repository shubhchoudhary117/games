import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxBetHistoryComponent } from './dx-bet-history.component';

describe('DxBetHistoryComponent', () => {
  let component: DxBetHistoryComponent;
  let fixture: ComponentFixture<DxBetHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxBetHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DxBetHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
