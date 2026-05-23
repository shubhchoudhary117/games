import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KenoHowToPlayComponent } from './keno-how-to-play.component';

describe('KenoHowToPlayComponent', () => {
  let component: KenoHowToPlayComponent;
  let fixture: ComponentFixture<KenoHowToPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KenoHowToPlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KenoHowToPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
