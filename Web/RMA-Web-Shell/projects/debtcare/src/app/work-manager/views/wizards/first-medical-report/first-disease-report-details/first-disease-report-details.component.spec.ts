import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstDiseaseReportDetailsComponent } from './first-disease-report-details.component';

describe('FirstDiseaseReportDetailsComponent', () => {
  let component: FirstDiseaseReportDetailsComponent;
  let fixture: ComponentFixture<FirstDiseaseReportDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstDiseaseReportDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstDiseaseReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
