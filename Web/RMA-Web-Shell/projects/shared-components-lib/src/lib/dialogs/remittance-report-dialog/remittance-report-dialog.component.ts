import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './remittance-report-dialog.component.html'
})
export class RemittanceReportDialogComponent {

  title = 'Remittance Reports'; // default title but can be overridden
    
  constructor(
    public dialogRef: MatDialogRef<RemittanceReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.title = data.title ? data.title : this.title;
  }

  cancel() {
    this.dialogRef.close();
  }
}
