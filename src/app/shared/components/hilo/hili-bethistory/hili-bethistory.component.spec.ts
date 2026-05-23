import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiliBethistoryComponent } from './hili-bethistory.component';

describe('HiliBethistoryComponent', () => {
  let component: HiliBethistoryComponent;
  let fixture: ComponentFixture<HiliBethistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiliBethistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiliBethistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
