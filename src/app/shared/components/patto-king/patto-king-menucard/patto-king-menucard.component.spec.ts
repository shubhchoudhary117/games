import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PattoKingMenucardComponent } from './patto-king-menucard.component';

describe('PattoKingMenucardComponent', () => {
  let component: PattoKingMenucardComponent;
  let fixture: ComponentFixture<PattoKingMenucardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PattoKingMenucardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PattoKingMenucardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
