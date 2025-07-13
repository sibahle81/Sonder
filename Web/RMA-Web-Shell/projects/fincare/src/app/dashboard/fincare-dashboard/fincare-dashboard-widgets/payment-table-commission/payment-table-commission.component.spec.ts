import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentTableCommissionComponent } from './payment-table-commission.component';

describe('PaymentTableDashboardComponent', () => {
  let component: PaymentTableCommissionComponent;
  let fixture: ComponentFixture<PaymentTableCommissionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTableCommissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTableCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
