import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LimboGameComponent } from './limbo-game.component';

describe('LimboGameComponent', () => {
  let component: LimboGameComponent;
  let fixture: ComponentFixture<LimboGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LimboGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LimboGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
