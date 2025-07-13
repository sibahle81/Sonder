import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalInvoiceLinkedPreauthListComponent } from './medical-invoice-linked-preauth-list.component';

describe('MedicalInvoiceLinkedPreauthListComponent', () => {
  let component: MedicalInvoiceLinkedPreauthListComponent;
  let fixture: ComponentFixture<MedicalInvoiceLinkedPreauthListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalInvoiceLinkedPreauthListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalInvoiceLinkedPreauthListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
