import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './referral-reports-dialog.component.html',
  styleUrls: ['./referral-reports-dialog.component.css']
})
export class ReferralReportsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReferralReportsDialogComponent>
  ) { }


  cancel() {
    this.dialogRef.close(null);
  }
}
