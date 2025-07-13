import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './variance-confirmation-dialog.component.html',
  styleUrls: ['./variance-confirmation-dialog.component.css']
})
export class VarianceConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<VarianceConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  close(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
