import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReferralNatureOfQuery } from 'projects/shared-models-lib/src/lib/referrals/referral-nature-of-query';

@Component({
  templateUrl: './referral-nature-of-query-search-dialog.component.html',
  styleUrls: ['./referral-nature-of-query-search-dialog.component.css']
})
export class ReferralNatureOfQuerySearchDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReferralNatureOfQuerySearchDialogComponent>
  ) { }

  setReferralNatureOfQuery($event: ReferralNatureOfQuery) {
    this.dialogRef.close($event);
  }

  cancel() {
    this.dialogRef.close();
  }
}
