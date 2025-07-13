import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPaymentListDialogComponent } from './policy-payment-list-dialog.component';

describe('PolicyPaymentListDialogComponent', () => {
  let component: PolicyPaymentListDialogComponent;
  let fixture: ComponentFixture<PolicyPaymentListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyPaymentListDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyPaymentListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
