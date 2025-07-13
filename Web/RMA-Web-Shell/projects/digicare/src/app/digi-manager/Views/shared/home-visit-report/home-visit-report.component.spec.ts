import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeVisitReportComponent } from './home-visit-report.component';

describe('HomeVisitReportComponent', () => {
  let component: HomeVisitReportComponent;
  let fixture: ComponentFixture<HomeVisitReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeVisitReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeVisitReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
