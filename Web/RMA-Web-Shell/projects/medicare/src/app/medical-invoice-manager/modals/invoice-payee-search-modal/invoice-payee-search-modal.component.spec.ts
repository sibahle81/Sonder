import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePayeeSearchModalComponent } from './invoice-payee-search-modal.component';

describe('InvoicePayeeSearchModalComponent', () => {
  let component: InvoicePayeeSearchModalComponent;
  let fixture: ComponentFixture<InvoicePayeeSearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePayeeSearchModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicePayeeSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
