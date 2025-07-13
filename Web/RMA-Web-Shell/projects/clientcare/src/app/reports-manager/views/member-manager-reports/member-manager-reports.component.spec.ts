import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MemberManagerReportsComponent } from './member-manager-reports.component';

describe('MemberManagerReportsComponent', () => {
  let component: MemberManagerReportsComponent;
  let fixture: ComponentFixture<MemberManagerReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberManagerReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberManagerReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
