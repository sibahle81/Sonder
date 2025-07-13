import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { IntegrationService } from 'projects/digicare/src/app/digi-manager/services/integration.service';
import { ClaimSearchRequest } from 'projects/digicare/src/app/digi-manager/models/shared/claim-search/claim-search-request';
import { PersonEvent } from 'projects/digicare/src/app/digi-manager/models/shared/claim-search/claim-search-response';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import DateUtility from 'projects/digicare/src/app/digi-manager/Utility/DateUtility';
import { ReportFormType } from 'projects/digicare/src/app/digi-manager/Utility/report-form-type.util';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';

@Component({
  selector: 'claim-search',
  templateUrl: './claim-search.component.html',
  styleUrls: ['./claim-search.component.css']
})

export class ClaimSearchComponent extends WizardDetailBaseComponent<ProgressMedicalReportForm> {

  form: UntypedFormGroup;
  showSearchProgress = false;
  disabled = true;
  personEvent: PersonEvent;
  medicalReportCategories: any;
  isLoadingCategories = false;
  cellNumberPlaceholder = ConstantPlaceholder.cellNumberPlaceholder;
  cellNumberPrefix = ConstantPlaceholder.cellNumberPrefix;
  cellNumberFormat = ConstantPlaceholder.cellNumberFormat;
  claimNumberErrorMessage: string;
  isNextReviewDateApplicable = true;
  showDateOfNextReview = true;
  systemSourceList = [
    { name: 'CompCare', id: 1 },
    { name: 'Modernisation', id: 2 }
  ];
  selectedItem = this.systemSourceList[0].id;
  @Input() selectSystemSource: string;

  postData: ClaimSearchRequest = {
    request: {
      claimReferenceNo: '',
      sourceSystemReference: Guid.create().toString(),
      sourceSystemRoutingID: 'digicare',
      medicalReportSystemSourceId: 1
    }
  };

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private readonly integrationService: IntegrationService,
    private readonly lookupService: LookupService,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnInit(): void {
    this.createForm();
    this.getMedicalReportCategories();
    const reportType = ReportFormType.getReportFormType();
    if (reportType === null) {
      ReportFormType.setReportFormType(this.context.wizard.wizardConfiguration.displayName);
    }
    if (reportType != null && reportType.toLocaleLowerCase().indexOf('final') < 0) {
      this.showDateOfNextReview = true;
    } else {
      this.isNextReviewDateApplicable = false;
    }
  }

  onLoadLookups(): void {

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOfConsultation = new Date(this.form.get('dateOfConsultation').value);
    dateOfConsultation.setHours(0, 0, 0, 0);

    const eventDate = new Date(this.form.get('eventDate').value);
    eventDate.setHours(0, 0, 0, 0);

    const dateOfNextReview = new Date(this.form.get('dateOfNextReview').value);
    dateOfNextReview.setHours(0, 0, 0, 0);

    if (!this.form.get('reportCategoryId').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Report catergory is required`);
    }

    if (dateOfConsultation > today) {
      this.form.get('dateOfConsultation').setErrors({ max: true });
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Consultation date cannot be in the future');
    }

    if (eventDate > dateOfConsultation) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Consultation date cannot be prior to event date');
    }

    if (eventDate > dateOfNextReview) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Next review date cannot be prior to event date');
    }

    if (dateOfNextReview.getTime() == dateOfConsultation.getTime()) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('Next review date cannot be the same as the consultation date');
    }

    if (!this.form.get('claimNumber').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Claim number is required`);
    }

    if (!this.form.get('dateOfConsultation').value) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Consultation date is required`);
    }

    const reportType = ReportFormType.getReportFormType();

    if (this.isNextReviewDateApplicable && !this.form.get('dateOfNextReview').value && !(reportType.toLocaleLowerCase().indexOf('final') > -1)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Next review date is required`);
    }

    if (dateOfNextReview < dateOfConsultation) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Next review date must come after consultation date`);
    }

    if (this.form.get('gender').value === 'Unspecified') {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`Gender is required`);
    }

    if (!!this.claimNumberErrorMessage) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(this.claimNumberErrorMessage);
    }
    this.validCellNumberRequired('cellNumber', 'A valid cell number is required', validationResult);

    return validationResult;
  }

  validCellNumberRequired(textControlName: string, message: string, validationResult: ValidationResult) {
    if (textControlName == null || this.form.get(textControlName).value == null || this.form.get(textControlName).value === '') { return; }

    const cellNumberRegex =
      new RegExp(/^([0]\d{2})([- ]*)(\d{3})([- )]*)(\d{4})$/);

    if (!cellNumberRegex.test(this.form.get(textControlName).value)) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push(`${message}`);
    }
  }

  populateForm(): void {
    if (this.model.medicalReportForm == undefined) { return; }
    const form = this.form.controls;
    const modelMedicalReportForm = this.model.medicalReportForm;
    const selectedId = modelMedicalReportForm.medicalReportSystemSource === 0 ? 0 : modelMedicalReportForm.medicalReportSystemSource - 1;
    this.selectedItem = this.systemSourceList[selectedId].id;

    form.firstName.setValue(modelMedicalReportForm.name);
    form.lastName.setValue(modelMedicalReportForm.surname);
    if (new Date(modelMedicalReportForm.dateOfBirth) > DateUtility.minDate()) {
      form.dateOfBirth.setValue(modelMedicalReportForm.dateOfBirth);
    }

    form.fileRefNumber.setValue(modelMedicalReportForm.claimReferenceNumber);
    if (new Date(modelMedicalReportForm.eventDate) > DateUtility.minDate()) {
      form.eventDate.setValue(modelMedicalReportForm.eventDate);
    }

    form.employerName.setValue(modelMedicalReportForm.employerName);
    form.industryNumber.setValue(modelMedicalReportForm.industryNumber);
    form.occupation.setValue(modelMedicalReportForm.claimantOccupation);
    if (!modelMedicalReportForm.gender) { form.gender.setValue('Unspecified'); } else { form.gender.setValue(modelMedicalReportForm.gender); }
    form.cellNumber.setValue(modelMedicalReportForm.contactNumber);
    form.claimNumber.setValue(modelMedicalReportForm.claimReferenceNumber);
    form.reportCategoryId.setValue(modelMedicalReportForm.reportCategoryId);
    if (new Date(modelMedicalReportForm.consultationDate) > DateUtility.minDate()) {
      form.dateOfConsultation.setValue(modelMedicalReportForm.consultationDate);
    }
    if (modelMedicalReportForm.nextReviewDate != null && new Date(modelMedicalReportForm.nextReviewDate) > DateUtility.minDate()) {
      this.isNextReviewDateApplicable = true;
      form.dateOfNextReview.setValue(modelMedicalReportForm.nextReviewDate);
    }

    form.claimId.setValue(modelMedicalReportForm.claimId);
    form.personEventId.setValue(modelMedicalReportForm.personEventId);
    form.eventCategoryId.setValue(modelMedicalReportForm.eventCategoryId);

    if (modelMedicalReportForm.reportTypeId > 0) {
      if (modelMedicalReportForm.reportTypeId == MedicalFormReportTypeEnum.FinalAccidentMedicalReport
        || modelMedicalReportForm.reportTypeId == MedicalFormReportTypeEnum.FinalDiseaseMedicalReport) {
        this.showDateOfNextReview = false;
      } else {
        this.showDateOfNextReview = true;
      }
    }
  }

  search(): void {
    this.form.controls.gender.markAsTouched();
    this.form.controls.claimNumber.markAsTouched();
    this.form.controls.dateOfConsultation.markAsTouched();
    const formModel = this.form.getRawValue();

    if (formModel.claimNumber != '' && formModel.claimNumber.length > 6) {
      this.showSearchProgress = true;
      this.postData.request.claimReferenceNo = formModel.claimNumber;
      this.postData.request.medicalReportSystemSourceId = formModel.medicalReportSystemSourceList;

      this.integrationService.getClaimSearchResponse(this.postData).subscribe((res) => {
        if (res.response.personEvents && res.response.personEvents.length > 0) {
          this.personEvent = res.response.personEvents[0];
          if (!this.form) {
            this.createForm();
          }

          if (formModel.medicalReportSystemSourceList !== SourceSystemEnum.Modernisation) {
            if (ReportFormType.reportEventCategoryType() !== res.response.personEvents[0].eventCategoryID) {
              const reportType = ReportFormType.reportEventCategoryType() === 1 ? 'accident' : 'disease';
              this.claimNumberErrorMessage = reportType !== 'accident'
                ? 'An accident claim number cannot be used on a disease form'
                : 'A disease claim number cannot be used on a accident form';
            } else {
              this.claimNumberErrorMessage = undefined;
            }
          } else {
            if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstAccidentMedicalReport && res.response.personEvents[0].eventCategoryID !== EventTypeEnum.Accident) {
              this.claimNumberErrorMessage = 'A disease claim number cannot be used on a accident form';
            } else if (this.model.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstDiseaseMedicalReport && res.response.personEvents[0].eventCategoryID !== EventTypeEnum.Disease) {
              this.claimNumberErrorMessage = 'An accident claim number cannot be used on a disease form';
            } else {
              this.claimNumberErrorMessage = undefined;
            }
          }

          this.form.patchValue({
            claimId: this.personEvent.claimID,
            firstName: this.personEvent.firstName,
            lastName: this.personEvent.lastName,
            dateOfBirth: this.personEvent.dateOfBirth,
            gender: this.personEvent.gender,
            fileRefNumber: this.personEvent.fileRefNumber,
            eventDate: this.personEvent.eventDate,
            employerName: this.personEvent.employerName,
            industryNumber: this.personEvent.industryNumber,
            occupation: this.personEvent.occupation,
            personEventId: this.personEvent.personEventID,
            eventCategoryId: this.personEvent.eventCategoryID,

          });
        } else if (res.response.message && res.response.message.length > 0) {
          this.alertService.error(res.response.message);
        } else {
          this.clearForm();
          this.alertService.error('Claim number not found');
        }
        this.showSearchProgress = false;
      });
    }
  }

  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.medicalReportForm.name = formModel.firstName;
    this.model.medicalReportForm.surname = formModel.lastName;
    this.model.medicalReportForm.gender = formModel.gender;
    this.model.medicalReportForm.claimReferenceNumber = formModel.fileRefNumber;
    this.model.medicalReportForm.claimId = formModel.claimId;
    this.model.medicalReportForm.medicalReportSystemSource = formModel.medicalReportSystemSourceList;
    this.model.medicalReportForm.personEventId = formModel.personEventId;
    this.model.medicalReportForm.eventCategoryId = formModel.eventCategoryId;
    this.model.medicalReportForm.eventDate = DateUtility.getDate(formModel.eventDate);
    this.model.medicalReportForm.dateOfBirth = DateUtility.getDate(formModel.dateOfBirth);
    this.model.medicalReportForm.contactNumber = formModel.cellNumber;
    this.model.medicalReportForm.industryNumber = formModel.industryNumber;
    this.model.medicalReportForm.employerName = formModel.employerName;
    this.model.medicalReportForm.claimantOccupation = formModel.occupation;
    this.model.medicalReportForm.consultationDate = DateUtility.getDate(formModel.dateOfConsultation);
    this.model.medicalReportForm.nextReviewDate = DateUtility.getDate(formModel.dateOfNextReview);
    this.model.medicalReportForm.reportCategoryId = formModel.reportCategoryId;
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      claimNumber: new UntypedFormControl('', [Validators.minLength(7)]),
      claimId: new UntypedFormControl(''),
      medicalReportSystemSource: new UntypedFormControl(''),
      medicalReportSystemSourceList: new UntypedFormControl(''),
      firstName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      lastName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      dateOfBirth: new UntypedFormControl({ value: '', disabled: this.disabled }),
      fileRefNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      eventDate: new UntypedFormControl({ value: '', disabled: this.disabled }),
      employerName: new UntypedFormControl({ value: '', disabled: this.disabled }),
      industryNumber: new UntypedFormControl({ value: '', disabled: this.disabled }),
      occupation: new UntypedFormControl({ value: '', disabled: this.disabled }),
      gender: new UntypedFormControl({ value: 'Unspecified', disabled: this.disabled }),
      personEventId: new UntypedFormControl(''),
      eventCategoryId: new UntypedFormControl(''),
      cellNumber: new UntypedFormControl(''),
      dateOfConsultation: new UntypedFormControl(''),
      chkNextReviewDateApplicable: new UntypedFormControl(''),
      dateOfNextReview: new UntypedFormControl(''),
      reportCategoryId: new UntypedFormControl('')
    });
  }

  clearForm(): void {
    this.form.patchValue({
      claimId: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      fileRefNumber: '',
      eventDate: '',
      employerName: '',
      industryNumber: '',
      occupation: '',
      gender: '',
      personEventId: '',
      eventCategoryId: ''
    });
  }

  getMedicalReportCategories(): void {
    this.isLoadingCategories = true;
    this.medicalReportCategories = [];

    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;
      this.isLoadingCategories = false;
    });

  }

  onKeypressEvent(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) {
      // invalid character, prevent input
      event.preventDefault();
    }
    if (event.currentTarget.value && (event.currentTarget.value.length == 3 || event.currentTarget.value.length == 7)) {
      event.currentTarget.value = event.currentTarget.value + '-';
    }
  }

  checkNextReviewDateApplicable(event: any) {
    if (event.checked) {
      this.isNextReviewDateApplicable = true;
    } else {
      this.isNextReviewDateApplicable = false;
      const form = this.form.controls;
      form.dateOfNextReview.setValue('');
    }
  }
}
