import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreauthReviewComponent } from './preauth-review.component';

describe('PreauthReviewComponent', () => {
  let component: PreauthReviewComponent;
  let fixture: ComponentFixture<PreauthReviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreauthReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreauthReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
