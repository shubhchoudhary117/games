import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotSpinBoardComponent } from './slot-spin-board.component';

describe('SlotSpinBoardComponent', () => {
  let component: SlotSpinBoardComponent;
  let fixture: ComponentFixture<SlotSpinBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotSpinBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotSpinBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
