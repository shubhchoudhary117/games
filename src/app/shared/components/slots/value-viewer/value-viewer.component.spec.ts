import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueViewerComponent } from './value-viewer.component';

describe('ValueViewerComponent', () => {
  let component: ValueViewerComponent;
  let fixture: ComponentFixture<ValueViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValueViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
