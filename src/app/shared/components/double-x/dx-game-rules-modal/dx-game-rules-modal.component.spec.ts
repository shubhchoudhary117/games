import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxGameRulesModalComponent } from './dx-game-rules-modal.component';

describe('DxGameRulesModalComponent', () => {
  let component: DxGameRulesModalComponent;
  let fixture: ComponentFixture<DxGameRulesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxGameRulesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DxGameRulesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
