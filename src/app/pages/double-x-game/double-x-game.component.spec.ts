import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubleXGameComponent } from './double-x-game.component';

describe('DoubleXGameComponent', () => {
  let component: DoubleXGameComponent;
  let fixture: ComponentFixture<DoubleXGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubleXGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoubleXGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
