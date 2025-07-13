import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClinicalUpdateBreakdownViewComponent } from './clinical-update-breakdown-view.component';

describe('ClinicalUpdateBreakdownViewComponent', () => {
  let component: ClinicalUpdateBreakdownViewComponent;
  let fixture: ComponentFixture<ClinicalUpdateBreakdownViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicalUpdateBreakdownViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalUpdateBreakdownViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
