import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrologicalReviewReportComponent } from './urological-review-report.component';

describe('UrologicalReviewReportComponent', () => {
  let component: UrologicalReviewReportComponent;
  let fixture: ComponentFixture<UrologicalReviewReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrologicalReviewReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrologicalReviewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
