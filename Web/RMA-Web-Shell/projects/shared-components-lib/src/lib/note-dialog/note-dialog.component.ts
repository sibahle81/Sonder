import { Component, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MobileNumberDialogComponent } from '../mobile-number-dialog/mobile-number-dialog.component';

@Component({
  selector: 'lib-note-dialog',
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.css']
})
export class NoteDialogComponent {
  title: string = 'Note';
  form: UntypedFormGroup;
  
  constructor(
    public dialogRef: MatDialogRef<MobileNumberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.title = data.title;
  }

  ngOnInit() {
    this.createForm();
    this.populateForm();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  populateForm() {
    this.form.patchValue({
      comment: ''
    });
  }

  checkComment(): void {
    if (this.form.valid) {
      var values = this.form.getRawValue();
      this.dialogRef.close(values.comment);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
