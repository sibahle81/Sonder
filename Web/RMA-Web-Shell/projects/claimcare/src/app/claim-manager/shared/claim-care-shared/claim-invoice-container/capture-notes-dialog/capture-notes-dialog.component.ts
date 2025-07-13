import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './capture-notes-dialog.component.html',
  styleUrls: ['./capture-notes-dialog.component.css']
})
export class CaptureNotesDialogComponent implements OnInit {

  @Input() personEvent: PersonEventModel;
  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public dialogRef: MatDialogRef<CaptureNotesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder
  ) {

  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    if (!this.form) {
      this.form = this.formBuilder.group({
        note: [{ value: null, disabled: false }, [Validators.required]]
      });
    }
  }

  save() {
    this.isLoading$.next(true);
    const claimNote = this.form.controls.note.value;
    this.data.noteText = claimNote;
    this.dialogRef.close(this.data);
  }

  cancel(isCancel: boolean) {
    this.dialogRef.close(null);
  }
}
