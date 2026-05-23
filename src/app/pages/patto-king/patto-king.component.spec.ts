import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PattoKingComponent } from './patto-king.component';

describe('PattoKingComponent', () => {
  let component: PattoKingComponent;
  let fixture: ComponentFixture<PattoKingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PattoKingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PattoKingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
