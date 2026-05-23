import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrazyMatkaComponent } from './crazy-matka.component';

describe('CrazyMatkaComponent', () => {
  let component: CrazyMatkaComponent;
  let fixture: ComponentFixture<CrazyMatkaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrazyMatkaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrazyMatkaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
