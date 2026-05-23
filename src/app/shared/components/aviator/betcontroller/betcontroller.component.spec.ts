import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetcontrollerComponent } from './betcontroller.component';

describe('BetcontrollerComponent', () => {
  let component: BetcontrollerComponent;
  let fixture: ComponentFixture<BetcontrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BetcontrollerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetcontrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
