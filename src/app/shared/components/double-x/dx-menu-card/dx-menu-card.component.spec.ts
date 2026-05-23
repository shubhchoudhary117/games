import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DxMenuCardComponent } from './dx-menu-card.component';

describe('DxMenuCardComponent', () => {
  let component: DxMenuCardComponent;
  let fixture: ComponentFixture<DxMenuCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxMenuCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DxMenuCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
