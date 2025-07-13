import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProstheticReviewReportComponent } from './prosthetic-review-report.component';

describe('ProstheticReviewReportComponent', () => {
  let component: ProstheticReviewReportComponent;
  let fixture: ComponentFixture<ProstheticReviewReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProstheticReviewReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProstheticReviewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
