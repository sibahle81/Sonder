import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewHospitalVisitComponent } from './view-hospital-visit.component';

describe('ViewHospitalVisitComponent', () => {
  let component: ViewHospitalVisitComponent;
  let fixture: ComponentFixture<ViewHospitalVisitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHospitalVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHospitalVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
