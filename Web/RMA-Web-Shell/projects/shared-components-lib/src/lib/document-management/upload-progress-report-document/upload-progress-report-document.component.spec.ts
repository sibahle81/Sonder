import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadProgressReportDocumentComponent } from './upload-progress-report-document.component';

describe('UploadProgressReportDocumentComponent', () => {
  let component: UploadProgressReportDocumentComponent;
  let fixture: ComponentFixture<UploadProgressReportDocumentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadProgressReportDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadProgressReportDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
