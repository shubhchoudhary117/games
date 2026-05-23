import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxHtpModalComponent } from './dx-htp-modal.component';

describe('DxHtpModalComponent', () => {
  let component: DxHtpModalComponent;
  let fixture: ComponentFixture<DxHtpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxHtpModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DxHtpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
