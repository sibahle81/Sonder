import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestPaidSummaryReportComponent } from './interest-paid-summary-report.component';

describe('InterestPaidSummaryReportComponent', () => {
  let component: InterestPaidSummaryReportComponent;
  let fixture: ComponentFixture<InterestPaidSummaryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterestPaidSummaryReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestPaidSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
