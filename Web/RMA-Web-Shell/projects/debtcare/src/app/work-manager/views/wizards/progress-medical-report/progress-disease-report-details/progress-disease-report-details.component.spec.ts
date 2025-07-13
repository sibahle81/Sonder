import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressDiseaseReportDetailsComponent } from './progress-disease-report-details.component';

describe('ProgressDiseaseReportDetailsComponent', () => {
  let component: ProgressDiseaseReportDetailsComponent;
  let fixture: ComponentFixture<ProgressDiseaseReportDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressDiseaseReportDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressDiseaseReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
