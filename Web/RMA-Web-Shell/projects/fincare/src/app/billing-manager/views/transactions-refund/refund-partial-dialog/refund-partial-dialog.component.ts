import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-refund-partial-dialog',
  templateUrl: './refund-partial-dialog.component.html',
  styleUrls: ['./refund-partial-dialog.component.css']
})
export class RefundPartialDialogComponent implements OnInit {
  balance: number;
  form: UntypedFormGroup;
  showMessage = false;
  constructor(private readonly formbuilder: UntypedFormBuilder, public dialogRef: MatDialogRef<RefundPartialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.balance = data.balance;
  }
  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formbuilder.group({
      partialAmount: [null]
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }
  submit() {
    this.showMessage = false;
    const amount = +(this.form.value.partialAmount as number);
    if (amount > this.balance || amount === 0) {
      this.showMessage = true;
      return;
    }
    else {
      this.dialogRef.close(amount);
    }
  }
}
