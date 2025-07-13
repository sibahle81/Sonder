import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitUploadComponent } from './benefit-upload.component';

describe('BenefitUploadComponent', () => {
  let component: BenefitUploadComponent;
  let fixture: ComponentFixture<BenefitUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenefitUploadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenefitUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
