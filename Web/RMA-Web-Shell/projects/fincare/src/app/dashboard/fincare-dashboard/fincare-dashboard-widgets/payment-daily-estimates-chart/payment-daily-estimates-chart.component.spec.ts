import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentDailyEstimatesChartComponent } from './payment-daily-estimates-chart.component';

describe('PaymentDailyEstimatesChartComponent', () => {
  let component: PaymentDailyEstimatesChartComponent;
  let fixture: ComponentFixture<PaymentDailyEstimatesChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDailyEstimatesChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDailyEstimatesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
