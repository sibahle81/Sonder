import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserWizardReassignComponent } from './user-wizard-reassign.component';

describe('UserWizardReassignComponent', () => {
  let component: UserWizardReassignComponent;
  let fixture: ComponentFixture<UserWizardReassignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserWizardReassignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserWizardReassignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
