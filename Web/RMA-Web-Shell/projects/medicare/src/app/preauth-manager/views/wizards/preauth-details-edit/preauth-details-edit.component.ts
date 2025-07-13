import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreauthHcpViewComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-hcp-view/preauth-hcp-view.component';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { isNullOrUndefined } from 'util';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component'
import { PreAuthClaimSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-claim-search/preauth-claim-search.component';
import { IsInOROutHospitalCheckComponent } from 'projects/medicare/src/app/preauth-manager/views/is-in-or-out-hospital-check/is-in-or-out-hospital-check.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PreAuthClaimDetail } from '../../../models/preauth-claim-detail';
import { CrudActionType } from 'projects/medicare/src/app/shared/enums/crud-action-type';

@Component({
  selector: 'preauth-details-edit',
  templateUrl: './preauth-details-edit.component.html',
  styleUrls: ['./preauth-details-edit.component.css']
})
export class PreauthDetailsEditComponent extends WizardDetailBaseComponent<PreAuthorisation> {
  preAuthId: number;
  form: UntypedFormGroup;
  mainPreAuthorisation: PreAuthorisation;
  preAuthClaimDetails: PreAuthClaimDetail;
  isInternalUser: boolean;
  authType: any;
  isTreatmentAuth: boolean = false;
  isInHospitalValue: boolean = undefined;
  preAuthClaimDetails$: Observable<PreAuthClaimDetail>;
  crudActionType: typeof CrudActionType = CrudActionType;
  linkedId: number
  requiredDocumentsUploaded = false;
  
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private datePipe: DatePipe
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  @ViewChild('ClaimDetails', { static: false }) private preauthClaimEditComponent: PreAuthClaimSearchComponent;
  @ViewChild('HealthcareProvider', { static: false }) private preauthHcpViewComponent: PreauthHcpViewComponent;
  @ViewChild('EditHealthcareProvider', { static: false }) private preauthHcpEditComponent: HealthCareProviderSearchComponent;
  @ViewChild(PreAuthDiagnosisComponent, { static: false }) private preAuthDiagnosisComponent: PreAuthDiagnosisComponent;
  @ViewChild('IsInHospital', { static: false }) private isInOROutHospitalCheckComponent: IsInOROutHospitalCheckComponent;

  ngOnInit() {
    this.createForm();
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
  }

  populateForm(): void {
    if (!this.model) return
    const model = this.model;
    this.isInHospitalValue = model.isInHospital;
  }

  populateModel(): void {
    if (!this.model) return;
    const form = this.form.getRawValue();

    this.model.injuryDate = DateUtility.getDate(this.datePipe.transform(form.injuryDate, 'MM/dd/yyyy'));
    this.model.requestComments = form.requestComments;
    this.model.dateAuthorisedFrom = DateUtility.getDate(this.datePipe.transform(form.dateAuthorisedFrom, 'MM/dd/yyyy'));
    this.model.dateAuthorisedTo = DateUtility.getDate(this.datePipe.transform(form.dateAuthorisedTo, 'MM/dd/yyyy'));
    if (this.isTreatmentAuth) {
      this.model.isClaimReopeningRequest = form.isClaimReopeningRequest;
      this.model.isRehabilitationRequest = form.isRehabilitationRequest;
      this.model.isWoundCareTreatment = form.isWoundCareTreatment;
      this.model.isMedicationRequired = form.isMedicationRequired;
      this.form.controls.isClaimReopeningRequest.setValue(form.isClaimReopeningRequest);
      this.form.controls.isRehabilitationRequest.setValue(form.isRehabilitationRequest);
      this.form.controls.isWoundCareTreatment.setValue(form.isWoundCareTreatment);
      this.form.controls.isMedicationRequired.setValue(form.isMedicationRequired);
      this.model.isInHospital = this.isInHospitalValue;
    }
    this.model.preAuthIcd10Codes = this.preAuthDiagnosisComponent.model.preAuthIcd10Codes;
    this.model.preAuthTreatmentBaskets = this.preAuthDiagnosisComponent.model.preAuthTreatmentBaskets;
    const hcpData = this.preauthHcpEditComponent.getHealthCareProviderDetails();
    this.model.healthCareProviderId = hcpData.rolePlayerId;
    this.model.healthCareProviderName = hcpData.name;
    this.model.practiceNumber = hcpData.practiceNumber;
    const claimData = this.preauthClaimEditComponent.getClaimDetails();
    this.model.preAuthContactNumber = claimData.preAuthContactNo;
    this.model.personEventId = claimData.personEventId;
    this.model.claimId = claimData.claimId;
    this.model.injuryDate = (this.isInternalUser && !isNullOrUndefined(claimData?.eventDate) ? DateUtility.getDate(claimData?.eventDate) : null);
    this.model.eventDate = DateUtility.getDate(claimData?.eventDate);

  }

  createForm(): void {
    this.form = this.formBuilder.group({
      injuryDate: new UntypedFormControl(),
      dateAuthorisedFrom: new UntypedFormControl(),
      dateAuthorisedTo: new UntypedFormControl(),
      requestComments: new UntypedFormControl(),
      isClaimReopeningRequest: new UntypedFormControl(),
      isRehabilitationRequest: new UntypedFormControl(),
      isWoundCareTreatment: new UntypedFormControl(),
      isMedicationRequired: new UntypedFormControl()
    });
    this.loadExistingPreAuthData();
  }

  onLoadLookups(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    var practitionerType = this.healthcareProviderService.preAuthPractitionerTypeSetting;
    var currentUser = this.authService.getCurrentUser();
    if (this.model != null) {
      this.model.preAuthType = PreauthTypeEnum.Hospitalization;
      const form = this.form.controls;
      ReportFormValidationUtility.FieldRequired('dateAuthorisedFrom', 'Date authorised from', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('dateAuthorisedTo', 'Date authorised to', this.form, validationResult);
      ReportFormValidationUtility.FieldRequired('requestComments', 'Motivation', this.form, validationResult);
      DateCompareValidator.compareDates(this.form.controls.dateAuthorisedFrom.value, this.form.controls.dateAuthorisedTo.value, 'Authorisation to date cannot be before the authorisation from date', validationResult);
      DateCompareValidator.compareDates(this.form.controls.injuryDate.value, this.form.controls.dateAuthorisedFrom.value, 'Authorisation from date cannot be before the date of injury', validationResult);
      DateCompareValidator.compareDates(this.form.controls.injuryDate.value, this.form.controls.dateAuthorisedTo.value, 'Authorisation to date cannot be before the date of injury', validationResult);
      //icd menditory only for hospital otherwise relax for treating doc
      if (this.model.preAuthIcd10Codes.length <= 0 && practitionerType.isHospital) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one ICD10Code`);
      }
      if (isNullOrUndefined(this.model.isInHospital) && this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment]) {
        validationResult.errors = validationResult.errors + 1;
        validationResult?.errorMessages.push('To complete this, Please specify if this was In or Out of Hospital.*');
      }

      if (this.model.requestComments.length <= 10) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least 10 characters`);
      }
    }
    return validationResult;
  }

  getIsInHospitalSetValue(value) {
    this.isInHospitalValue = value;
  }

  loadExistingPreAuthData() {
    let authID = localStorage.getItem('preAuthId');
    if (isNullOrUndefined(authID) && !isNullOrUndefined(this.context)) {
      authID = this.context.wizard.linkedItemId.toString();
    }

    if (authID !== undefined && authID !== null) {
      this.preAuthId = Number(authID);
      let preAuthorisationExisting = new PreAuthorisation;
      this.mediCarePreAuthService.getPreAuthorisationById(this.preAuthId).subscribe((data) => {
        preAuthorisationExisting = data as PreAuthorisation;
        this.preAuthClaimDetails$ = this.mediCarePreAuthService
              .getPreAuthClaimDetailByPersonEventId(preAuthorisationExisting.personEventId)
              .pipe(
                tap((x: PreAuthClaimDetail) => this.preAuthClaimDetails = x)
              );
      },
        (error) => { },
        () => {
          this.model = preAuthorisationExisting;
          this.model.isClaimReopeningRequest =  this.model.isClaimReopeningRequest ?  this.model.isClaimReopeningRequest : false; 
          this.mainPreAuthorisation = preAuthorisationExisting;
          this.model.preAuthStatus = PreAuthStatus.PendingReview;
          this.authType = PreauthTypeEnum[this.model.preAuthType];
          if (this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment]) {
            this.isTreatmentAuth = true;
            this.form.controls.isClaimReopeningRequest.setValue(this.model.isClaimReopeningRequest);
            this.form.controls.isRehabilitationRequest.setValue(this.model.isRehabilitationRequest);
            this.form.controls.isWoundCareTreatment.setValue(this.model.isWoundCareTreatment);
            this.form.controls.isMedicationRequired.setValue(this.model.isMedicationRequired);
            this.isInHospitalValue = this.model.isInHospital;
          }
          else {
            this.isTreatmentAuth = false;
          }
          this.preauthClaimEditComponent.loadExistingClaimDetails(this.model.personEventId);
          this.preauthHcpEditComponent.loadExistingAuthHealthcareProviderDetails(this.model.healthCareProviderId);
          this.preauthHcpViewComponent.healthCareProviderId = this.model.healthCareProviderId;
          this.preauthHcpViewComponent.getHealthcareProviderDetails();
          this.preauthHcpViewComponent.authDetails = this.model;
          const form = this.form.controls;
          if (form !== undefined && form !== null) {

            if (new Date(this.model.injuryDate) > DateUtility.minDate())
              form.injuryDate.setValue(this.model.injuryDate);
            if (new Date(this.model.dateAuthorisedFrom) > DateUtility.minDate())
              form.dateAuthorisedFrom.setValue(this.model.dateAuthorisedFrom);
            if (new Date(this.model.dateAuthorisedTo) > DateUtility.minDate())
              form.dateAuthorisedTo.setValue(this.model.dateAuthorisedTo);
            form.requestComments.setValue(this.model.requestComments);

          }
          this.preAuthDiagnosisComponent.loadExistingICD10CodesAndTreatmentBaskets(this.model);
        }
      );
    }
    localStorage.removeItem('preAuthId');
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

}
