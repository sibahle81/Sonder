import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MedicalPractitionerComponent } from './medical-practitioner.component';

describe('MedicalPractitionerComponent', () => {
  let component: MedicalPractitionerComponent;
  let fixture: ComponentFixture<MedicalPractitionerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicalPractitionerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});