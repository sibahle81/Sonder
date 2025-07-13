import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Observable } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';

@Component({
    selector: 'preauth-treating-doctor-details',
    templateUrl: './preauth-treating-doctor-details.component.html',
    styleUrls: ['./preauth-treating-doctor-details.component.css']
})
export class PreAuthTreatingDoctorDetailsComponent  implements OnInit {
    displayedColumns = ['itemCode', 'description', 'tariffAmount', 'requestedQuantity',
        'requestedAmount', 'authorisedAmount', 'isAuthorised', 'quantityReducedReason'];
    @Input() auth: Array<PreAuthorisation>;
    @Input() bodySides: Array<any>;
    @Input() isInternalUser: boolean;
    dataSource: Array<PreAuthorisationBreakdown>;
    data: PreAuthorisation;
    healthCareProvider$: Observable<HealthCareProvider>;
    preAuthStatus = PreAuthStatus;

    constructor(
        private readonly healthcareProviderService: HealthcareProviderService
    ){}

    ngOnInit(): void {
        if (this.auth) {
            this.data = this.auth.filter(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor)[0];            

            if (!!this.data) {
                this.healthCareProvider$ = this.healthcareProviderService.getHealthCareProviderById(this.data.healthCareProviderId)
            }
        }
    }
    getPreauthStatus(preAuthStatus: number): string {
        return PreAuthStatus[preAuthStatus];
      }

      checkIfAuthorised(preAuthStatus: number): string {
        return (preAuthStatus === PreAuthStatus.Authorised) ? 'Authorised' : 'Not Authorised';
      }
}
