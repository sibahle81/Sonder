import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalReportsManagerComponent } from './medical-reports-manager.component';

describe('MedicalReportHomeComponent', () => {
  let component: MedicalReportsManagerComponent;
  let fixture: ComponentFixture<MedicalReportsManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalReportsManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalReportsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
