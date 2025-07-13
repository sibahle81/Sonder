import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TracerListComponent } from '../tracer-list.component';
import { UntypedFormGroup, FormBuilder } from '@angular/forms';
import { ClaimTracerInvoice } from '../../../shared/entities/ClaimTracerInvoice';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';

@Component({
  selector: 'trace-invoice',
  templateUrl: './trace-invoice.component.html'
})
export class TraceInvoiceComponent implements OnInit {

  form: UntypedFormGroup;
  formIsValid = false;
  paymentStatusEnum = PaymentStatusEnum;
  invoiceList: ClaimTracerInvoice[] = [];
  displayTracerColumns = ['createdDate','paymentStatus','tracingFee' ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ClaimTracerInvoice[],
    public dialogRef: MatDialogRef<TracerListComponent>) { }


  ngOnInit() {
    this.invoiceList = this.data;
  }

  close() {
    this.dialogRef.close(null);
  }
}
