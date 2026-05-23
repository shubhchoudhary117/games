import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubblesGameHeaderComponent } from './bubbles-game-header.component';

describe('BubblesGameHeaderComponent', () => {
  let component: BubblesGameHeaderComponent;
  let fixture: ComponentFixture<BubblesGameHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubblesGameHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubblesGameHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
