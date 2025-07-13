import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './communication-failure-reason-dialog.component.html'
})
export class CommunicationFailureReasonDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<CommunicationFailureReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  cancel() {
    this.dialogRef.close();
  }
}
