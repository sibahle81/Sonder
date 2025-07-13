import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentDailyEstimatesComponent } from './payment-daily-estimates.component';

describe('PaymentDailyEstimatesComponent', () => {
  let component: PaymentDailyEstimatesComponent;
  let fixture: ComponentFixture<PaymentDailyEstimatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentDailyEstimatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentDailyEstimatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
