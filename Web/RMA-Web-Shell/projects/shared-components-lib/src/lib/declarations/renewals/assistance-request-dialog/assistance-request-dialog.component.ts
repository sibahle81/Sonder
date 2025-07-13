import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './assistance-request-dialog.component.html',
  styleUrls: ['./assistance-request-dialog.component.css']
})
export class AssistanceRequestDialogComponent implements OnInit {

  form: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<AssistanceRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}
