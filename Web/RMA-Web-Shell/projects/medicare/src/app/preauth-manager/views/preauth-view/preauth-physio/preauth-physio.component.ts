import { Observable } from 'rxjs';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { Component, Input, OnInit } from '@angular/core';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
@Component({
    selector: 'preauth-physio',
    templateUrl: './preauth-physio.component.html',
    styleUrls: ['./preauth-physio.component.css']
})
export class PreAuthPhysioComponent  implements OnInit {
    displayedColumns = ['itemCode', 'description', 'tariffAmount', 'requestedQuantity', 
    'requestedAmount', 'authorisedAmount', 'isAuthorised', 'quantityReducedReason'];
    @Input() auth: Array<PreAuthorisation>;
    @Input() bodySides: Array<any>;
    dataSource: Array<PreAuthorisationBreakdown>;
    data: PreAuthorisation;
    healthCareProvider$: Observable<HealthCareProvider>;

    constructor(
        private readonly healthcareProviderService: HealthcareProviderService
    ){}
    
    ngOnInit(): void { 
        this.data = this.auth.filter(x => x.preAuthType == PreauthTypeEnum.PhysioOTAuth)[0] ? this.auth.filter(x => x.preAuthType == PreauthTypeEnum.PhysioOTAuth)[0] : null;
        this.dataSource = this.data.preAuthorisationBreakdowns;

        if(!!this.data) {
            this.healthCareProvider$ = this.healthcareProviderService.getHealthCareProviderById(this.data.healthCareProviderId)
        }
    }
}
