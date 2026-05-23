import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotsResultPopupComponent } from './slots-result-popup.component';

describe('SlotsResultPopupComponent', () => {
  let component: SlotsResultPopupComponent;
  let fixture: ComponentFixture<SlotsResultPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotsResultPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotsResultPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
