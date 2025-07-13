import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestCalculationReportComponent } from './interest-calculation-report.component';

describe('InterestCalculationReportComponent', () => {
  let component: InterestCalculationReportComponent;
  let fixture: ComponentFixture<InterestCalculationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterestCalculationReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestCalculationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
