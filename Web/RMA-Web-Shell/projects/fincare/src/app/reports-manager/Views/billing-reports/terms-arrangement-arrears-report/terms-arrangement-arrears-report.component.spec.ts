import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TermsArrangementArrearsReportComponent } from './terms-arrangement-arrears-report.component';

describe('TermsArrangementArrearsReportComponent', () => {
  let component: TermsArrangementArrearsReportComponent;
  let fixture: ComponentFixture<TermsArrangementArrearsReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsArrangementArrearsReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsArrangementArrearsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
