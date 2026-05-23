import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbGameRulesModalComponent } from './cb-game-rules-modal.component';

describe('CbGameRulesModalComponent', () => {
  let component: CbGameRulesModalComponent;
  let fixture: ComponentFixture<CbGameRulesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CbGameRulesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CbGameRulesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
