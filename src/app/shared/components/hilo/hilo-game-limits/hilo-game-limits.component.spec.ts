import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiloGameLimitsComponent } from './hilo-game-limits.component';

describe('HiloGameLimitsComponent', () => {
  let component: HiloGameLimitsComponent;
  let fixture: ComponentFixture<HiloGameLimitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiloGameLimitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiloGameLimitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
