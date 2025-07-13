import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';

@Component({
  selector: 'view-invoice-status',
  templateUrl: './view-invoice-status.component.html',
  styleUrls: ['./view-invoice-status.component.css']
})
export class ViewInvoiceStatusComponent implements OnChanges {

  @Input() invoiceNumber: string;

  @Output() invoiceEmit: EventEmitter<Invoice> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  invoice: Invoice;

  message: string;

  paid = InvoiceStatusEnum.Paid;

  constructor(
    private readonly invoiceService: InvoiceService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.getInvoice();
  }

  getInvoice() {
    this.message = null;

    this.invoiceService.getInvoiceByInvoiceNumber(this.invoiceNumber).subscribe(result => {
      if (result) {
        this.invoice = result;
        this.invoiceEmit.emit(this.invoice);
      }

      this.isLoading$.next(false);
    }, error => {
      this.message = 'error retrieving invoice status';
      this.isLoading$.next(false);
    });
  }

  getInvoiceStatus(invoiceStatus: number): string {
    return this.formatLookup(InvoiceStatusEnum[invoiceStatus]);
  }

  formatLookup(lookup: string) {
    return lookup?.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
