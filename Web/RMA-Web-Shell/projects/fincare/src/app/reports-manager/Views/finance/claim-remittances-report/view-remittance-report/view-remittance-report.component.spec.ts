import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRemittanceReportComponent } from './view-remittance-report.component';

describe('ViewRemittanceReportComponent', () => {
  let component: ViewRemittanceReportComponent;
  let fixture: ComponentFixture<ViewRemittanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRemittanceReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRemittanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
