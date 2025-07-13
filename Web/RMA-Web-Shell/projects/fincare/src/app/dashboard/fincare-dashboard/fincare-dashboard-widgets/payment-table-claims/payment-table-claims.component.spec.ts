import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PaymentTableClaimsComponent } from './payment-table-claims.component';

describe('PaymentTableClaimsComponent', () => {
  let component: PaymentTableClaimsComponent;
  let fixture: ComponentFixture<PaymentTableClaimsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentTableClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentTableClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
