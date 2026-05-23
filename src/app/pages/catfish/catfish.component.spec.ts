import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatfishComponent } from './catfish.component';

describe('CatfishComponent', () => {
  let component: CatfishComponent;
  let fixture: ComponentFixture<CatfishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatfishComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatfishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
