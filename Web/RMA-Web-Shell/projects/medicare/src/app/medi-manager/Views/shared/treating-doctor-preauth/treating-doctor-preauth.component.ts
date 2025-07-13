import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { PreAuthDiagnosisComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-diagnosis/preauth-diagnosis.component';
import { HealthCareProviderSearchComponent } from 'projects/medicare/src/app/medi-manager/views/shared/healthcareprovider-search/healthcareprovider-search.component';
import { PreauthBreakdownComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-breakdown/preauth-breakdown.component';
import { PreAuthorisationBreakdown } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation-breakdown';
import { PreAuthIcd10Code } from 'projects/medicare/src/app/medi-manager/models/preAuthIcd10Code';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { PreAuthClaimDetail } from 'projects/medicare/src/app/preauth-manager/models/preauth-claim-detail';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { isNullOrUndefined } from 'util';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';

@Component({
  selector: 'treating-doctor-preauth',
  templateUrl: './treating-doctor-preauth.component.html',
  styleUrls: ['./treating-doctor-preauth.component.css']
})
export class TreatingDoctorPreauthComponent extends WizardDetailBaseComponent<PreAuthorisation> {
  treatingDoctor = 'TreatingDoctor';
  healthCareProvider: HealthCareProvider;
  preAuthClaimDetail: PreAuthClaimDetail;
  form: UntypedFormGroup;
  preAuthorisationList: any;
  treatingDoctorPreAuth: PreAuthorisation;
  preAuthorisationBreakdownList: PreAuthorisationBreakdown[];
  bodySides = [];
  injuryTypes = [];
  icd10Codes: ICD10CodeModel[];
  @ViewChild('healthcareProviderSearch', { static: false }) private healthcareProviderSearch: HealthCareProviderSearchComponent;
  @ViewChild('preAuthBreakdown', { static: false }) private preAuthBreakdown: PreauthBreakdownComponent;
  personEventId: number;
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly formBuilder: UntypedFormBuilder,
    public datepipe: DatePipe,
    readonly confirmservice: ConfirmationDialogsService,
    private changeDetector: ChangeDetectorRef
  ) {
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
    FormValidation.markFormTouched(this.form);
  }

  populateForm(): void {
    this.populateFormWithExistingAuthData();
  }

  populateFormWithExistingAuthData() {
    if (this.model !== null && this.model !== undefined) {
      this.personEventId = this.model.personEventId;     
      if (this.model.subPreAuthorisations !== null && this.model.subPreAuthorisations !== undefined) {
        let existingAuth = this.model.subPreAuthorisations.find(x => x.preAuthType == PreauthTypeEnum.TreatingDoctor);
        if (existingAuth !== null && existingAuth !== undefined) {        
          this.changeDetector.detectChanges();
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
            if (form.dateAuthorisedFromTreatingDoctor !== undefined && form.dateAuthorisedToTreatingDoctor !== undefined && form.motivation !== undefined) {
              form.dateAuthorisedFromTreatingDoctor.setValue(existingAuth.dateAuthorisedFrom);
              form.dateAuthorisedToTreatingDoctor.setValue(existingAuth.dateAuthorisedTo);
              form.motivation.setValue(existingAuth.requestComments);
            }
          }
          this.preauthBreakdownComponent.setAuthorisationDates(form.dateAuthorisedFromTreatingDoctor.value, form.dateAuthorisedToTreatingDoctor.value);        
        }
      }
    }
  }

  createForm(): void {
    if (this.form === undefined) {
      this.form = this.formBuilder.group({
        dateAuthorisedFromTreatingDoctor: new UntypedFormControl(),
        dateAuthorisedToTreatingDoctor: new UntypedFormControl(),
        motivation: new UntypedFormControl(),
      });
    }
  }

  ngAfterViewInit(): void {
  }

  populateModel(): void {
    if (!this.model) return;
    this.setTreatingDoctorDetails();
  }

  onLoadLookups(): void {
  }

  onMotivationChange(){
    this.populateModel();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    var practitionerType = this.healthcareProviderService.preAuthPractitionerTypeSetting;
    var currentUser = this.authService.getCurrentUser();

    if (this.treatingDoctorPreAuth === null || this.treatingDoctorPreAuth === undefined) {
      if (currentUser.isInternalUser || practitionerType.isTreatingDoctor) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture Treating Doctor Auth details on the Hospital Auth.`);
      }
    }
    else {
      if (this.treatingDoctorPreAuth.dateAuthorisedFrom == null) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture an Authorised From date on Treating Doctor Auth.`);
      }
      if (this.treatingDoctorPreAuth.dateAuthorisedTo == null) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture an Authorised To date on Treating Doctor Auth.`);
      }

      if (this.treatingDoctorPreAuth.preAuthIcd10Codes != null) {
        if (this.treatingDoctorPreAuth.preAuthIcd10Codes.length <= 0 && (currentUser.isInternalUser || practitionerType.isTreatingDoctor)) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`Please capture at least one ICD10 code on Treating Doctor Auth.`);
        }
      }
      if (this.treatingDoctorPreAuth.preAuthorisationBreakdowns != null) {
        if (this.treatingDoctorPreAuth.preAuthorisationBreakdowns.length <= 0 && (currentUser.isInternalUser || practitionerType.isTreatingDoctor)) {
          validationResult.errors = validationResult.errors + 1;
          validationResult.errorMessages.push(`Please capture at least one line item on Treating Doctor Auth.`);
        }
      }
      DateCompareValidator.compareDates(DateUtility.getDate(this.treatingDoctorPreAuth.dateAuthorisedFrom), DateUtility.getDate(this.treatingDoctorPreAuth.dateAuthorisedTo), 'Authorisation to date cannot be before the authorisation from date', validationResult);
    }

    return validationResult;
  }

  healthCareProviderChangedFunction(valueEmitted) {
    this.healthCareProvider = valueEmitted as HealthCareProvider;
  }

  healthCareProviderLoadedFunction(valueEmitted){
    this.healthCareProvider = valueEmitted as HealthCareProvider;
  }

  setTreatingDoctorDetails(): void {
    if (!this.model) {
      return;
    }
    if (this.preAuthDiagnosisComponent && this.healthCareProviderSearchComponent && this.preauthBreakdownComponent) {
      const form = this.form as UntypedFormGroup;
      this.treatingDoctorPreAuth = new PreAuthorisation();
      this.treatingDoctorPreAuth.preAuthType = PreauthTypeEnum.TreatingDoctor;
      this.treatingDoctorPreAuth.personEventId = this.model.personEventId;
      this.treatingDoctorPreAuth.injuryDate = this.model.injuryDate;
      this.treatingDoctorPreAuth.claimId = this.model.claimId;
      let iCD10CodeList = this.preAuthDiagnosisComponent.getICD10CodeList() as PreAuthIcd10Code[];
      this.healthCareProvider = this.healthCareProviderSearchComponent.getHealthCareProviderDetails();
      let preauthBreakdownList = this.preauthBreakdownComponent.getPreAuthBreakdownList() as PreAuthorisationBreakdown[];

      this.treatingDoctorPreAuth.requestComments = form.controls.motivation.value;
      this.treatingDoctorPreAuth.dateAuthorisedFrom = form.controls.dateAuthorisedFromTreatingDoctor.value ? DateUtility.getDate(form.controls.dateAuthorisedFromTreatingDoctor.value) : null;
      this.treatingDoctorPreAuth.dateAuthorisedTo = form.controls.dateAuthorisedToTreatingDoctor.value ? DateUtility.getDate(form.controls.dateAuthorisedToTreatingDoctor.value) : null;
      this.treatingDoctorPreAuth.preAuthIcd10Codes = iCD10CodeList as PreAuthIcd10Code[];
      this.treatingDoctorPreAuth.healthCareProviderId = this.healthCareProvider.rolePlayerId;
      this.treatingDoctorPreAuth.healthCareProviderName = this.healthCareProvider.name;
      this.treatingDoctorPreAuth.practiceNumber = this.healthCareProvider.practiceNumber;
      this.treatingDoctorPreAuth.preAuthorisationBreakdowns = preauthBreakdownList;
      this.treatingDoctorPreAuth.preAuthStatus = PreAuthStatus.PendingReview;

      if (!isNullOrUndefined(this.model.subPreAuthorisations) && this.model.subPreAuthorisations !== undefined) {
        let subPreAuthorisationsListCurrent = this.model.subPreAuthorisations.filter(({ preAuthType }) => preAuthType !== this.treatingDoctorPreAuth.preAuthType);
        this.model.subPreAuthorisations = subPreAuthorisationsListCurrent;
        this.model.subPreAuthorisations.push(this.treatingDoctorPreAuth);
        this.treatingDoctorPreAuth.preAuthorisationBreakdowns.forEach(breakdownItemCurrent => {
          if (!isNullOrUndefined(breakdownItemCurrent.treatmentCode)) {
            let hasCurrentTreatmentCode = false;
            this.model.preAuthorisationBreakdowns.forEach(hospitalBreakdownItemCurrent => {
              if (hospitalBreakdownItemCurrent.treatmentCode == breakdownItemCurrent.treatmentCode) {
                hasCurrentTreatmentCode = true;
              }
            });

            if (!hasCurrentTreatmentCode) {
              let preAuthorisationBreakdownNew = new PreAuthorisationBreakdown;
              preAuthorisationBreakdownNew.tariffId = 0;
              preAuthorisationBreakdownNew.treatmentCode = breakdownItemCurrent.treatmentCode;
              preAuthorisationBreakdownNew.tariffDescription = '';
              preAuthorisationBreakdownNew.requestedTreatments = 0;
              preAuthorisationBreakdownNew.medicalItemId = 0;
              preAuthorisationBreakdownNew.treatmentCodeId = breakdownItemCurrent.treatmentCodeId;
              preAuthorisationBreakdownNew.dateAuthorisedFrom = breakdownItemCurrent.dateAuthorisedFrom;
              preAuthorisationBreakdownNew.dateAuthorisedTo = breakdownItemCurrent.dateAuthorisedTo;
              preAuthorisationBreakdownNew.authorisedTreatments = 0;
              preAuthorisationBreakdownNew.requestedAmount = 0;
              preAuthorisationBreakdownNew.authorisedAmount = 0;
              preAuthorisationBreakdownNew.isAuthorised = false;
              preAuthorisationBreakdownNew.authorisedReason = "";
              preAuthorisationBreakdownNew.isRejected = false;
              preAuthorisationBreakdownNew.rejectedReason = "";
              preAuthorisationBreakdownNew.reviewComments = "";
              preAuthorisationBreakdownNew.solId = 0;
              preAuthorisationBreakdownNew.tariffAmount = 0;
              preAuthorisationBreakdownNew.isClinicalUpdate = false;
              this.model.preAuthorisationBreakdowns.push(preAuthorisationBreakdownNew);
            }
          }
        });
      }
      else {
        this.model.subPreAuthorisations = [];
        this.model.subPreAuthorisations.push(this.treatingDoctorPreAuth);
      }

    }
  }

  resetForm(): void {
    this.form.reset();
    this.healthcareProviderSearch.form.reset();
    this.preAuthBreakdown.resetForm();
  }

  fromDateChange(event: any) {
    if (event) {
      let fromDate = new Date(event.value);
      let authFromDate = new Date(this.model.dateAuthorisedFrom);
      let authToDate = new Date(this.model.dateAuthorisedTo);
      if (authFromDate > fromDate || authToDate < fromDate) {
        this.confirmservice.confirmWithoutContainer('Treatment Date Validation', `Treatment From Date shouldn't be prior or after the Auth From and To Date.`,
          'Center', 'Center', 'OK').subscribe(result => {

          });
        this.form.controls.dateAuthorisedFromTreatingDoctor.setValue(null);
      }
      else {
        this.preauthBreakdownComponent.setAuthorisationDates(fromDate, undefined);
      }
    }
  }

  toDateChange(event: any) {
    if (event) {
      let toDate = new Date(event.value);
      let authFromDate = new Date(this.model.dateAuthorisedFrom);
      let authToDate = new Date(this.model.dateAuthorisedTo);
      if (authFromDate > toDate || authToDate < toDate) {
        this.confirmservice.confirmWithoutContainer('Treatment Date Validation', `Treatment To Date shouldn't be prior or after the Auth From and To Date.`,
          'Center', 'Center', 'OK').subscribe(result => {

          });
        this.form.controls.dateAuthorisedToTreatingDoctor.setValue(null);
      }
      else {
        this.preauthBreakdownComponent.setAuthorisationDates(undefined, toDate);
      }
    }
  }

}



