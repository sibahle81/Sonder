import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'preauth-breakdowns',
    templateUrl: './preauth-breakdowns.component.html',
    styleUrls: ['./preauth-breakdowns.component.css'],
})
export class PreAuthBreakDownsComponent  implements OnInit {
    displayedColumns = ['itemCode', 'description', 'treatmentCode', 'tariffAmount','dateAuthorisedFrom','dateAuthorisedTo', 'requestedQuantity', 
    'requestedAmount', 'authorisedAmount', 'isAuthorised', 'quantityReducedReason', 'isClinicalUpdate','updateSequenceNo'];
    @Input() breakdowns: Array<PreAuthorisationBreakdown>;
    @Input() preAuthStatus:  number;
    @Input() preAuthType: number;
    dataSource: Array<PreAuthorisationBreakdown>;
    isInternalUser: boolean = true;

    constructor(private readonly authService: AuthService) {
    }
    
    ngOnInit(): void {  
      var currentUser = this.authService.getCurrentUser();
      this.isInternalUser = currentUser.isInternalUser; 
      this.getDisplayedColumns();
    }

    showColumn(): boolean {
      return (this.isInternalUser || this.preAuthStatus == PreAuthStatus.Authorised) ? true : false;
    }

    getDisplayedColumns(): string[] {

      let displayedColumns = [
        { def: 'itemCode', show: true },
        { def: 'description', show: true },
        { def: 'treatmentCode', show: (this.showCPTCode() ) },//cpt code 
        { def: 'treatmentCodeDescription', show: (this.showCPTCode() ) },//cpt code description
        { def: 'tariffAmount', show: true },
        { def: 'dateAuthorisedFrom', show: true },
        { def: 'dateAuthorisedTo', show: true },
        { def: 'requestedQuantity', show: true },
        { def: 'requestedAmount', show: this.showColumn() },//conditional
        { def: 'authorisedAmount', show: this.showColumn() },//conditional
        { def: 'isAuthorised', show: true },
        { def: 'quantityReducedReason', show: true },
        { def: 'isClinicalUpdate', show: !this.isTreatmentAuthType() },//clinical
        { def: 'updateSequenceNo', show: !this.isTreatmentAuthType() }//clinical
      ];
      return displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
    }

    isTreatmentAuthType(): boolean {
      let result = PreauthTypeEnum[this.preAuthType] !== PreauthTypeEnum.Treatment.toString();
      return result;
    }

    showCPTCode():boolean{
      const result = this.breakdowns.filter((x) => !isNullOrUndefined(x.treatmentCode));
      return result?.length > 0;
    }

}
