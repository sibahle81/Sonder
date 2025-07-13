import { Component, Inject, OnInit } from '@angular/core';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-claim-referral-view-dialog',
  templateUrl: './claim-referral-view-dialog.component.html',
  styleUrls: ['./claim-referral-view-dialog.component.css']
})
export class ClaimReferralViewDialogComponent{

  personEvent: PersonEventModel;

  constructor(
    public dialogRef: MatDialogRef<ClaimReferralViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PersonEventModel,
  ) { 
    if(data) {
      this.personEvent = data;
    }
  }


  close() {
    this.dialogRef.close(null);
  }

}
