import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForyHotSevenGridComponent } from './fory-hot-seven-grid.component';

describe('ForyHotSevenGridComponent', () => {
  let component: ForyHotSevenGridComponent;
  let fixture: ComponentFixture<ForyHotSevenGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForyHotSevenGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForyHotSevenGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
