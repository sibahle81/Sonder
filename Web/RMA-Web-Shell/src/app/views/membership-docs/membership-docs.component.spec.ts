import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MembershipDocsComponent } from './membership-docs.component';

describe('MembershipDocsComponent', () => {
  let component: MembershipDocsComponent;
  let fixture: ComponentFixture<MembershipDocsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MembershipDocsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
