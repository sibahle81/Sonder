import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TreatingDoctorPreauthComponent } from 'projects/medicare/src/app/medi-manager/views/shared/treating-doctor-preauth/treating-doctor-preauth.component';

describe('TreatingDoctorPreauthComponent', () => {
  let component: TreatingDoctorPreauthComponent;
  let fixture: ComponentFixture<TreatingDoctorPreauthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TreatingDoctorPreauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatingDoctorPreauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
