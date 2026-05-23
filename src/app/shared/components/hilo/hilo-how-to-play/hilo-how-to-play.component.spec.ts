import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiloHowToPlayComponent } from './hilo-how-to-play.component';

describe('HiloHowToPlayComponent', () => {
  let component: HiloHowToPlayComponent;
  let fixture: ComponentFixture<HiloHowToPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiloHowToPlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiloHowToPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
