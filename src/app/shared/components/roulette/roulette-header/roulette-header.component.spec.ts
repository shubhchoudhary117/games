import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteHeaderComponent } from './roulette-header.component';

describe('RouletteHeaderComponent', () => {
  let component: RouletteHeaderComponent;
  let fixture: ComponentFixture<RouletteHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
