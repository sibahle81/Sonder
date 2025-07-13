import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterPolicyDebtorTransfersComponent } from './inter-policy-debtor-transfers.component';

describe('InterPolicyDebtorTransfersComponent', () => {
  let component: InterPolicyDebtorTransfersComponent;
  let fixture: ComponentFixture<InterPolicyDebtorTransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterPolicyDebtorTransfersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterPolicyDebtorTransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
