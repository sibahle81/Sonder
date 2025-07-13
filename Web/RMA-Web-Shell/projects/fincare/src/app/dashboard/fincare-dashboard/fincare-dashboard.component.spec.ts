import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FincareDashboardComponent } from './fincare-dashboard.component';

describe('FincareDashboardComponent', () => {
  let component: FincareDashboardComponent;
  let fixture: ComponentFixture<FincareDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FincareDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FincareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
