import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KenoGameComponent } from './keno-game.component';

describe('KenoGameComponent', () => {
  let component: KenoGameComponent;
  let fixture: ComponentFixture<KenoGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KenoGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KenoGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
