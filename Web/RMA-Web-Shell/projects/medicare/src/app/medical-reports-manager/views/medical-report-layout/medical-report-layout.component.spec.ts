import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalReportLayoutComponent } from './medical-report-layout.component';

describe('MedicalReportLayoutComponent', () => {
  let component: MedicalReportLayoutComponent;
  let fixture: ComponentFixture<MedicalReportLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalReportLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalReportLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
