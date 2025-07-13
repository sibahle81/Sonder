import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { QuoteViewV2Component } from '../quote-view.component';


@Component({
  templateUrl: './decline-reason-dialog.component.html',
  styleUrls: ['./decline-reason-dialog.component.css']
})
export class DeclineReasonDialogComponent {

  form: UntypedFormGroup;
  declineReason: string;

  constructor(
    public dialogRef: MatDialogRef<QuoteViewV2Component>,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      text: new UntypedFormControl('', [Validators.required, Validators.min(3), Validators.max(255)]),
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
