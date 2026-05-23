import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotColumnComponent } from './slot-column.component';

describe('SlotColumnComponent', () => {
  let component: SlotColumnComponent;
  let fixture: ComponentFixture<SlotColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotColumnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
