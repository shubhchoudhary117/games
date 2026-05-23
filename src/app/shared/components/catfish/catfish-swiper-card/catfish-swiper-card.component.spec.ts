import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatfishSwiperCardComponent } from './catfish-swiper-card.component';

describe('CatfishSwiperCardComponent', () => {
  let component: CatfishSwiperCardComponent;
  let fixture: ComponentFixture<CatfishSwiperCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatfishSwiperCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatfishSwiperCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
