import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbHtpModalComponent } from './cb-htp-modal.component';

describe('CbHtpModalComponent', () => {
  let component: CbHtpModalComponent;
  let fixture: ComponentFixture<CbHtpModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CbHtpModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CbHtpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
