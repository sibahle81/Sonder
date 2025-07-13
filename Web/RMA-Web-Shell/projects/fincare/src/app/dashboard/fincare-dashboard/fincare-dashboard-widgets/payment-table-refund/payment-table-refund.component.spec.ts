import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentTableRefundComponent } from './payment-table-refund.component';

describe('PaymentTableDashboardComponent', () => {
  let component: PaymentTableRefundComponent;
  let fixture: ComponentFixture<PaymentTableRefundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTableRefundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTableRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
