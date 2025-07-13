import { isNullOrUndefined } from 'util';
import { Component, Input, OnInit } from '@angular/core';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Observable } from 'rxjs';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';

@Component({
  selector: 'preauth-hcp-view',
  templateUrl: './preauth-hcp-view.component.html',
  styleUrls: ['./preauth-hcp-view.component.css']
})
export class PreauthHcpViewComponent implements OnInit {
  @Input() healthCareProviderId: number;
  @Input() healthCareProvider: HealthCareProvider;
  @Input() authDetails: PreAuthorisation;
  @Input() preAuthClaimDetails: Observable<PreAuthClaimDetail>;
  @Input() isInternalUser: boolean;

  healthCareProviderName: string;
  practiceNumber: string;
  practitionerTypeId: number;
  preAuthStatus = PreAuthStatus;
  isTreatmentAuth: boolean = false;
  linkedId:number;
  requiredDocumentsUploaded = false;

  constructor(
    private readonly HealthcareProviderService: HealthcareProviderService
  ) { }

  ngOnInit() {
    this.getHealthcareProviderDetails();
    if (this.authDetails) {
      if (this.authDetails.preAuthType == PreauthTypeEnum.Treatment)
        this.isTreatmentAuth = true;
    }
  }

  getHealthcareProviderDetails(): void {
    if (this.authDetails) {
      if (isNullOrUndefined(this.authDetails.reviewComments)) {
        this.authDetails.reviewComments = '';
      }
      if (isNullOrUndefined(this.authDetails.requestComments)) {
        this.authDetails.requestComments = '';
      }
    }
    if (this.healthCareProviderId > 0 && !isNullOrUndefined(this.healthCareProviderId)) {
      this.HealthcareProviderService.getHealthCareProviderById(this.healthCareProviderId).subscribe((result) => {
        if (result !== null && result.rolePlayerId > 0) {
          this.healthCareProvider = result;
          this.practitionerTypeId = result.providerTypeId;
        }
      });
    }
    else {
      this.healthCareProviderName = '';
      this.practiceNumber = '';
    }
  }

  getPreauthStatus(preAuthStatus: number): string {
    return PreAuthStatus[preAuthStatus];
  }

  checkIfAuthorised(preAuthStatus: number): string {
    return (preAuthStatus === PreAuthStatus.Authorised) ? 'Authorised' : 'Not Authorised';
  }  

  getIsInHospital(): string {
    if (this.authDetails) {
      return MedicareUtilities.getIsInHospitalStatus(this.authDetails.isInHospital);
    }
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

}
