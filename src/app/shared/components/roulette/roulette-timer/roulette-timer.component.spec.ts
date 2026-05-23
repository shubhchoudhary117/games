import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteTimerComponent } from './roulette-timer.component';

describe('RouletteTimerComponent', () => {
  let component: RouletteTimerComponent;
  let fixture: ComponentFixture<RouletteTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
