import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendMemberRenewalLetterComponent } from './resend-member-renewal-letter.component';

describe('ResendMemberRenewalLetterComponent', () => {
  let component: ResendMemberRenewalLetterComponent;
  let fixture: ComponentFixture<ResendMemberRenewalLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResendMemberRenewalLetterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResendMemberRenewalLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
