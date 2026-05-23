import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatfishRulesModalComponent } from './catfish-rules-modal.component';

describe('CatfishRulesModalComponent', () => {
  let component: CatfishRulesModalComponent;
  let fixture: ComponentFixture<CatfishRulesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatfishRulesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatfishRulesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
