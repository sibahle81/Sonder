import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalReportHomeComponent } from './medical-report-home.component';

describe('MedicalReportHomeComponent', () => {
  let component: MedicalReportHomeComponent;
  let fixture: ComponentFixture<MedicalReportHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalReportHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalReportHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
