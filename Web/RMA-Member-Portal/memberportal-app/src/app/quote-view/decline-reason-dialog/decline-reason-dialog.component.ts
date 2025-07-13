import { QuoteViewComponent } from './../quote-view.component';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'decline-reason-dialog',
  templateUrl: './decline-reason-dialog.component.html'
})
export class DeclineReasonDialogComponent {

  form: FormGroup;
  declineReason: string;

  constructor(
    public dialogRef: MatDialogRef<QuoteViewComponent>,
    private readonly formBuilder: FormBuilder
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      text: new FormControl('', [Validators.required]),
    });
  }

  readForm() {
    this.declineReason = this.form.controls.text.value;
  }

  submit() {
    this.readForm();
    const data = {
      declineReason: this.declineReason,
    };

    this.dialogRef.close(data);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
