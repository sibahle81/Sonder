import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpQueryInvoiceComponent } from './hcp-query-invoice.component';

describe('HcpQueryInvoiceComponent', () => {
  let component: HcpQueryInvoiceComponent;
  let fixture: ComponentFixture<HcpQueryInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcpQueryInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HcpQueryInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
