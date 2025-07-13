import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ViewChild } from '@angular/core';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { PreauthTypeEnum} from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { isNullOrUndefined } from 'util';


@Component({
    selector: 'physio-ot-preauth',
    templateUrl: './physio-ot-preauth.component.html',
    styleUrls: ['./physio-ot-preauth.component.css']
})
export class PhysioOTPreAuthComponent extends WizardDetailBaseComponent<PreAuthorisation> {
    PhysioOT = 'PhysioOT';
    healthCareProvider: HealthCareProvider;
    preAuthClaimDetail: PreAuthClaimDetail;
    form: UntypedFormGroup;
    preAuthorisationList: any;
    physioOTPreAuth: PreAuthorisation;
    preAuthorisationBreakdownList: PreAuthorisationBreakdown[];
    showPhysioOTCapture = false;
    resetbtnShow: boolean = false;
    @ViewChild('healthcareProviderSearch', { static: false }) private healthcareProviderSearch: HealthCareProviderSearchComponent;
    @ViewChild('preAuthBreakdown', { static: false }) private preAuthBreakdown: PreauthBreakdownComponent;
    constructor(
        appEventsManager: AppEventsManager,
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder) {
        super(appEventsManager, authService, activatedRoute);
    }

    @ViewChild(PreAuthDiagnosisComponent, { static: false })
    private preAuthDiagnosisComponent: PreAuthDiagnosisComponent;

    @ViewChild(HealthCareProviderSearchComponent, { static: false })
    private healthCareProviderSearchComponent: HealthCareProviderSearchComponent;

    @ViewChild(PreauthBreakdownComponent, { static: false })
    private preauthBreakdownComponent: PreauthBreakdownComponent;

    ngOnInit() {
        this.createForm();
    }

    populateForm(): void {
        this.populateFormWithExistingAuthData();
    }

    populateFormWithExistingAuthData() {
        if (this.model !== null && this.model !== undefined) {
            if (this.model.subPreAuthorisations !== null && this.model.subPreAuthorisations !== undefined) {
                let existingAuth = this.model.subPreAuthorisations.find(x => x.preAuthType == PreauthTypeEnum.PhysioOTAuth);
                if (existingAuth !== null && existingAuth !== undefined) {
                    existingAuth.preAuthStatus = PreAuthStatus.PendingReview;
                    if (this.preauthBreakdownComponent !== undefined && this.preauthBreakdownComponent !== null && existingAuth.preAuthorisationBreakdowns) {
                        this.preauthBreakdownComponent.loadExistingBreakdownList(existingAuth.preAuthorisationBreakdowns);
                    }

                    if (this.healthCareProviderSearchComponent !== undefined) {
                        this.healthCareProviderSearchComponent.loadExistingAuthHealthcareProviderDetails(existingAuth.healthCareProviderId);
                    }

                    if (this.preAuthDiagnosisComponent !== undefined) {
                        this.preAuthDiagnosisComponent.loadExistingICD10CodesAndTreatmentBaskets(existingAuth);
                    }

                    const form = this.form.controls;
                    if (form !== undefined && form !== null) {
                        if (form.dateAuthorisedFromPhysio !== undefined && form.dateAuthorisedToPhysio !== undefined && form.motivation !== undefined) {
                            form.dateAuthorisedFromPhysio.setValue(existingAuth.dateAuthorisedFrom);
                            form.dateAuthorisedToPhysio.setValue(existingAuth.dateAuthorisedTo);
                            form.motivation.setValue(existingAuth.requestComments);
                        }
                    }
                }
            }
        }
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            dateAuthorisedFromPhysio: new UntypedFormControl(),
            dateAuthorisedToPhysio: new UntypedFormControl(),
            motivation: new UntypedFormControl(),
        });
    }

    populateModel(): void {
        if (!this.model) return;
        this.setPhysioOTDetails();
    }

    onLoadLookups(): void {
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        if (!isNullOrUndefined(this.physioOTPreAuth) && this.showPhysioOTCapture === true) {
            if (this.physioOTPreAuth.preAuthIcd10Codes != null) {
                if (this.physioOTPreAuth.preAuthIcd10Codes.length <= 0) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push(`Please capture at least one ICD10 code on Physio/OT Auth.`);
                }
            }
            if (this.physioOTPreAuth.preAuthorisationBreakdowns != null) {
                if (this.physioOTPreAuth.preAuthorisationBreakdowns.length <= 0) {
                    validationResult.errors = validationResult.errors + 1;
                    validationResult.errorMessages.push(`Please capture at least one line item on Physio/OT Auth.`);
                }
            }
            DateCompareValidator.compareDates(DateUtility.getDate(this.physioOTPreAuth.dateAuthorisedFrom), DateUtility.getDate(this.physioOTPreAuth.dateAuthorisedTo), 'Authorisation to date cannot be before the authorisation from date', validationResult);
        }

        return validationResult;
    }

    healthCareProviderChangedFunction(valueEmitted) {
        this.healthCareProvider = valueEmitted as HealthCareProvider;
    }

    addPhysioOTDetails(): void {
        this.showPhysioOTCapture = true;
        this.resetbtnShow = true;
        this.populateFormWithExistingAuthData();
    }

    removePhysioOTDetails(): void {
        this.showPhysioOTCapture = false;
        this.resetbtnShow = false;
        this.resetForm();
    }

    setPhysioOTDetails(): void {
        if (!this.model) {
            return;
        }
        if (this.preAuthDiagnosisComponent && this.healthCareProviderSearchComponent && this.preauthBreakdownComponent) {
            const form = this.form as UntypedFormGroup;
            this.physioOTPreAuth = new PreAuthorisation();
            this.physioOTPreAuth.preAuthType = PreauthTypeEnum.PhysioOTAuth;
            this.physioOTPreAuth.personEventId = this.model.personEventId;
            this.physioOTPreAuth.injuryDate = this.model.injuryDate;
            let iCD10CodeList = this.preAuthDiagnosisComponent.getICD10CodeList() as PreAuthIcd10Code[];
            let healthCareProvider = this.healthCareProviderSearchComponent.getHealthCareProviderDetails();
            let preauthBreakdownList = this.preauthBreakdownComponent.getPreAuthBreakdownList() as PreAuthorisationBreakdown[];

            this.physioOTPreAuth.requestComments = form.controls.motivation.value;
            this.physioOTPreAuth.dateAuthorisedFrom = DateUtility.getDate(form.controls.dateAuthorisedFromPhysio.value);
            this.physioOTPreAuth.dateAuthorisedTo = DateUtility.getDate(form.controls.dateAuthorisedToPhysio.value);
            this.physioOTPreAuth.preAuthIcd10Codes = iCD10CodeList as PreAuthIcd10Code[];
            this.physioOTPreAuth.healthCareProviderId = healthCareProvider.rolePlayerId;
            this.physioOTPreAuth.preAuthorisationBreakdowns = preauthBreakdownList;
            this.physioOTPreAuth.preAuthStatus = PreAuthStatus.PendingReview;


            if (this.model.subPreAuthorisations !== undefined) {
                let subPreAuthorisationsListCurrent = this.model.subPreAuthorisations.filter(({ preAuthType }) => preAuthType !== this.physioOTPreAuth.preAuthType);
                this.model.subPreAuthorisations = subPreAuthorisationsListCurrent;
                this.model.subPreAuthorisations.push(this.physioOTPreAuth);
            }
            else {
                this.model.subPreAuthorisations = [];
                this.model.subPreAuthorisations.push(this.physioOTPreAuth);
            }
        }
    }

    resetForm(): void {
        if (!isNullOrUndefined(this.healthcareProviderSearch) && !isNullOrUndefined(this.preAuthBreakdown)) {
            this.form.reset();
            this.healthcareProviderSearch.form.reset();
            this.preAuthBreakdown.resetForm();
            if (this.model.subPreAuthorisations != undefined) {
                let subPreAuthorisationsListCurrent = this.model.subPreAuthorisations.filter(({ preAuthType }) => preAuthType !== PreauthTypeEnum.PhysioOTAuth);
                this.model.subPreAuthorisations = subPreAuthorisationsListCurrent;
            }
        }
    }
}