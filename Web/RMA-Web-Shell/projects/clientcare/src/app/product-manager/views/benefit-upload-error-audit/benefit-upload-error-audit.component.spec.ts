import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitUploadErrorAuditComponent } from './benefit-upload-error-audit.component';

describe('BenefitUploadErrorAuditComponent', () => {
  let component: BenefitUploadErrorAuditComponent;
  let fixture: ComponentFixture<BenefitUploadErrorAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenefitUploadErrorAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenefitUploadErrorAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
