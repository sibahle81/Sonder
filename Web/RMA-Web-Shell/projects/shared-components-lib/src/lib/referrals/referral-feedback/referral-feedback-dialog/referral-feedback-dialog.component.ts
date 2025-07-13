import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Referral } from 'projects/shared-models-lib/src/lib/referrals/referral';

@Component({
  templateUrl: './referral-feedback-dialog.component.html',
  styleUrls: ['./referral-feedback-dialog.component.css']
})
export class ReferralFeedbackDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReferralFeedbackDialogComponent>
  ) { }

  close($event: Referral) {
    this.dialogRef.close($event);
  }
}
