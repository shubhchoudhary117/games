import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrazyMatkaWheelTimerComponent } from './crazy-matka-wheel-timer.component';

describe('CrazyMatkaWheelTimerComponent', () => {
  let component: CrazyMatkaWheelTimerComponent;
  let fixture: ComponentFixture<CrazyMatkaWheelTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrazyMatkaWheelTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrazyMatkaWheelTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
