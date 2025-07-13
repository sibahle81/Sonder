import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { ValidationStateEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/validation-state-enum';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';

@Component({
  selector: 'lib-view-medical-invoices',
  templateUrl: './view-medical-invoices.component.html',
  styleUrls: ['./view-medical-invoices.component.css']
})
export class ViewMedicalInvoicesComponent implements OnInit {
  @Input() invoiceData: InvoiceDetails;

  @Output() emitClose: EventEmitter<boolean> = new EventEmitter();

  invoiceStatusEnum: typeof InvoiceStatusEnum = InvoiceStatusEnum;
  public validationStateEnum: typeof ValidationStateEnum = ValidationStateEnum;
  public payeeTypeEnum: typeof PayeeTypeEnum = PayeeTypeEnum;
  constructor() { }

  ngOnInit(): void {
    console.log(this.invoiceData);
  }

  getInvoicePaidDays(dateSubmitted: Date, paymentConfirmationDate: Date) {
    if (dateSubmitted == null || paymentConfirmationDate == null)
      return "";
    let paidDays = this.getDays(dateSubmitted, paymentConfirmationDate);
    return paidDays;
  }

  getDays(dateSubmitted: Date, paymentConfirmationDate: Date): number {
    dateSubmitted = new Date(dateSubmitted);
    paymentConfirmationDate = new Date(paymentConfirmationDate);
    let days = Math.floor((paymentConfirmationDate.getTime() - dateSubmitted.getTime()) / 1000 / 60 / 60 / 24);
    return days;
  }

  close() {
    this.emitClose.emit(true);
  }
}
