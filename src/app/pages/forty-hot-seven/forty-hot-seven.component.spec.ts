import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FortyHotSevenComponent } from './forty-hot-seven.component';

describe('FortyHotSevenComponent', () => {
  let component: FortyHotSevenComponent;
  let fixture: ComponentFixture<FortyHotSevenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FortyHotSevenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FortyHotSevenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
