import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrazyMatkaWheelComponent } from './crazy-matka-wheel.component';

describe('CrazyMatkaWheelComponent', () => {
  let component: CrazyMatkaWheelComponent;
  let fixture: ComponentFixture<CrazyMatkaWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrazyMatkaWheelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrazyMatkaWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
