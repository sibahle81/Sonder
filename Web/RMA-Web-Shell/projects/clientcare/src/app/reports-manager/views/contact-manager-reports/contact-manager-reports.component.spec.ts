import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactManagerReportsComponent } from './contact-manager-reports.component';

describe('ContactManagerReportsComponent', () => {
  let component: ContactManagerReportsComponent;
  let fixture: ComponentFixture<ContactManagerReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactManagerReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactManagerReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
