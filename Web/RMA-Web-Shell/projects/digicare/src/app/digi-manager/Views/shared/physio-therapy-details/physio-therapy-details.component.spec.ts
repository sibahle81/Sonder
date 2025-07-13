import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhysioTherapyDetailsComponent } from './physio-therapy-details.component';

describe('PhysioTherapyDetailsComponent', () => {
  let component: PhysioTherapyDetailsComponent;
  let fixture: ComponentFixture<PhysioTherapyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhysioTherapyDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysioTherapyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
