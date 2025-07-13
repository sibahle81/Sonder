import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiologyReportComponent } from './radiology-report.component';

describe('RadiologyReportComponent', () => {
  let component: RadiologyReportComponent;
  let fixture: ComponentFixture<RadiologyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiologyReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiologyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
