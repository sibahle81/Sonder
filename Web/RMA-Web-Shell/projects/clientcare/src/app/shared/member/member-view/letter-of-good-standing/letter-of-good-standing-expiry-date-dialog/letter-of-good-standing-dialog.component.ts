import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { LetterOfGoodStandingComponent } from '../letter-of-good-standing.component';

@Component({
  templateUrl: './letter-of-good-standing-dialog.component.html',
  styleUrls: ['./letter-of-good-standing-dialog.component.css']
})

export class LetterOfGoodStandingDialogComponent implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  today = new Date();

  constructor(
    public dialogRef: MatDialogRef<LetterOfGoodStandingComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      expiryDate: [{ value: null, disabled: false }, [Validators.required]],
    });
  }

  save() {
    this.dialogRef.close(this.form.controls.expiryDate.value);
  }

  close() {
    this.dialogRef.close(null);
  }
}
