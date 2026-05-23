import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatfishImageComponent } from './catfish-image.component';

describe('CatfishImageComponent', () => {
  let component: CatfishImageComponent;
  let fixture: ComponentFixture<CatfishImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatfishImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatfishImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
