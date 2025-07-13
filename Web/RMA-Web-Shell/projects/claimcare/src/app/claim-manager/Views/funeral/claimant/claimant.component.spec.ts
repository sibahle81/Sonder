import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClaimantComponent } from './claimant.component';

describe('ClaimantComponent', () => {
  let component: ClaimantComponent;
  let fixture: ComponentFixture<ClaimantComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});