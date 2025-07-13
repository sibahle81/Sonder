import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolicyBillingTransaction } from '../../../models/policy-billing-transactions';

@Component({
  templateUrl: './policy-payment-list-dialog.component.html',
  styleUrls: ['./policy-payment-list-dialog.component.css']
})
export class PolicyPaymentListDialogComponent {
  canClose = true;
  policy: PolicyBillingTransaction = null;
  constructor(
    public dialogRef: MatDialogRef<PolicyPaymentListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.policy = data.policyTransactions;
  }
  
  close(): void {
    if (!this.canClose) {
      return;
    }
    this.dialogRef.close(null);
  }

  onBusyProcessing(processing: boolean): void {
    this.canClose = !processing;

  }

  onPaymentReversed(reversed: boolean): void {
    this.dialogRef.close(reversed);
  }
}
