import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstDiseaseReportOccupationImpactDetailsComponent } from './first-disease-report-occupation-impact-details.component';

describe('FirstDiseaseReportWorkDetailsComponent', () => {
  let component: FirstDiseaseReportOccupationImpactDetailsComponent;
  let fixture: ComponentFixture<FirstDiseaseReportOccupationImpactDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstDiseaseReportOccupationImpactDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstDiseaseReportOccupationImpactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
