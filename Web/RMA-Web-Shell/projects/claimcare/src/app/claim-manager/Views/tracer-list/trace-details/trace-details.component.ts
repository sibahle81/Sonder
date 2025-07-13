import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TracerListComponent } from '../tracer-list.component';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'trace-details',
  templateUrl: './trace-details.component.html'
})
export class TraceDetailsComponent implements OnInit {

  form: UntypedFormGroup;
  formIsValid = false;
  leftOverAmount = 0;
  message = '';

  constructor(
    public dialogRef: MatDialogRef<TracerListComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private readonly formBuilder: UntypedFormBuilder) {
    this.leftOverAmount = data as number;
  }


  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      date: ['', [Validators.required]],
      amount: ['', [Validators.required]],
    });
  }

  onClick() {
    this.message = '';
    const details = this.form.getRawValue();
    if (details.amount > this.leftOverAmount) {
      this.message = `Payment Amount R${details.amount} is more than Available Balance of R${this.leftOverAmount}`;
      return;
    } else { this.dialogRef.close(details); }
  }

  checkValidity() {
    const date = this.form.controls.date.value;
    const amount = this.form.controls.amount.value;
    if (amount && date) {
      this.formIsValid = true;
    } else { this.formIsValid = false; }
  }

  close() {
    this.dialogRef.close(null);
  }
}
