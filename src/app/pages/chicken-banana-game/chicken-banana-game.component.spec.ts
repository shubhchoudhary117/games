import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChickenBananaGameComponent } from './chicken-banana-game.component';

describe('ChickenBananaGameComponent', () => {
  let component: ChickenBananaGameComponent;
  let fixture: ComponentFixture<ChickenBananaGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChickenBananaGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChickenBananaGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
