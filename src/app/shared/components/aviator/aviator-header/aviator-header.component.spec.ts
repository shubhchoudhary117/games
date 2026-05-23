import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AviatorHeaderComponent } from './aviator-header.component';

describe('AviatorHeaderComponent', () => {
  let component: AviatorHeaderComponent;
  let fixture: ComponentFixture<AviatorHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AviatorHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AviatorHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
