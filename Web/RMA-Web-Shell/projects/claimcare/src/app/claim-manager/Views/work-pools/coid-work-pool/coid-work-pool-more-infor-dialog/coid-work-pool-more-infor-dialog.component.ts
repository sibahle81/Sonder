import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { PersonEventModel } from '../../../../shared/entities/personEvent/personEvent.model';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';

@Component({
  templateUrl: './coid-work-pool-more-infor-dialog.component.html',
  styleUrls: ['./coid-work-pool-more-infor-dialog.component.css']
})
export class CoidWorkPoolMoreInforDialogComponent {

  personEventId: number;

  personEvent: PersonEventModel;
  personEmployment: PersonEmployment;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CoidWorkPoolMoreInforDialogComponent>,
    private readonly claimService: ClaimCareService,
    private readonly rolePlayerService: RolePlayerService
  ) {
    this.personEventId = this.data.personEventId;
  }

  ngOnInit(): void {
    this.getPersonEvent();
  }

  getPersonEvent() {
    this.claimService.getPersonEvent(this.personEventId).subscribe(result => {
      if (result) {
        this.personEvent = result;
        this.getPersonEventEmployment();
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  getPersonEventEmployment() {
    this.rolePlayerService.getPersonEmploymentByPersonEmploymentId(this.personEvent.personEmploymentId).subscribe(result => {
      if (result) {
        this.personEmployment = result;
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  getPersonEventStatus(personEventStatus: PersonEventStatusEnum): string {
    return this.formatText(PersonEventStatusEnum[personEventStatus]);
  }

  getLiabilityStatus(claimLiabilityStatus: ClaimLiabilityStatusEnum): string {
    return this.formatText(ClaimLiabilityStatusEnum[claimLiabilityStatus]);

  }

  formatText(text: string): string {
    return text ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }
}
