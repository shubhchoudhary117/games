import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotlineHowToPlayComponent } from './hotline-how-to-play.component';

describe('HotlineHowToPlayComponent', () => {
  let component: HotlineHowToPlayComponent;
  let fixture: ComponentFixture<HotlineHowToPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotlineHowToPlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotlineHowToPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
