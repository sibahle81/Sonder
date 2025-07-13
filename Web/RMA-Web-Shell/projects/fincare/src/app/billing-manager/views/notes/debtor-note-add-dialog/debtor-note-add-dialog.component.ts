import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdjustmentDirection } from 'projects/fincare/src/app/shared/enum/adjustment-direction.enum';
import { PeriodStatusEnum } from 'projects/shared-models-lib/src/lib/enums/period-status-enum';
import { BehaviorSubject } from 'rxjs';
import { AdjustmentAmountDialogComponent } from '../../adjustment-amount-dialog/adjustment-amount-dialog.component';

@Component({
  selector: 'app-debtor-note-add-dialog',
  templateUrl: './debtor-note-add-dialog.component.html',
  styleUrls: ['./debtor-note-add-dialog.component.css']
})
export class DebtorNoteAddDialogComponent implements OnInit {

  noteType = '';
  form: UntypedFormGroup;
  constructor(public dialogRef: MatDialogRef<DebtorNoteAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly formBuilder: UntypedFormBuilder
  ) {
    this.noteType = `Add New ${data.noteType}`;
  }

  ngOnInit(): void {
    this.createForm();
  }

  addNote() {
    if (this.form.get('debtorNote').value.length > 0) {
      this.dialogRef.close({ note: this.form.get('debtorNote').value });
    }
    else {
      this.dialogRef.close({ note: '' });
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      debtorNote: [null, Validators.required]
    });
  }

  splitPascalCaseWord(word: string): string {
    const regex = /($[a-z])|[A-Z][^A-Z]+/g;
    return word.match(regex).join(' ');
  }

  close() {
    this.dialogRef.close({ note: '' });
  }
}