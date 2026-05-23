import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinesBethistoryComponent } from './mines-bethistory.component';

describe('MinesBethistoryComponent', () => {
  let component: MinesBethistoryComponent;
  let fixture: ComponentFixture<MinesBethistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinesBethistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinesBethistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
