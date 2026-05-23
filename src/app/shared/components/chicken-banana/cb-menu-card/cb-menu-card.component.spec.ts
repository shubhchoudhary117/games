import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbMenuCardComponent } from './cb-menu-card.component';

describe('CbMenuCardComponent', () => {
  let component: CbMenuCardComponent;
  let fixture: ComponentFixture<CbMenuCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CbMenuCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CbMenuCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
