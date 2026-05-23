import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigWinAlertComponent } from './big-win-alert.component';

describe('BigWinAlertComponent', () => {
  let component: BigWinAlertComponent;
  let fixture: ComponentFixture<BigWinAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigWinAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BigWinAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
