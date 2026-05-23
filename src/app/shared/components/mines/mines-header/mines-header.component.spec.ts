import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesHeaderComponent } from './mines-header.component';

describe('MinesHeaderComponent', () => {
  let component: MinesHeaderComponent;
  let fixture: ComponentFixture<MinesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinesHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
