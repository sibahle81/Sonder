import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnclaimedBenefitManagerDetailsComponent } from './unclaimed-benefit-manager-details.component';

describe('UnclaimedBenefitManagerDetailsComponent', () => {
  let component: UnclaimedBenefitManagerDetailsComponent;
  let fixture: ComponentFixture<UnclaimedBenefitManagerDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnclaimedBenefitManagerDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedBenefitManagerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
