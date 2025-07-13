import { tap } from 'rxjs/operators';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { isNullOrUndefined } from 'util';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { PreauthTypeEnum } from '../../../medi-manager/enums/preauth-type-enum';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { ProsthetistQuote } from '../../models/prosthetistquote';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  selector: 'app-prosthetist-preauth-details',
  templateUrl: './prosthetist-preauth-details.component.html',
  styleUrls: ['./prosthetist-preauth-details.component.css']
})
export class ProsthetistPreauthDetailsComponent implements OnInit {
    @Input() preauthViewId: number;

    preAuthView$: Observable<PreAuthorisation>;
    prostheticPreAuthId: number;
    bodySides$: Observable<Lookup[]>;
    isInternalUser: boolean = false;
    isQuotationLinked:ProsthetistQuote;

    documentSet = DocumentSetEnum.MedicalProstheticDocuments;
    requiredDocumentsUploaded = false;
    documentSystemName = DocumentSystemNameEnum.MediCareManager;
    preAuthId:number;
    preAuthData : PreAuthorisation;
    loading$ = new BehaviorSubject<boolean>(false);
    isExternalUser = false;
    
    constructor(private readonly route: ActivatedRoute,
        private readonly mediCarePreAuthService: MediCarePreAuthService,
        private readonly router: Router,
        private readonly lookupService: LookupService,
        private readonly wizardService: WizardService,
        private changeDetectorRef: ChangeDetectorRef,
        private readonly wizardConfigurationService: WizardConfigurationService,
        private readonly authService: AuthService) { }

    ngOnInit(): void {
        this.isExternalUser = !this.authService.getCurrentUser().isInternalUser;
        this.loading$.next(true);
        const id = this.route.snapshot.paramMap.get('id');
        this.preAuthId = (Number(id) > 0) ? (Number(id)) : Number(this.preauthViewId);

        if (!isNullOrUndefined(this.preAuthId) && !Number.isNaN(this.preAuthId)) {
            this.preAuthView$ = this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId)
                .pipe(
                    tap((item: PreAuthorisation) => {
                        this.loading$.next(false);
                        if (!isNullOrUndefined(item)) {
                            this.prostheticPreAuthId = item.preAuthId;
                            this.preAuthData  = item;
                        }
                    })
                );

            this.bodySides$ = this.lookupService.getBodySides();
            var currentUser = this.authService.getCurrentUser();
            this.isInternalUser = currentUser.isInternalUser;
        }
    }

    isRequiredDocumentsUploaded($event) {
        this.requiredDocumentsUploaded = $event;
    }

    linkProstheticAuthToQuotation(){
        this.loading$.next(true);
        const startWizardRequest = new StartWizardRequest(); 
        let wizardModel = new ProsthetistQuote();
        wizardModel.preAuthId = this.preAuthId
        wizardModel.claimId = this.preAuthData.claimId
        wizardModel.healthCareProviderName = this.preAuthData.healthCareProviderName
        wizardModel.rolePlayerId = this.preAuthData.healthCareProviderId
        wizardModel.claimReferenceNumber = this.preAuthData.claimReferenceNumber
        startWizardRequest.data = JSON.stringify(wizardModel);
        startWizardRequest.linkedItemId = 0;
        startWizardRequest.type = MedicareUtilities.preAuthWizardType(PreauthTypeEnum.Prosthetic,CrudActionType.create);
    
        this.wizardService.startWizard(startWizardRequest)
          .subscribe((wizard) => {
            this.loading$.next(false);
            this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
          })
    }

    getIsProstheticQuoteLinkedValue(result) {
        this.isQuotationLinked = result;
        this.changeDetectorRef.detectChanges();
    }

}
