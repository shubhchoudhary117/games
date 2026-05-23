import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLimitsComponent } from './game-limits.component';

describe('GameLimitsComponent', () => {
  let component: GameLimitsComponent;
  let fixture: ComponentFixture<GameLimitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLimitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
