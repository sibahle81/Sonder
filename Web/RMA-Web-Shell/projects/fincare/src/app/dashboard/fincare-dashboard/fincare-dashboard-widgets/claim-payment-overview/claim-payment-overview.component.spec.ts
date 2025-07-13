import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimPaymentOverviewComponent } from './claim-payment-overview.component';

describe('ClaimPaymentOverviewComponent', () => {
  let component: ClaimPaymentOverviewComponent;
  let fixture: ComponentFixture<ClaimPaymentOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimPaymentOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimPaymentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
