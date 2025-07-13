import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocatePaymentToPolicyComponent } from './allocate-payment-to-policy.component';

describe('AllocatePaymentToPolicyComponent', () => {
  let component: AllocatePaymentToPolicyComponent;
  let fixture: ComponentFixture<AllocatePaymentToPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllocatePaymentToPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllocatePaymentToPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
