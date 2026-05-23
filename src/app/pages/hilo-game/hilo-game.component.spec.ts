import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HiloGameComponent } from './hilo-game.component';

describe('HiloGameComponent', () => {
  let component: HiloGameComponent;
  let fixture: ComponentFixture<HiloGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HiloGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HiloGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
