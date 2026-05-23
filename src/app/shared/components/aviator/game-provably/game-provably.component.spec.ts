import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameProvablyComponent } from './game-provably.component';

describe('GameProvablyComponent', () => {
  let component: GameProvablyComponent;
  let fixture: ComponentFixture<GameProvablyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameProvablyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameProvablyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
