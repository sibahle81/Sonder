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
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { isNullOrUndefined } from 'util';
import { PreAuthReview } from 'projects/medicare/src/app/medi-manager/models/preauthReview';
import { RequestType } from 'projects/medicare/src/app/medi-manager/enums/request-type.enum';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { Icd10codesGridComponent } from 'projects/medicare/src/app/medi-manager/views/shared/icd10codes-grid/icd10codes-grid.component';
import { PreauthReviewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-review/preauth-review.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
    selector: 'preauth-reviewer',
    templateUrl: './preauth-reviewer.component.html',
    styleUrls: ['./preauth-reviewer.component.css']
})
export class PreAuthReviewerComponent extends WizardDetailBaseComponent<PreAuthorisation> {
    preAuthTypeText = "Autorisation Details";
    mainPreAuthorisation: PreAuthorisation;
    subPreAuthorisations: PreAuthorisation[];
    preAuthRejectReasonList: any;
    form: UntypedFormGroup;
    requestType: string;
    showMainPreAuth = true;
    showTreatingDoctorAuth = false;
    levelOfCare: boolean = false;
    preAuthIdMainPreAuth: number;
    preAuthIdTreatingDoctor: number;
    personEventId: number;
    healthCareProviderIdMainPreAuth: number;
    healthCareProviderIdTreatingDoctor: number;
    healthCareProvider: HealthCareProvider;
    preAuth$: Observable<PreAuthorisation>;
    preAuthClaimDetails$: Observable<PreAuthClaimDetail>;
    hcpMainAuth$: Observable<HealthCareProvider>;
    preAuthClaimDetails: PreAuthClaimDetail;
    preauthReviewType = PreauthReviewType;
    eventDateInjuryDateNotEqual: boolean = false;
    isRequestFromHcp: boolean = false;
    treatingDoctorDetails: PreAuthorisation;
    hospitalDetails: PreAuthorisation;
    isLoading: boolean = false;
    hasSubmitPermission: boolean = false;

    constructor(
        readonly mediCarePreAuthService: MediCarePreAuthService,
        appEventsManager: AppEventsManager,
        private readonly healthcareProviderService: HealthcareProviderService,
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef) {
        super(appEventsManager, authService, activatedRoute);
    }

    @ViewChild('MainPreAuthICD10Codes', { static: false }) private preauthIcd10EditComponentMainPreAuth: PreauthIcd10EditComponent;
    @ViewChild('TreatingDoctorAuthICD10Codes', { static: false }) private preauthIcd10EditComponentTreatingDoctor: PreauthIcd10EditComponent;
    @ViewChild('mainPreAuthBreakdown', { static: false }) private mainPreAuthBreakdown: PreauthBreakdownComponent;
    @ViewChild('treatingDoctorBreakdown', { static: false }) private treatingDoctorBreakdown: PreauthBreakdownComponent;
    @ViewChild('icd10Grid', { static: false }) private icd10Grid: Icd10codesGridComponent;
    @ViewChild('preauthReviewComponentHospital', { static: false }) private preauthReviewComponentHospital: PreauthReviewComponent;
    @ViewChild('preauthReviewComponentTreatingDoctor', { static: false }) private preauthReviewComponentTreatingDoctor: PreauthReviewComponent;

    ngOnInit() {
        this.createForm();
    }

    getData(): void {
        if (this.context) {
            this.preAuthIdMainPreAuth = this.context.wizard.linkedItemId;
        }

        if (this.preAuthIdMainPreAuth > 0) {
            this.preAuth$ = this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthIdMainPreAuth);

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
                        this.mainPreAuthorisation = this.hospitalDetails = data;
                        this.treatingDoctorDetails = data.subPreAuthorisations.find(x => x.preAuthType === PreauthTypeEnum.TreatingDoctor);
                        this.personEventId = data.personEventId;

                        this.isLoading = false;
                    }
                },
                    (error) => { },
                    () => {
                        if (this.mainPreAuthorisation !== null) {
                            if (this.mainPreAuthorisation.preAuthType == PreauthTypeEnum.Hospitalization) {
                                this.healthCareProviderIdMainPreAuth = this.mainPreAuthorisation.healthCareProviderId;
                                this.changeDetector.detectChanges();
                                this.preAuthTypeText = "Hospital Autorisation Details";
                                this.model = this.mainPreAuthorisation;
                            }
                            this.changeDetector.detectChanges();
                            if (this.mainPreAuthBreakdown !== undefined) {
                                this.mainPreAuthBreakdown.getHealthCareProvider(this.healthCareProviderIdMainPreAuth);
                                this.mainPreAuthBreakdown.getExistingPreAuthBreakdownList();
                            }

                            this.isRequestFromHcp = this.mainPreAuthorisation.isRequestFromHcp;
                            if (this.mainPreAuthorisation.subPreAuthorisations.length > 0) {
                                this.subPreAuthorisations = this.mainPreAuthorisation.subPreAuthorisations;

                                this.subPreAuthorisations.forEach((x) => {
                                    if (x.preAuthType == PreauthTypeEnum.TreatingDoctor) {
                                        this.preAuthIdTreatingDoctor = x.preAuthId;
                                        this.personEventId = x.personEventId;
                                        this.healthCareProviderIdTreatingDoctor = x.healthCareProviderId;
                                        this.showTreatingDoctorAuth = true;
                                        this.changeDetector.detectChanges();
                                        if (this.treatingDoctorBreakdown !== undefined) {
                                            this.treatingDoctorBreakdown.getHealthCareProvider(this.healthCareProviderIdTreatingDoctor);
                                            this.treatingDoctorBreakdown.getExistingPreAuthBreakdownList();
                                        }
                                    }
                                });
                                this.mainPreAuthorisation.subPreAuthorisations = this.subPreAuthorisations;
                                if (!isNullOrUndefined(this.preAuthClaimDetails) && this.isRequestFromHcp) {
                                    this.eventDateInjuryDateNotEqual = this.preAuthClaimDetails.eventDate.valueOf() != this.mainPreAuthorisation.injuryDate.valueOf();
                                }

                            }
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
            validationResult.errorMessages.push('An error occured while trying to retrieve Review Details');
            return;
        }

        //Validate Hospital Auth Review Details
        if (!isNullOrUndefined(this.preauthReviewComponentHospital)) {
            if ((this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.RequestInfo ||
                this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.Reject)
                && this.preauthReviewComponentHospital.reviewDetails.rejectReason == 0) {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please select a Reject / Pend reason for Hospital Authorisation');
            }
            else if ((this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.RequestInfo ||
                this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.Reject)
                && this.preauthReviewComponentHospital.reviewDetails.rejectReason > 0
                && this.preauthReviewComponentHospital.reviewDetails.reviewComments == '') {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please capture a Comment for Hospital Authorisation.');
            }
            else if (this.preauthReviewComponentHospital.reviewDetails.requestType == RequestType.Authorise) {
                let authorisedIcd10ObjectCount = 0;
                let authorisedBreakdownObjectCount = 0;
                if (!isNullOrUndefined(this.model)) {
                    if (isNullOrUndefined(this.model.preAuthIcd10Codes)) {
                        authorisedIcd10ObjectCount = null;
                    }
                    else if (!isNullOrUndefined(this.model.preAuthIcd10Codes) && this.model.preAuthIcd10Codes.length > 0) {
                        this.model.preAuthIcd10Codes.forEach(x => {
                            if (x.isAuthorised) {
                                authorisedIcd10ObjectCount += 1;
                            }
                        });
                    }

                    if (isNullOrUndefined(this.model.preAuthorisationBreakdowns)) {
                        authorisedBreakdownObjectCount = null;
                    }
                    else if (!isNullOrUndefined(this.model.preAuthorisationBreakdowns) && this.model.preAuthorisationBreakdowns.length > 0) {
                        this.model.preAuthorisationBreakdowns.forEach(x => {
                            if (x.isAuthorised) {
                                authorisedBreakdownObjectCount += 1;
                            }
                        });
                    }
                }
                else {
                    authorisedIcd10ObjectCount = null;
                    authorisedBreakdownObjectCount = null;
                }

                if (this.preauthReviewComponentHospital.reviewDetails.reviewComments == '') {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please capture a Comment for Hospital Authorisation.');
                }

                if (authorisedIcd10ObjectCount == 0) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please select at least 1 ICD10Code to authorise for Hospital Authorisation.');
                }

                if (authorisedBreakdownObjectCount == 0) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please select at least 1 Line Item to authorise for Hospital Authorisation.');
                }


                else if (this.preauthReviewComponentHospital.reviewDetails.reviewComments != '') {

                    if (this.model.preAuthIcd10Codes.length <= 0 || authorisedIcd10ObjectCount == null) {
                        validationResult.errors = validationResult.errors + 1;
                        validationResult.errorMessages.push('No ICD10Codes found for Hospital Authorisation. Please capture at least 1 ICD10Code.');
                    }


                    else if (this.model.preAuthorisationBreakdowns.length <= 0 || authorisedBreakdownObjectCount == null) {
                        validationResult.errors = validationResult.errors + 1;
                        validationResult.errorMessages.push('No Line Items found for Hospital Authorisation. Please capture at least 1 ICD10Code.');
                    }
                }
            }
        }

        //Validate Treating Doctor Auth Review Details
        if (!isNullOrUndefined(this.preauthReviewComponentTreatingDoctor)) {
            if ((this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType == RequestType.RequestInfo ||
                this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType == RequestType.Reject)
                && this.preauthReviewComponentTreatingDoctor.reviewDetails.rejectReason == 0
                && this.preauthReviewComponentTreatingDoctor.reviewDetails.reviewComments != '') {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please select a Reject / Pend reason for Treating Doctor Authorisation');
            }
            else if ((this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType == RequestType.RequestInfo ||
                this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType == RequestType.Reject)
                && this.preauthReviewComponentTreatingDoctor.reviewDetails.rejectReason > 0
                && this.preauthReviewComponentTreatingDoctor.reviewDetails.reviewComments == '') {
                validationResult.errors = validationResult.errors + 1;
                validationResult.errorMessages.push('Please capture a Comment for Treating Doctor Authorisation.');
            }
            else if (this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType == RequestType.Authorise) {
                let authorisedIcd10ObjectCount = 0;
                let authorisedBreakdownObjectCount = 0;
                if (!isNullOrUndefined(this.model.subPreAuthorisations)) {
                    let indexTreatingDoctor = this.model.subPreAuthorisations.findIndex(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor);

                    if (isNullOrUndefined(this.model.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes)) {
                        authorisedIcd10ObjectCount = null;
                    }
                    else if (!isNullOrUndefined(this.model.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes)
                        && this.model.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes.length > 0) {
                        this.model.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes.forEach(x => {
                            if (x.isAuthorised) {
                                authorisedIcd10ObjectCount += 1;
                            }
                        });
                    }

                    if (isNullOrUndefined(this.model.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns)) {
                        authorisedBreakdownObjectCount = null;
                    }
                    else if (!isNullOrUndefined(this.model.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns)
                        && this.model.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns.length > 0) {
                        this.model.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns.forEach(x => {
                            if (x.isAuthorised) {
                                authorisedBreakdownObjectCount += 1;
                            }
                        });
                    }
                }
                else {
                    authorisedIcd10ObjectCount = null;
                    authorisedBreakdownObjectCount = null;
                }

                if (this.preauthReviewComponentTreatingDoctor.reviewDetails.reviewComments == '' &&
                    (authorisedIcd10ObjectCount > 0 || authorisedBreakdownObjectCount > 0)) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push('Please capture a Comment for Treating Doctor Authorisation.');
                }
                else if (this.preauthReviewComponentTreatingDoctor.reviewDetails.reviewComments != '') {
                    if (authorisedIcd10ObjectCount == 0) {
                        validationResult.errors = validationResult.errors + 1;
                        validationResult.errorMessages.push('Please select at least 1 ICD10Code to authorise for Treating Doctor Authorisation.');
                    }

                    if (authorisedBreakdownObjectCount == 0) {
                        validationResult.errors = validationResult.errors + 1;
                        validationResult.errorMessages.push('Please select at least 1 Line Item to authorise for Treating Doctor Authorisation.');
                    }

                    if (!isNullOrUndefined(this.model.subPreAuthorisations)) {
                        let indexTreatingDoctor = this.model.subPreAuthorisations.findIndex(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor);
                        if (this.model.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes.length <= 0 || authorisedIcd10ObjectCount == null) {
                            validationResult.errors = validationResult.errors + 1;
                            validationResult.errorMessages.push('No ICD10Codes found for Treating Doctor Authorisation. Please capture at least 1 ICD10Code.');
                        }
                        if (this.model.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns.length <= 0 || authorisedBreakdownObjectCount == null) {
                            validationResult.errors = validationResult.errors + 1;
                            validationResult.errorMessages.push('No Line Items found for Treating Doctor Authorisation. Please capture at least 1 ICD10Code.');
                        }
                    }
                }
            }
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
            this.model.preAuthType = PreauthTypeEnum.Hospitalization;
            this.model.preAuthStatus = this.getPreAuthStatus(this.preauthReviewComponentHospital.reviewDetails.requestType);
            this.model.reviewComments = this.preauthReviewComponentHospital.reviewDetails.reviewComments;
        }
        if (this.subPreAuthorisations !== undefined) {
            let indexTreatingDoctor = this.subPreAuthorisations.findIndex(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor);

            //Treating Doctor
            if (this.preauthIcd10EditComponentTreatingDoctor !== undefined && this.subPreAuthorisations.length > 0 && indexTreatingDoctor > -1) {

                //Get ICD10Codes and Treatment Baskets from the original Auth
                let existingICD10CodesTreatingDoctor = this.preauthIcd10EditComponentTreatingDoctor.getExistingICD10Codes();
                let existingTreatmentBasketListTreatingDoctor = this.preauthIcd10EditComponentTreatingDoctor.getExistingTreatmentBaskets();
                this.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes = existingICD10CodesTreatingDoctor;
                this.subPreAuthorisations[indexTreatingDoctor].preAuthTreatmentBaskets = existingTreatmentBasketListTreatingDoctor;

                //Get ICD10Codes and Treatment Baskets added by Reviewer
                let iCD10CodeListTreatingDoctor = this.preauthIcd10EditComponentTreatingDoctor.getAddedICD10Codes();
                let treatmentBasketListTreatingDoctor = this.preauthIcd10EditComponentTreatingDoctor.getAddedTreatmentBaskets();
                iCD10CodeListTreatingDoctor.forEach(x => this.subPreAuthorisations[indexTreatingDoctor].preAuthIcd10Codes.push(x));
                treatmentBasketListTreatingDoctor.forEach(y => this.subPreAuthorisations[indexTreatingDoctor].preAuthTreatmentBaskets.push(y));

                if (!isNullOrUndefined(this.preauthReviewComponentTreatingDoctor)) {
                    this.subPreAuthorisations[indexTreatingDoctor].preAuthType = PreauthTypeEnum.TreatingDoctor;
                    this.subPreAuthorisations[indexTreatingDoctor].preAuthStatus = this.getPreAuthStatus(this.preauthReviewComponentTreatingDoctor.reviewDetails.requestType);
                    this.subPreAuthorisations[indexTreatingDoctor].reviewComments = this.preauthReviewComponentTreatingDoctor.reviewDetails.reviewComments;
                }

                if (this.treatingDoctorBreakdown !== undefined && this.treatingDoctorBreakdown !== null) {
                    this.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns = this.treatingDoctorBreakdown.getPreAuthBreakdownList();
                    var authorisedAmount = 0;
                    this.subPreAuthorisations[indexTreatingDoctor].preAuthorisationBreakdowns.forEach((x) => {
                        if (x.isAuthorised) {
                            authorisedAmount += x.authorisedAmount;
                            x.authorisedTreatments = x.authorisedQuantity;
                            x.reviewComments = x.quantityChangedReason;
                        }
                    });
                    this.subPreAuthorisations[indexTreatingDoctor].authorisedAmount = authorisedAmount;
                }
            }
        }

        this.model.preAuthId = this.preAuthIdMainPreAuth;
        this.model.preAuthType = PreauthTypeEnum.Hospitalization;
        this.model.subPreAuthorisations = this.subPreAuthorisations;
    }

    ngAfterViewInit(): void {

    }

    onSelect(): void {
    }

    getPreAuthStatus(requestType: string): number {
        switch (requestType) {
            case RequestType.Authorise:
                return PreAuthStatus.Authorised;
            case RequestType.Reject:
                return PreAuthStatus.Rejected;
            case RequestType.RequestInfo:
                return PreAuthStatus.InfoRequired;
            case RequestType.SendForReview:
                return PreAuthStatus.PendingReview;
        }
    }
}
