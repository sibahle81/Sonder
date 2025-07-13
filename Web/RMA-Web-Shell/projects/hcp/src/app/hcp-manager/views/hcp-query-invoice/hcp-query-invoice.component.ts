import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';

@Component({
  selector: 'hcp-query-invoice',
  templateUrl: './hcp-query-invoice.component.html',
  styleUrls: ['./hcp-query-invoice.component.css']
})
export class HcpQueryInvoiceComponent implements OnChanges{
  @Input() rolePlayerId: number = null;

  selectedInvoices: InvoiceDetails[] = [];
  toggleDeselect: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedInvoices = [];
  }

  invoiceSelected($event: InvoiceDetails[]): void {
    this.selectedInvoices = $event;
  }

  logQueryDone($event: boolean): void {
    this.toggleDeselect = !this.toggleDeselect;
  }

  haveSelectedInvoice():boolean {
    if(!this.selectedInvoices){
      return false;
    }
    if(this.selectedInvoices.length == 0)
    {
      return false;
    }
    return true;
  }  
}
