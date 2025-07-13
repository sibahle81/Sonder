import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDebtorReconReportComponent } from './claim-debtor-recon-report.component';

describe('ClaimDebtorReconReportComponent', () => {
  let component: ClaimDebtorReconReportComponent;
  let fixture: ComponentFixture<ClaimDebtorReconReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimDebtorReconReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimDebtorReconReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
