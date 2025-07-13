import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberRenewalLetterAuditComponent } from './member-renewal-letter-audit.component';

describe('MemberRenewalLetterAuditComponent', () => {
  let component: MemberRenewalLetterAuditComponent;
  let fixture: ComponentFixture<MemberRenewalLetterAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberRenewalLetterAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberRenewalLetterAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
