import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { PreauthReviewType } from 'projects/medicare/src/app/medi-manager/enums/preauth-review-type';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service'
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { UntypedFormGroup } from '@angular/forms';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { PreauthIcd10EditComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-icd10-edit/preauth-icd10-edit.component';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { isNullOrUndefined } from 'util';
import { PreAuthReview } from 'projects/medicare/src/app/medi-manager/models/preauthReview';
import { RequestType } from 'projects/medicare/src/app/medi-manager/enums/request-type.enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { Icd10codesGridComponent } from 'projects/medicare/src/app/medi-manager/views/shared/icd10codes-grid/icd10codes-grid.component';
import { PreauthReviewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-review/preauth-review.component';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { ProsthetistQuoteListComponent } from '../prosthetist-quote-list/prosthetist-quote-list.component';
import { ProsthetistQuote } from '../../models/prosthetistquote';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    selector: 'prosthetic-preauth-reviewer',
    templateUrl: './prosthetic-preauth-reviewer.component.html',
    styleUrls: ['./prosthetic-preauth-reviewer.component.css']
})
export class ProstheticPreAuthReviewerComponent extends WizardDetailBaseComponent<PreAuthorisation> {
    preAuthTypeText = "Prosthetic Authorisation Details";
    mainPreAuthorisation: PreAuthorisation;
    preAuthRejectReasonList: any;
    form: UntypedFormGroup;
    requestType: string;
    preAuthId: number;
    personEventId: number;
    healthCareProviderId: number;
    healthCareProvider: HealthCareProvider;
    preAuth$: Observable<PreAuthorisation>;
    preAuthClaimDetails$: Observable<PreAuthClaimDetail>;
    hcpMainAuth$: Observable<HealthCareProvider>;
    preAuthClaimDetails: PreAuthClaimDetail;
    preauthReviewType = PreauthReviewType;
    eventDateInjuryDateNotEqual: boolean = false;
    isRequestFromHcp: boolean = false;
    ProstheticAuthDetails: PreAuthorisation;
    isLoading: boolean = false;
    documentSystemName = DocumentSystemNameEnum.MediCareManager;
    documentSet = DocumentSetEnum.MedicalProstheticDocuments;
    documentTypeFilter: DocumentTypeEnum[] = [];
    title:string='Prosthetic PreAuth Review';
    isQuotationLinked:ProsthetistQuote;
    selectedProsthetistQuote: ProsthetistQuote;
    hasSubmitPermission: boolean = false;

    constructor(
        readonly mediCarePreAuthService: MediCarePreAuthService,
        appEventsManager: AppEventsManager,
        private readonly healthcareProviderService: HealthcareProviderService,
        authService: AuthService,
        private changeDetectorRef: ChangeDetectorRef,
        activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef) {
        super(appEventsManager, authService, activatedRoute);
    }

    @ViewChild('MainPreAuthICD10Codes', { static: false }) private preauthIcd10EditComponentMainPreAuth: PreauthIcd10EditComponent;
    @ViewChild('mainPreAuthBreakdown', { static: false }) private mainPreAuthBreakdown: PreauthBreakdownComponent;
    @ViewChild('icd10Grid', { static: false }) private icd10Grid: Icd10codesGridComponent;
    @ViewChild('preauthReviewComponentHospital', { static: false }) private preauthReviewComponentHospital: PreauthReviewComponent;
    @ViewChild('preauthReviewComponentHospital', { static: false }) private prostheticQuoteListComponent: ProsthetistQuoteListComponent;
    
    ngOnInit() {
        this.createForm();       
    }

    getData(): void {
        if (this.context) {
            this.preAuthId = this.context.wizard.linkedItemId;
        }

        if (this.preAuthId > 0) {
            this.preAuth$ = this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId);

            this.isLoading = true;
            this.preAuth$
                .pipe(tap((x: PreAuthorisation) => {
                    this.preAuthClaimDetails$ = this.mediCarePreAuthService
                        .getPreAuthClaimDetailByPersonEventId(x.personEventId)
                        .pipe(
                            tap((x: PreAuthClaimDetail) => this.preAuthClaimDetails = x)
                        );
                    this.hcpMainAuth$ = this.healthcareProviderService.getHealthCareProviderById(x.healthCareProviderId);
                }))
                .subscribe((data) => {
                    if (data !== null) {
                        this.mainPreAuthorisation = this.ProstheticAuthDetails = data;
                        this.personEventId = data.personEventId;
                        this.title = 'Prosthetic New PreAuthorisation Review';
                        this.documentTypeFilter.push(DocumentTypeEnum.MedicalProstheticMotivationLetter);
                        this.documentTypeFilter.push(DocumentTypeEnum.MedicalProstheticCoidForm);
                        this.documentTypeFilter.push(DocumentTypeEnum.MedicalProstheticPhotos);
                        this.documentTypeFilter.push(DocumentTypeEnum.MedicalProstheticQuotation);
                        this.documentTypeFilter.push(DocumentTypeEnum.MedicalProstheticScriptDocorReferral);
                        this.isLoading = false;
                    }
                },
                    (error) => { },
                    () => {
                        if (this.mainPreAuthorisation !== null) {
                            if (this.mainPreAuthorisation.preAuthType == PreauthTypeEnum.Prosthetic) {
                                this.healthCareProviderId = this.mainPreAuthorisation.healthCareProviderId;
                                this.changeDetector.detectChanges();
                                this.preAuthTypeText = "Prosthetic Authorisation Details";
                                this.model = this.mainPreAuthorisation;
                            }
                            this.changeDetector.detectChanges();
                            if (this.mainPreAuthBreakdown !== undefined) {
                                this.mainPreAuthBreakdown.getHealthCareProvider(this.healthCareProviderId);
                                this.mainPreAuthBreakdown.getExistingPreAuthBreakdownList();
                            }

                            this.isRequestFromHcp = this.mainPreAuthorisation.isRequestFromHcp;
                        }
                    }
                );
        }
    }

    createForm(): void {
        if (userUtility.hasPermission('Submit PreAuthorisation Review')) {
            this.hasSubmitPermission = true;
        }
    }

    onLoadLookups(): void {
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        if (!this.model) {
            validationResult.errors = validationResult.errors + 1;
            validationResult.errorMessages.push('An error occured while trying to retrieve review details');
            return;
        }

        if (this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.Authorise) {

            var existingICD10CodesMainPreAuth = this.preauthIcd10EditComponentMainPreAuth.getExistingICD10Codes();
            if (existingICD10CodesMainPreAuth.length == 0) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please select ICD10 codes.');
            } else {
                let authorisedICD10CodeItem = existingICD10CodesMainPreAuth.find(x => x.isAuthorised == true);
                if (!authorisedICD10CodeItem) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please select ICD10 codes.');
                }
            }

            var existingpreAuthBreakdownList = this.mainPreAuthBreakdown.getPreAuthBreakdownList();
            if (existingpreAuthBreakdownList.length == 0) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please select preauth breakdown lines.');
            } else {
                let authorisedPreAuthBreakdownItem = existingpreAuthBreakdownList.find(x => x.isAuthorised == true);
                if (!authorisedPreAuthBreakdownItem) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please select preauth breakdown lines.');
                }
            }
        }

        if (isNullOrUndefined(this.isQuotationLinked)) {
            validationResult.errors++;
            validationResult.errorMessages.push('Cannot complete review before Prosthetist Quotation has been capture and linked');
        }

        return validationResult;
    }

    populateForm(): void {
        this.getData();
    }

    populateModel(): void {
        if (!this.model) return;

        if (this.preauthIcd10EditComponentMainPreAuth !== undefined) {
            //Get ICD10Codes and Treatment Baskets from the original Auth
            let existingICD10CodesMainPreAuth = this.preauthIcd10EditComponentMainPreAuth.getExistingICD10Codes();
            let existingTreatmentBasketListMainPreAuth = this.preauthIcd10EditComponentMainPreAuth.getExistingTreatmentBaskets();
            this.model.preAuthIcd10Codes = existingICD10CodesMainPreAuth;
            this.model.preAuthTreatmentBaskets = existingTreatmentBasketListMainPreAuth;

            //Get ICD10Codes and Treatment Baskets added by Reviewer
            let iCD10CodeListMainPreAuth = this.preauthIcd10EditComponentMainPreAuth.getAddedICD10Codes();
            let treatmentBasketListMainPreAuth = this.preauthIcd10EditComponentMainPreAuth.getAddedTreatmentBaskets();
            iCD10CodeListMainPreAuth.forEach(x => this.model.preAuthIcd10Codes.push(x));
            treatmentBasketListMainPreAuth.forEach(y => this.model.preAuthTreatmentBaskets.push(y));

            if (this.mainPreAuthBreakdown !== undefined && this.mainPreAuthBreakdown !== null) {
                this.model.preAuthorisationBreakdowns = this.mainPreAuthBreakdown.getPreAuthBreakdownList();
                var authorisedAmount = 0;
                this.model.preAuthorisationBreakdowns.forEach((x) => {
                    if (x.isAuthorised) {
                        authorisedAmount += x.authorisedAmount;
                        x.authorisedTreatments = x.authorisedQuantity;
                        x.reviewComments = x.quantityChangedReason;
                    }
                });
                this.model.authorisedAmount = authorisedAmount;
            }
        }
        
        if (!isNullOrUndefined(this.preauthReviewComponentHospital)) {
            this.model.preAuthType = PreauthTypeEnum.Prosthetic;
            this.model.preAuthStatus = MedicareUtilities.getPreAuthStatus(this.preauthReviewComponentHospital.reviewDetails.requestType);
            this.model.reviewComments = this.preauthReviewComponentHospital.reviewDetails.reviewComments;
        }

        this.model.preAuthId = this.preAuthId;
        this.model.preAuthType = PreauthTypeEnum.Prosthetic;
    }

    getIsProstheticQuoteLinkedValue(result) {
        this.isQuotationLinked = result;
        this.changeDetectorRef.detectChanges();
    }

    ngAfterViewInit(): void {

    }

    onSelect(): void {
    }
}
