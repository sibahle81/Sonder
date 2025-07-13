import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { AuthorisationsFormService } from '../claim-authorisations-form.service';
import { ClaimAuthorisationsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-authorisations-type-enum';



@Component({
  selector: 'claim-authorisations-dialog',
  templateUrl: './claim-authorisations-dialog.component.html',
  styleUrls: ['./claim-authorisations-dialog.component.css']
})
export class ClaimAuthorisationsDialogComponent {

  travelAuthorisation = ClaimAuthorisationsTypeEnum.Travel;
  disabilityType: ClaimAuthorisationsTypeEnum;
  personEvent: PersonEventModel;

  isReadOnly = true;
  
  constructor(
    public dialogRef: MatDialogRef<ClaimAuthorisationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public readonly invoiceFormService: AuthorisationsFormService
  ) {
    if (data.invoiceAction === 'edit') {
      this.isReadOnly = false;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
