import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimRemittancesReportComponent } from './claim-remittances-report.component';

describe('ClaimRemittancesReportComponent', () => {
  let component: ClaimRemittancesReportComponent;
  let fixture: ComponentFixture<ClaimRemittancesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClaimRemittancesReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimRemittancesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
