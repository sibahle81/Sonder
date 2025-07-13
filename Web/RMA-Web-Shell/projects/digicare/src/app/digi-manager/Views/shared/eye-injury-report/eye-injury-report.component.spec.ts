import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EyeInjuryReportComponent } from './eye-injury-report.component';

describe('EyeInjuryReportComponent', () => {
  let component: EyeInjuryReportComponent;
  let fixture: ComponentFixture<EyeInjuryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EyeInjuryReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EyeInjuryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
