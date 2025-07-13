import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstDiseaseReportPtsdDetailsComponent } from './first-disease-report-ptsd-details.component';

describe('FirstDiseaseReportPtsdDetailsComponent', () => {
  let component: FirstDiseaseReportPtsdDetailsComponent;
  let fixture: ComponentFixture<FirstDiseaseReportPtsdDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirstDiseaseReportPtsdDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstDiseaseReportPtsdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
