import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyPaymentListComponent } from './policy-payment-list.component';

describe('PolicyPaymentListComponent', () => {
  let component: PolicyPaymentListComponent;
  let fixture: ComponentFixture<PolicyPaymentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolicyPaymentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
