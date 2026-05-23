import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FortyHotSeventControlsComponent } from './forty-hot-sevent-controls.component';

describe('FortyHotSeventControlsComponent', () => {
  let component: FortyHotSeventControlsComponent;
  let fixture: ComponentFixture<FortyHotSeventControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FortyHotSeventControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FortyHotSeventControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
