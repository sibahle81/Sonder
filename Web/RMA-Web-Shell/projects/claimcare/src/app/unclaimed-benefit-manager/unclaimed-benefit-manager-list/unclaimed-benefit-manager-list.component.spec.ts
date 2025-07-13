import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UnclaimedBenefitManagerListComponent } from './unclaimed-benefit-manager-list.component';

describe('UnclaimedBenefitManagerListComponent', () => {
  let component: UnclaimedBenefitManagerListComponent;
  let fixture: ComponentFixture<UnclaimedBenefitManagerListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UnclaimedBenefitManagerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnclaimedBenefitManagerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
