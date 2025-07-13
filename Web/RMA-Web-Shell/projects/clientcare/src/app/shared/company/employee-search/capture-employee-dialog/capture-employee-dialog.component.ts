import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './capture-employee-dialog.component.html',
  styleUrls: ['./capture-employee-dialog.component.css']
})
export class CaptureEmployeeDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CaptureEmployeeDialogComponent>
  ) { }

  close() {
    this.dialogRef.close();
  }
}
