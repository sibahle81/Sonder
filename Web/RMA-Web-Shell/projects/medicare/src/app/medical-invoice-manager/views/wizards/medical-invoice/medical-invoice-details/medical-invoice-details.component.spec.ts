import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MedicalInvoiceDetailsComponent } from './medical-invoice-details.component';

describe('MedicalInvoiceDetailsComponent', () => {
  let component: MedicalInvoiceDetailsComponent;
  let fixture: ComponentFixture<MedicalInvoiceDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicalInvoiceDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalInvoiceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
