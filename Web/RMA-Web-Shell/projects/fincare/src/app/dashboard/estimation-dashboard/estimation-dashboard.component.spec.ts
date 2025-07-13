import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EstimationDashboardComponent } from './estimation-dashboard.component';

describe('EstimationDashboardComponent', () => {
  let component: EstimationDashboardComponent;
  let fixture: ComponentFixture<EstimationDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EstimationDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstimationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
