import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { DisabilityFormService } from '../disability-form.service';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';

@Component({
  selector: 'claim-disability-dialog',
  templateUrl: './claim-disability-dialog.component.html',
  styleUrls: ['./claim-disability-dialog.component.css']
})
export class ClaimDisabilityDialogComponent {

  disabilityAssessment = ClaimDisabilityTypeEnum[ClaimDisabilityTypeEnum.DisabilityAssessment];
  disabilityHearing = ClaimDisabilityTypeEnum[ClaimDisabilityTypeEnum.HearingAssessment];
  disabilityPDLumpAward = ClaimDisabilityTypeEnum[ClaimDisabilityTypeEnum.PDLumpAward];

  disabilityType: ClaimDisabilityTypeEnum;
  personEvent: PersonEventModel;

  constructor(
    public dialogRef: MatDialogRef<ClaimDisabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly disabilityFormService: DisabilityFormService
  ) { 
   
   }

  cancel() {
    this.dialogRef.close(null);
  }

  closeDialog(){
    this.dialogRef.close(this.data.claimDisabilityAssessment);
  }
}
