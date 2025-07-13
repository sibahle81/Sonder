import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './referral-quick-view-dialog.component.html',
  styleUrls: ['./referral-quick-view-dialog.component.css']
})
export class ReferralQuickViewDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReferralQuickViewDialogComponent>
  ) { }

  cancel() {
    this.dialogRef.close();
  }
}
