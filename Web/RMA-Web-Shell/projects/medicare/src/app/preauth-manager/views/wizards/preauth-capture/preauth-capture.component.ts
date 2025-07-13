import { Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { UntypedFormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from '../../../models/preauthorisation';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { DateCompareValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-compare-validator';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { DatePipe } from '@angular/common';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { FormValidation } from 'projects/shared-utilities-lib/src/lib/validators/form-validation';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { isNullOrUndefined } from 'util';
import { ProsthetistQuote } from '../../../models/prosthetistquote';
import { ProstheticQuotationTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/prosthetic-quotation-type-enum';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { ProstheticDocumentStates } from '../../../models/prosthetic-document-states';
import { PreAuthChronicMedicationList } from '../../../models/preauth-chronicmedicationlist';
import { CrudActionType } from 'projects/medicare/src/app/shared/enums/crud-action-type';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';

@Component({
  selector: 'preauth-capture',
  templateUrl: './preauth-capture.component.html',
  styleUrls: ['./preauth-capture.component.css'],
  providers: [MatFormFieldModule, MatDatepickerModule, MatInputModule, MatCheckboxModule]
})

export class PreAuthCaptureComponent extends WizardDetailBaseComponent<PreAuthorisation> {
  isInternalUser: boolean = true;
  isDuplicatePreAuth: boolean = false;
  authType: string;
  isTreatmentAuth: boolean = false;
  isInHospitalValue: boolean = undefined;
  prosthetistQuote: ProsthetistQuote;
  prostheticQuotationType: ProstheticQuotationTypeEnum = null;
  isChronicAuth: boolean = false;
  cmlOptions: any;
  cmlSelectedOptions: Array<number> = [];
  claimEventDate: Date | null;
  requiredDocumentsUploaded: boolean = false;
  checkMedicalProstheticOrthoticDocsOver2YrsNonPension: boolean = false;
  checkMedicalOrthoticDocsOver2YrsNonPension: boolean = false;
  checkMedicalProstheticDocsOver2YrsPension: boolean = false;
  selectedQuotationType: number = undefined;
  claimId: number = 0;
  prostheticDocumentStates: ProstheticDocumentStates;
  crudActionType: typeof CrudActionType = CrudActionType;
  isProstheticEdit: boolean = false;
  forceRequiredDocumentTypeFilter: DocumentTypeEnum[];
  currentUrl = this.activatedRoute.snapshot.params.type;
  linkedId: number;
  form: UntypedFormGroup;
  preAuthorisationList: any;

  populateForm(): void {
    if (!this.model) return
    const form = this.form.controls;
    const model = this.model;
    this.claimId = model.claimId;
    this.linkedId = model.preAuthId ? model.preAuthId : this.linkedId;
    this.prostheticQuotationType = model.prostheticQuotationType;
    this.claimEventDate = model.eventDate;
    this.isInHospitalValue = model.isInHospital;
    if (new Date(model.injuryDate) > DateUtility.minDate() && this.isInternalUser && !isNullOrUndefined(model.injuryDate))
      form.injuryDate.setValue(model?.injuryDate);
    form.motivation.setValue(model.requestComments);
    if (new Date(model.dateAuthorisedFrom) > DateUtility.minDate())
      form.dateAuthorisedFrom.setValue(model.dateAuthorisedFrom);
    if (new Date(model.dateAuthorisedTo) > DateUtility.minDate())
      form.dateAuthorisedTo.setValue(model.dateAuthorisedTo);
    form.isClaimReopeningRequest.setValue(model.isClaimReopeningRequest);
    form.isRehabilitationRequest.setValue(model.isRehabilitationRequest);
  }
  populateModel(): void {
    if (!this.model) return;
    const form = this.form.getRawValue();
    this.model.injuryDate = isNullOrUndefined(form.injuryDate)? null : DateUtility.getDate(form.injuryDate);
    this.model.requestComments = form.motivation;
    this.model.dateAuthorisedFrom = DateUtility.getDate(form.dateAuthorisedFrom);
    this.model.dateAuthorisedTo = DateUtility.getDate(form.dateAuthorisedTo);
    this.model.reviewComments = form.rejectPendComment;
    this.model.preAuthType = MedicareUtilities.getPreauthTypeEnumId(this.authType);
    this.model.isRequestFromHcp = !this.isInternalUser;
    this.model.preAuthStatus = PreAuthStatus.PendingReview;
    this.model.isInHospital = this.isInHospitalValue;
    this.model.prostheticQuotationType = this.prostheticQuotationType;
    this.model.preAuthChronicCMLs = this.cmlSelectedOptions;
    if (this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && !isNullOrUndefined(this.prosthetistQuote) && this.prosthetistQuote?.prosthetistQuoteId > 0) {
      this.model.prosthetistQuoteId = this.prosthetistQuote.prosthetistQuoteId
    }

    if(this.isTreatmentAuth)
    {
      this.model.isClaimReopeningRequest = form.isClaimReopeningRequest;
      this.model.isRehabilitationRequest = form.isRehabilitationRequest;
      this.model.isWoundCareTreatment = form.isWoundCareTreatment;
      this.model.isMedicationRequired = form.isMedicationRequired;
      this.form.controls.isClaimReopeningRequest.setValue(form.isClaimReopeningRequest);
      this.form.controls.isRehabilitationRequest.setValue(form.isRehabilitationRequest);
      this.form.controls.isWoundCareTreatment.setValue(form.isWoundCareTreatment);
      this.form.controls.isMedicationRequired.setValue(form.isMedicationRequired);
    }

   if(!this.isProstheticEdit){
    this.mediCarePreAuthService.isDuplicatePreAuth(this.model.personEventId, this.model.healthCareProviderId, this.datepipe.transform(this.model.dateAuthorisedFrom, 'yyyy-MM-dd'), this.datepipe.transform(this.model.dateAuthorisedTo, 'yyyy-MM-dd'))
      .subscribe(
        (result: boolean) => {
          this.isDuplicatePreAuth = result
        },
        (error) => {
        },
      );
    }
  }

  onChange(): void {
    this.populateModel();
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly userService: UserService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly claimCareService: ClaimCareService,
    private router: Router,
    public datepipe: DatePipe) {
    super(appEventsManager, authService, activatedRoute);
  }

  
  ngOnInit() {   
    this.linkedId = this.activatedRoute.snapshot.params.linkedId;
    this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);   
    if(this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment])
    {
      this.isTreatmentAuth = true;
    }
    else
    {
      this.isTreatmentAuth = false;
    }
    if(this.authType == PreauthTypeEnum[PreauthTypeEnum.ChronicMedication])
    {
      this.isChronicAuth = true;
    }
    else
    {
      this.isChronicAuth = false;
    }

    if(this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && MedicareUtilities.getCrudActionTypeEnumId(this.currentUrl) == CrudActionType.edit){
      this.isDuplicatePreAuth = false;
      this.isProstheticEdit = true;
    }   
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    this.createForm();
    FormValidation.markFormTouched(this.form);
    this.loadCmlOptions();
  }

  createForm(): void {
    if (this.form == undefined) {
      this.form = this.formBuilder.group({
        injuryDate: new UntypedFormControl(),
        dateAuthorisedFrom: new UntypedFormControl(),
        dateAuthorisedTo: new UntypedFormControl(),
        scriptRepeats: new UntypedFormControl(),
        motivation: new UntypedFormControl(),
        rejectPendComment: new UntypedFormControl(),
        isClaimReopeningRequest: new UntypedFormControl(),
        isRehabilitationRequest: new UntypedFormControl(),
        isWoundCareTreatment: new UntypedFormControl(),
        isMedicationRequired: new UntypedFormControl(),
        cmls: new UntypedFormArray([])
      });
    }
  }

  loadCmlOptions(){
    this.cmlOptions = [];
    this.mediCarePreAuthService.getChronicMedicationList().subscribe(
      (data: PreAuthChronicMedicationList[]) => {
       this.cmlOptions = data;
      }
    );
  }

  onCmlUpdate(event: any): void {
    this.cmlSelectedOptions=[];
    const cmls = <UntypedFormArray>this.form.get('cmls') as UntypedFormArray;  
    if(event.checked) {
      cmls.push(new UntypedFormControl(event.source.value))
    } else {
      const cmlOption = cmls.controls.findIndex(x => x.value === event.source.value);
      cmls.removeAt(cmlOption);
    }
    cmls.controls.forEach(x => this.cmlSelectedOptions.push(x.value));
  }

  onLoadLookups(): void {

  }

  ngAfterViewInit(): void {

  }

  ngAfterContentInit(): void {
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      var practitionerType = this.healthcareProviderService.preAuthPractitionerTypeSetting;
      var currentUser = this.authService.getCurrentUser();
      this.model.preAuthType = MedicareUtilities.getPreauthTypeEnumId(this.authType);
      const form = this.form.controls;
      if (!this.isInternalUser) {
        ReportFormValidationUtility.FieldRequired('injuryDate', 'Injury date ', this.form, validationResult);
        DateCompareValidator.compareDates(this.form.controls.injuryDate.value, new Date(), 'Injury date cannot be future date', validationResult);
      }

      if (currentUser.isInternalUser || practitionerType?.isHospital) {
        ReportFormValidationUtility.FieldRequired('dateAuthorisedFrom', 'Date authorised from', this.form, validationResult);
        ReportFormValidationUtility.FieldRequired('dateAuthorisedTo', 'Date authorised to', this.form, validationResult);
        ReportFormValidationUtility.FieldRequired('motivation', 'Motivation', this.form, validationResult);
        DateCompareValidator.compareDates(this.form.controls.dateAuthorisedFrom.value, this.form.controls.dateAuthorisedTo.value, 'Authorisation to date cannot be before the authorisation from date', validationResult);
        DateCompareValidator.compareDates(MedicareUtilities.formatDateIgnoreTime(new Date(this.form.controls.injuryDate.value)), this.form.controls.dateAuthorisedFrom.value, 'Authorisation from date cannot be before the date of injury', validationResult);
        DateCompareValidator.compareDates(MedicareUtilities.formatDateIgnoreTime(new Date(this.form.controls.injuryDate.value)), this.form.controls.dateAuthorisedTo.value, 'Authorisation to date cannot be before the date of injury', validationResult);
      }      

      DateCompareValidator.compareDates(MedicareUtilities.formatDateIgnoreTime(new Date(this.claimEventDate)),MedicareUtilities.formatDateIgnoreTime(new Date(this.form.controls.injuryDate.value)), 'Date of injury cannot be before Event Date', validationResult);
      
      if (this.isDuplicatePreAuth) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('Cannot capture Auth, duplicate Auth request found');
      }    

      if (isNullOrUndefined(this.model.isInHospital) && this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment]) {
        validationResult.errors = validationResult.errors + 1;
        validationResult?.errorMessages.push('To complete this, Please specify if this was In or Out of Hospital.*');
      }

      if (this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment] && !this.requiredDocumentsUploaded) {
        validationResult.errors += 1;
        validationResult?.errorMessages.push('Treatment authorization documents are required');
      }

      if (this.prostheticDocumentStates?.OrthoticDocsOver2YrsNonPension && !this.requiredDocumentsUploaded &&
        this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && !this.isInternalUser) {
        validationResult.errors = validationResult.errors + 1;
        validationResult?.errorMessages.push('To complete this, Please upload 2 required document (Quotation & Script or Doctors Referral).*');
      }
      else if (this.prostheticDocumentStates?.ProstheticOrthoticDocsOver2YrsNonPension && !this.requiredDocumentsUploaded &&
        this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && !this.isInternalUser) {
          validationResult.errors = validationResult.errors + 1;
          validationResult?.errorMessages.push('To complete this, Please upload 3 required document (Motivation Letter, Quotation & Script or Doctors Referral).*');
      }
      else if (this.prostheticDocumentStates?.ProstheticDocsOver2YrsPension && !this.requiredDocumentsUploaded &&
        this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && !this.isInternalUser) {
          validationResult.errors = validationResult.errors + 1;
          validationResult?.errorMessages.push('To complete this, Please upload 1 required document (Quotation).*');
      }
      else if(this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic] && isNullOrUndefined(this.prostheticDocumentStates?.selectedQuotationType)){
        validationResult.errors = validationResult.errors + 1;
        validationResult?.errorMessages.push('To complete this, Please specify the Quotation Type from dropdown');
      }

    }
    return validationResult;

  }

  getAuthorisationById(preAuthId: number): void {

    this.mediCarePreAuthService.getPreAuthorisationById(preAuthId).subscribe(
      (data: PreAuthorisation) => {
        this.form.patchValue({
          ...data,
        });
      }
    );
  }

  addPreAuthorisation(): void {
    const m = this.form.value as PreAuthorisation;
    this.mediCarePreAuthService.addPreAuthorisation(m).subscribe(
      data => {
        this.preAuthorisationList = data;
      }
    );

  }

  getPreAuthData(): UntypedFormGroup {
    return this.form as UntypedFormGroup;
  }

  resetForm(): void {
    this.form.reset();
  }

  getIsInHospitalSetValue(value) {
    this.isInHospitalValue = value;
  }

  getIsProstheticQuoteSelectedValue(value) {
    this.prosthetistQuote = value
  }

  isRequiredDocumentsUploaded($event) {
    this.requiredDocumentsUploaded = $event;
  }

  checkProstheticDocumentStates($event: ProstheticDocumentStates) {
    this.prostheticDocumentStates = $event;
    this.prostheticQuotationType = $event.selectedQuotationType;
  }

  treatmentAuthRequiredDocuments($event: DocumentTypeEnum[]) {
    this.forceRequiredDocumentTypeFilter = $event;
  }

}
