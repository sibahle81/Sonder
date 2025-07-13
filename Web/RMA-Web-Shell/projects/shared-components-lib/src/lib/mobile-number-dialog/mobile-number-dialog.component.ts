import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

import { ValidatePhoneNumber } from 'projects/shared-utilities-lib/src/lib/validators/phone-number.validator';

@Component({
  selector: 'app-mobile-number-dialog',
  templateUrl: './mobile-number-dialog.component.html',
  styleUrls: ['./mobile-number-dialog.component.css']
})
export class MobileNumberDialogComponent implements OnInit {

  title: string = 'Mobile Number';
  mobileNumber: string = '';
  form: UntypedFormGroup;
  
  constructor(
    public dialogRef: MatDialogRef<MobileNumberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.title = data.title;
    this.mobileNumber = data.mobileNumber;
  }

  ngOnInit() {
    this.createForm();
    this.populateForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      mobileNumber: ['', [Validators.required, ValidatePhoneNumber]]
    });
  }

  populateForm() {
    this.form.patchValue({
      mobileNumber: this.mobileNumber
    });
  }

  checkMobile(): void {
    if (this.form.valid) {
      var values = this.form.getRawValue();
      this.dialogRef.close(values.mobileNumber);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
