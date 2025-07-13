import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReviewHospitalVisitComponent } from './review-hospital-visit.component';

describe('ReviewHospitalVisitComponent', () => {
  let component: ReviewHospitalVisitComponent;
  let fixture: ComponentFixture<ReviewHospitalVisitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewHospitalVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewHospitalVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
