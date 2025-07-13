import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalInvoiceMenuComponent } from './medical-invoice-menu.component';

describe('MedicalInvoiceMenuComponent', () => {
  let component: MedicalInvoiceMenuComponent;
  let fixture: ComponentFixture<MedicalInvoiceMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalInvoiceMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalInvoiceMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
