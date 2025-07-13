import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DeclarationRenewalStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/declaration-renewal-status.enum';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MemoOfAgreementComponent } from '../memo-of-agreement/memo-of-agreement.component';

@Component({
  selector: 'app-term-schedule-capture',
  templateUrl: './term-schedule-capture.component.html',
  styleUrls: ['./term-schedule-capture.component.css']
})
export class TermScheduleCaptureComponent implements OnInit {

  monthsNotCaptured = []
  selectedMonth = '0';
  form: UntypedFormGroup;
  schedule: { month: number, amount: number } = { month: 0, amount: 0 };
  message = '';
  constructor(public dialogRef: MatDialogRef<TermScheduleCaptureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly toastr: ToastrManager
  ) {
    this.monthsNotCaptured = data.monthsNotCaptured;
    if (this.monthsNotCaptured.length === 0) {
      this.message = 'All schedule months have been captured.';
    }
  }

  ngOnInit(): void {
    this.createForm();
  }

  addPaymentSchedule() {
    this.schedule.amount = this.form.get('amount').value;
    this.schedule.month = +this.selectedMonth;
    this.close();
  }

  close() {
    if (this.schedule.amount && this.schedule.month) {
      this.dialogRef.close({ month: this.schedule.month, amount: this.schedule.amount });
    }
    else {
      this.dialogRef.close();
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      paymentMonth: [{ value: null }, Validators.required],
      amount: [{ value: null }, Validators.required]
    });
  }
}