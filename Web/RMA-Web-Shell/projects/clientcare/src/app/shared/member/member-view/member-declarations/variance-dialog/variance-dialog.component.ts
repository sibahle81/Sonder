import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './variance-dialog.component.html',
  styleUrls: ['./variance-dialog.component.css']
})
export class VarianceDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<VarianceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  close(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    this.dialogRef.close(true);
  }
}
