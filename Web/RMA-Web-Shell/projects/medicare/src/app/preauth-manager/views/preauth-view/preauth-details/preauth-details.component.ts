import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Component, Input, OnInit } from '@angular/core';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { PreAuthLevelOfCare } from '../../../models/preauth-levelofcare';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';

@Component({
    selector: 'preauth-details',
    templateUrl: './preauth-details.component.html',
    styleUrls: ['./preauth-details.component.css']
})
export class PreAuthDetailsComponent  implements OnInit {
    displayedColumns = ['itemCode', 'description', 'tariffAmount', 'requestedQuantity', 
    'requestedAmount', 'authorisedAmount', 'isAuthorised', 'quantityReducedReason'];
    @Input() auth: PreAuthorisation;
    @Input() bodySides: Array<any>;
    @Input() isInternalUser: boolean;
    @Input() showPreAuthDetails = true;
    @Input() switchBatchType: SwitchBatchType = SwitchBatchType.MedEDI;//default val used if not set/passed
    dataSource: Array<PreAuthorisationBreakdown>;
    locDataSource: Array<PreAuthLevelOfCare> = [];
    preAuthStatus = PreAuthStatus;
    isTreatmentAuth: boolean = false;
    isHospitalAuth: boolean = false;
    switchBatchTypeEnum = SwitchBatchType

    constructor(){}
    
  ngOnInit(): void {

    switch (this.switchBatchType) {
      case SwitchBatchType.MedEDI:
        if (this.auth) {
          this.dataSource = this.auth?.preAuthorisationBreakdowns;
          this.auth?.preAuthorisationBreakdowns?.forEach((preAuthBreakdown) => {
            if (preAuthBreakdown?.levelOfCare?.length > 0) {
              this.locDataSource?.push(...preAuthBreakdown.levelOfCare);
            }
          });
          if (this.auth?.preAuthType == PreauthTypeEnum.Treatment)
            this.isTreatmentAuth = true;
          else if (this.auth?.preAuthType == PreauthTypeEnum.Hospitalization)
            this.isHospitalAuth = true;
        }
        break;

      default:
        break;
    }
  }        

    getPreauthStatus(preAuthStatus: number): string {
      return PreAuthStatus[preAuthStatus];
    }

    checkIfAuthorised(preAuthStatus: number): string {
      return (preAuthStatus === PreAuthStatus.Authorised) ? 'Authorised' : 'Not Authorised';
    }

    getIsInHospital(): string {
      if (this.auth) {
        return MedicareUtilities.getIsInHospitalStatus(this.auth.isInHospital);
      }
    }
}
