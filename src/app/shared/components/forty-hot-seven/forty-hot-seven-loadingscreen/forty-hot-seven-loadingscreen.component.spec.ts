import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FortyHotSevenLoadingscreenComponent } from './forty-hot-seven-loadingscreen.component';

describe('FortyHotSevenLoadingscreenComponent', () => {
  let component: FortyHotSevenLoadingscreenComponent;
  let fixture: ComponentFixture<FortyHotSevenLoadingscreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FortyHotSevenLoadingscreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FortyHotSevenLoadingscreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
