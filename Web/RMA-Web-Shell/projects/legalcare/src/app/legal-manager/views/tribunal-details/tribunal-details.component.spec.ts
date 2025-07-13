import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TribunalDetailsComponent } from './tribunal-details.component';

describe('TribunalDetailsComponent', () => {
  let component: TribunalDetailsComponent;
  let fixture: ComponentFixture<TribunalDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TribunalDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TribunalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
