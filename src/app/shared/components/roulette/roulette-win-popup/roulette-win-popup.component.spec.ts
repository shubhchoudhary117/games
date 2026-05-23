import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteWinPopupComponent } from './roulette-win-popup.component';

describe('RouletteWinPopupComponent', () => {
  let component: RouletteWinPopupComponent;
  let fixture: ComponentFixture<RouletteWinPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteWinPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteWinPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
