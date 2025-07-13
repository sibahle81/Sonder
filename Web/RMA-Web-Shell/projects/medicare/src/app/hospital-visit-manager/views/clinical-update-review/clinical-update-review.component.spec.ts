import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClinicalUpdateReviewComponent } from './clinical-update-review.component';

describe('ClinicalUpdateReviewComponent', () => {
  let component: ClinicalUpdateReviewComponent;
  let fixture: ComponentFixture<ClinicalUpdateReviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicalUpdateReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalUpdateReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
