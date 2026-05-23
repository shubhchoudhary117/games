import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AviatorCanvasComponent } from './aviator-canvas.component';

describe('AviatorCanvasComponent', () => {
  let component: AviatorCanvasComponent;
  let fixture: ComponentFixture<AviatorCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AviatorCanvasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AviatorCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
