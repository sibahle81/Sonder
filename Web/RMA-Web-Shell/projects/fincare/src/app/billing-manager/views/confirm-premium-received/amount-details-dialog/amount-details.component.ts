import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConfirmPremiumReceivedComponent } from '../confirm-premium-received.component';

@Component({
  selector: 'amount-details',
  templateUrl: './amount-details.component.html'
})
export class AmountDetailsComponent implements OnInit {

  form: UntypedFormGroup;
  formIsValid = false;
  policyNumber: string;
  expectedAmount: string;
  lapseCount: string;
  balance: number;
  message = '';
  undoCheck: boolean;

  constructor(
    public dialogRef: MatDialogRef<ConfirmPremiumReceivedComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private readonly formBuilder: UntypedFormBuilder) {
    this.policyNumber = data.policyNumber;
    this.expectedAmount = data.expectedAmount;
    this.lapseCount = data.lapseCount;
    this.balance = data.balance as number;
    this.undoCheck = data.undoCheck;
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    if (this.undoCheck) { return; }
    this.form = this.formBuilder.group({
      amount: ['', Validators.required],
    });
  }

  onClick() {
    this.message = '';
    const currentAction = this.undoCheck ? 'undo' : 'select';
    let actualAmount = 0;

    if (currentAction === 'select') {
      actualAmount = this.form.controls.amount.value as number;

      if (this.balance - actualAmount < 0) {
        this.message = `Maximum remaining balance allowed is ${this.balance.toFixed(2)}`;
        return;
      }
    }

    const data = {
      action: currentAction,
      amount: actualAmount,
      balance: this.balance - actualAmount
    };

    this.dialogRef.close(data);
  }

  close() {
    this.dialogRef.close(null);
  }
}
