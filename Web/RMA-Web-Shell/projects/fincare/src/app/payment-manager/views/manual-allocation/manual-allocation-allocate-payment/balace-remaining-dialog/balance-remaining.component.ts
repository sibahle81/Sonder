import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManualAllocationAllocatePaymentComponent } from '../manual-allocation-allocate-payment.component';

@Component({
  selector: 'balance-remaining',
  templateUrl: './balance-remaining.component.html'
})
export class BalanceRemainingComponent {

  balance: number;
  leaveBalanceInSuspenceAccount: any;
  canSubmit = false;

  constructor(
    public dialogRef: MatDialogRef<ManualAllocationAllocatePaymentComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.balance = data.balance as number;
  }

  toggle(event$: string) {
    this.leaveBalanceInSuspenceAccount = event$ === 'suspense' ? true : false;
    this.canSubmit = true;
  }

  submit() {
    const data = {
      leaveBalanceInSuspenceAccount: this.leaveBalanceInSuspenceAccount,
    };

    this.dialogRef.close(data);
  }

  close() {
    this.dialogRef.close(null);
  }
}
