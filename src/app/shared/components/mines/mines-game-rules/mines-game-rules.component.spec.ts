import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesGameRulesComponent } from './mines-game-rules.component';

describe('MinesGameRulesComponent', () => {
  let component: MinesGameRulesComponent;
  let fixture: ComponentFixture<MinesGameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinesGameRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinesGameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
