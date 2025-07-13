import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalDiseaseReportDetailsComponent } from './final-disease-report-details.component';

describe('FinalDiseaseReportDetailsComponent', () => {
  let component: FinalDiseaseReportDetailsComponent;
  let fixture: ComponentFixture<FinalDiseaseReportDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalDiseaseReportDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalDiseaseReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
