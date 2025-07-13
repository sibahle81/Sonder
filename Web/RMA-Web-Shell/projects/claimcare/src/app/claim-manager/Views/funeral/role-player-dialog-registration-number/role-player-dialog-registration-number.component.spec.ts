import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RolePlayerDialogRegistrationNumberComponent } from './role-player-dialog-registration-number.component';

describe('RolePlayerDialogRegistrationNumberComponent', () => {
  let component: RolePlayerDialogRegistrationNumberComponent;
  let fixture: ComponentFixture<RolePlayerDialogRegistrationNumberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RolePlayerDialogRegistrationNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolePlayerDialogRegistrationNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
