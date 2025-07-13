import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimRemittancesTransactionsReportComponent } from './claim-remittances-transactions-report.component';

describe('ClaimRemittancesTransactionsReportComponent', () => {
  let component: ClaimRemittancesTransactionsReportComponent;
  let fixture: ComponentFixture<ClaimRemittancesTransactionsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimRemittancesTransactionsReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimRemittancesTransactionsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
