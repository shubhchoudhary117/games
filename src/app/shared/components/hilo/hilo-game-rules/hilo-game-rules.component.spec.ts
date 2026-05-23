import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiloGameRulesComponent } from './hilo-game-rules.component';

describe('HiloGameRulesComponent', () => {
  let component: HiloGameRulesComponent;
  let fixture: ComponentFixture<HiloGameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiloGameRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiloGameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
