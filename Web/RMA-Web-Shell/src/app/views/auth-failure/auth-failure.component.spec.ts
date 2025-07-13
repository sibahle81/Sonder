import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthFailureComponent } from './auth-failure.component';

describe('AuthFailureComponent', () => {
  let component: AuthFailureComponent;
  let fixture: ComponentFixture<AuthFailureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthFailureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});