import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DebitOrder } from 'projects/fincare/src/app/shared/models/debit-order';
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'app-debit-order-info-dialog',
  templateUrl: './debit-order-info-dialog.component.html',
  styleUrls: ['./debit-order-info-dialog.component.css'],
})
export class DebitOrderInfoDialogComponent  {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  information: string;

  selectedDebitOrder: DebitOrder;
  hyphenErrorCode: string;
  hyphenErrorMessage: string;
  hyphenDate: Date;
  bankAccountNumber: string;
  bankAccountType: string;
  branchCode: string;
  actionDate: Date;
  rMACode: string;
  missedPayments: string;

  constructor(
    public dialogRef: MatDialogRef<DebitOrderInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if(data.debitOrder) {
      this.selectedDebitOrder = data;
      this.hyphenErrorCode = data.debitOrder.hyphenErrorCode;
      this.hyphenErrorMessage = data.debitOrder.hyphenErrorMessage;
      this.hyphenDate = data.debitOrder.hyphenDate;
      this.bankAccountNumber = data.debitOrder.bankAccountNumber;
      this.bankAccountType = data.debitOrder.bankAccountType;
      this.branchCode = data.debitOrder.branchCode;
      this.actionDate = data.debitOrder.actionDate;
      this.rMACode = data.debitOrder.rMACode;
      this.missedPayments = data.debitOrder.missedPayments;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}


