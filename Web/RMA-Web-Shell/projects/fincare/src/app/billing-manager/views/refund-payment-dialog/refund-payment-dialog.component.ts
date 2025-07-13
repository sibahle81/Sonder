import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Payment } from '../../../shared/models/payment.model';

@Component({
  selector: 'app-refund-payment-dialog',
  templateUrl: './refund-payment-dialog.component.html',
  styleUrls: ['./refund-payment-dialog.component.css']
})
export class RefundPaymentDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<RefundPaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Payment) {}

  onNoClick(): void {
    this.dialogRef.close(null);
  }
}
