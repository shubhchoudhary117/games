import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleGameRulesComponent } from './bubble-game-rules.component';

describe('BubbleGameRulesComponent', () => {
  let component: BubbleGameRulesComponent;
  let fixture: ComponentFixture<BubbleGameRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BubbleGameRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BubbleGameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
