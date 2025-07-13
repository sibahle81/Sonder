import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdjustmentDirection } from '../../../shared/enum/adjustment-direction.enum';
import { BehaviorSubject } from 'rxjs';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';

@Component({
  selector: 'app-adjustment-amount-dialog',
  templateUrl: './adjustment-amount-dialog.component.html',
  styleUrls: ['./adjustment-amount-dialog.component.css']
})
export class AdjustmentAmountDialogComponent implements OnInit {

  calculatedTotal$ = new BehaviorSubject<number>(0);
  adjustmentDirection: AdjustmentDirection;
  form: UntypedFormGroup;
  labelMessage = '';
  labelType = '';
  originalAmount: number;
  periodStatus: PeriodStatusEnum;
  labelMessageError = '';
  showSubmit = true;
  constructor(public dialogRef: MatDialogRef<AdjustmentAmountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.adjustmentDirection = data.direction;
    this.originalAmount = data.originalAmount;
    this.periodStatus = data.period;
    if (this.adjustmentDirection === AdjustmentDirection.Down) {
      this.labelType = 'Downward'
    }
    else if (this.adjustmentDirection === AdjustmentDirection.Up) {
      this.labelType = 'Upward'
    }

    if (this.periodStatus === PeriodStatusEnum.History) {
      if (this.adjustmentDirection === AdjustmentDirection.Down) {
        this.labelMessage = 'Credit Note Amount';
      }
      else if (this.adjustmentDirection === AdjustmentDirection.Up) {
        this.labelMessage = 'Debit Note Amount';
      }
    }
    else {
      this.labelMessage = 'Adjustment Amount';
    }
  }

  ngOnInit(): void {
    this.createForm();
  }

  addAdjustment() {
    if (this.form.get('amount').value > 0) {
      this.dialogRef.close({ amount: this.form.get('amount').value });
    }
    else {
      this.dialogRef.close({ amount: 0 });
    }
  }

  close() {
    this.dialogRef.close({ amount: 0 });
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      amount: [{ value: null }, Validators.required],
      transactionAmount: [{ value: null }, Validators.required],
      total: [{ value: null }, Validators.required],
    });
    this.form.get('transactionAmount').setValue(this.originalAmount);
    this.disableFormControl('transactionAmount');

    this.disableFormControl('amount');
  }

  onAmountChanged(adjustedTotal: number) {
    let adjustementAmount = 0;
    const newTotal = adjustedTotal;

    if (this.isNewAmountValid(adjustedTotal)) {
      this.labelMessageError = '';
      if (this.adjustmentDirection === AdjustmentDirection.Down) {
        adjustementAmount = this.originalAmount - (+newTotal);
        this.enableFormControl('amount');
        this.form.get('amount').setValue(adjustementAmount.toFixed(2));
        this.disableFormControl('amount');
      }
      else if (this.adjustmentDirection === AdjustmentDirection.Up) {
        adjustementAmount = (+newTotal) - this.originalAmount;
        this.enableFormControl('amount');
        this.form.get('amount').setValue(adjustementAmount.toFixed(2));
        this.disableFormControl('amount');
      }
    }

  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  isNewAmountValid(adjustedTotal: number): boolean {
    if (this.adjustmentDirection === AdjustmentDirection.Up) {
      if (this.originalAmount > adjustedTotal) {
        this.labelMessageError = 'New total cannot be LESS than original amount';

        this.enableFormControl('amount');
        this.form.get('amount').setValue('');
        this.disableFormControl('amount');
        return false;
      }
    }

    if (this.adjustmentDirection === AdjustmentDirection.Down) {
      if (adjustedTotal > this.originalAmount) {
        this.labelMessageError = 'New total cannot be MORE than original amount';

        this.enableFormControl('amount');
        this.form.get('amount').setValue('');
        this.disableFormControl('amount');
        return false;
      }
    }

    return true;
  }
}