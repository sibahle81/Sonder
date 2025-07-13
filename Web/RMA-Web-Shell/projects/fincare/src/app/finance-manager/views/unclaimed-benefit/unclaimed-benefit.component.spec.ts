import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnclaimedBenefitComponent } from './unclaimed-benefit.component';

describe('UnclaimedBenefitComponent', () => {
  let component: UnclaimedBenefitComponent;
  let fixture: ComponentFixture<UnclaimedBenefitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnclaimedBenefitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
