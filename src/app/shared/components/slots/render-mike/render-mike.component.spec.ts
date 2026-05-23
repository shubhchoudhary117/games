import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderMikeComponent } from './render-mike.component';

describe('RenderMikeComponent', () => {
  let component: RenderMikeComponent;
  let fixture: ComponentFixture<RenderMikeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RenderMikeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenderMikeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
