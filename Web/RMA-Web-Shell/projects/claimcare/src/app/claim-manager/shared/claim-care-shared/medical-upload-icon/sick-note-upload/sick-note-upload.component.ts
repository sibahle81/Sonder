import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { EventModel } from '../../../entities/personEvent/event.model';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { MatDialog } from '@angular/material/dialog';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { DatePipe } from '@angular/common';
import { AccidentService } from '../../../../Services/accident.service';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimRequirementService } from '../../../../Services/claim-requirement.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { InjurySeverityTypeEnum } from '../../../enums/injury-severity-type-enum';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-range.validator';
import { MatRadioChange } from '@angular/material/radio';
import { Constants } from 'projects/claimcare/src/app/constants';

@Component({
  selector: 'sick-note-upload',
  templateUrl: './sick-note-upload.component.html',
  styleUrls: ['./sick-note-upload.component.css']
})
export class SickNoteUploadComponent extends UnSubscribe implements OnChanges {
  @Input() personEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;

  @Output() emitDocument: EventEmitter<FirstMedicalReportForm> = new EventEmitter();
  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  claimMedicalDocuments = DocumentSetEnum.ClaimMedicalDocuments;
  sickNoteReportEnum: DocumentTypeEnum[] = [DocumentTypeEnum.SickNoteReport];

  form: UntypedFormGroup;
  userHealthCareProviders: HealthCareProvider[];
  filteredUserHealthCareProviders: HealthCareProvider[];

  startDate = new Date();
  minDate = new Date();
  reviewDateMin = new Date();
  nextReviewSelected = false;
  isPreExistingConditionSelected = false;
  isUnfitForWorkSelected = false;

  bodySides: Lookup[];
  severities: Lookup[];
  medicalReportCategories: Lookup[];

  selectedICDCodes: ICD10Code[] = [];
  firstMedicalReportForm: FirstMedicalReportForm;

  documentUploadStatus = DocumentStatusEnum.Accepted;
  documentType: DocumentType;
  documentUploaded = false;
  documentsEmitted: GenericDocument[];

  reportDate: Date;
  selectedHealthCareProvider: HealthCareProvider;
  isIcdCodeListFormPristine: boolean;

  constructor(
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    public readonly datePipeService: DatePipe,
    private readonly accidentService: AccidentService,
    public healthcareProviderService: HealthcareProviderService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly claimRequirementService: ClaimRequirementService,
    private readonly alertService: ToastrManager,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookUps();
  }

  getLookUps() {
    this.getSeverities();
  }
  
  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;
      this.getBodySides();
    });
  }

  getBodySides() {
    this.lookupService.getBodySides().subscribe(bodySides => {
      this.bodySides = bodySides;
      this.getMedicalReportCategories();
    });
  }

  getMedicalReportCategories(): void {
    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;

      if (this.personEvent && this.event && this.personEvent.firstMedicalReport && this.personEvent.firstMedicalReport.medicalReportForm.reportTypeId == +MedicalFormReportTypeEnum.SickNoteMedicalReport) {
        this.getHealthCareProvider(this.personEvent.firstMedicalReport.medicalReportForm.healthcareProviderId);
      } else {
        this.createForm();
      }
    });
  }

  getHealthCareProvider(healthCareProviderId: number) {
    this.healthcareProviderService.getHealthCareProviderById(healthCareProviderId).subscribe(result => {
      if (result) {
        this.selectedHealthCareProvider = result;
        this.createForm();
      }
    });
  }

  createForm() {
    if (this.form) { return; }

    this.minDate = this.event && this.event.eventDate ? new Date(this.event.eventDate).getCorrectUCTDate() : new Date();
    this.form = this.formBuilder.group({
      medicalReportCategory: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      dateOfConsultation: [{ value: '', disabled: this.isReadOnly }, [Validators.required, DateValidator.checkIfDateLessThan('dateOfConsultation', this.datePipeService.transform(this.event.eventDate, Constants.dateString))]],
      bodySide: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      severity: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      reportDate: [{ value: new Date(), disabled: true }],
      healthcareProviderPracticeNumber: [{ value: '', disabled: true }, [Validators.required]],
      healthcareProviderName: [{ value: '', disabled: true }, [Validators.required]],
      nextReviewDateApplicable: [{ value: '', disabled: this.isReadOnly }],
      dateOfNextReview: [{ value: '', disabled: this.isReadOnly }],
      clinicalDescription: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      mechanismOfInjury: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      isInjuryMechanismConsistent: [{ value: '', disabled: this.isReadOnly }],
      isPreExistingConditions: [{ value: '', disabled: this.isReadOnly }],
      preExistingConditions: [{ value: '', disabled: this.isReadOnly }],
      lastDayOff: [{ value: '', disabled: this.isReadOnly }],
      firstDayOff: [{ value: '', disabled: this.isReadOnly }],
      isUnfitForWork: [{ value: '', disabled: this.isReadOnly }],
      estimatedDaysOff: [{ value: '', disabled: true }],
    });

    if (this.personEvent.firstMedicalReport && this.personEvent.firstMedicalReport.medicalReportForm.reportTypeId == +MedicalFormReportTypeEnum.SickNoteMedicalReport) {
      this.firstMedicalReportForm = this.personEvent.firstMedicalReport;
      this.patchForm(this.personEvent.firstMedicalReport);
    } else {
      this.firstMedicalReportForm = new FirstMedicalReportForm();
      this.firstMedicalReportForm.medicalReportForm = new MedicalReportForm();
    }

    const icd10CodesJson = (this.personEvent.firstMedicalReport && this.personEvent.firstMedicalReport.medicalReportForm.reportTypeId == +MedicalFormReportTypeEnum.SickNoteMedicalReport) ? JSON.parse(this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson) : undefined;

    if (icd10CodesJson && icd10CodesJson[0].severity) {
    } else if (this.personEvent && this.personEvent.physicalDamages.length > 0) {
      this.form.get('severity').setValue(+InjurySeverityTypeEnum.Mild);
    }

    this.isLoading$.next(false);
  }


  consultationDateChange($event: any) {
    this.reviewDateMin = $event.value;
  }

  setHealthCareProviderDetails() {
    this.form.patchValue({
      healthcareProviderPracticeNumber: this.selectedHealthCareProvider.practiceNumber,
      healthcareProviderName: this.selectedHealthCareProvider.name,
    });

    if (this.form.valid) {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
    this.isLoading$.next(false);
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();
    this.saveMedicalReport();
  }

  saveMedicalReport() {
    this.firstMedicalReportForm.medicalReportForm.documentId = this.documentsEmitted[0].id;
    this.firstMedicalReportForm.medicalReportForm.personEventId = this.personEvent.personEventId;
    this.firstMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.SickNoteMedicalReport;

    if (this.firstMedicalReportForm.firstMedicalReportFormId == null) {
      this.firstMedicalReportForm.medicalReportForm.documentStatusId = DocumentStatusEnum.Received;
    }

    if (!this.isWizard) {
      this.accidentService.ValidateFirstMedicalReport(this.firstMedicalReportForm).subscribe((result) => {
        if (result) {
          this.personEvent.firstMedicalReport = result;
          if (this.personEvent.claims?.length > 0) {
            this.updateClaimEstimates();
          } else {
            this.emitDocument.emit(this.personEvent.firstMedicalReport);
            this.isLoading$.next(false);
          }
        }
      });
    }
    else {
      this.personEvent.firstMedicalReport = this.firstMedicalReportForm;
      this.emitDocument.emit(this.firstMedicalReportForm);
      this.isLoading$.next(false);
    }
  }

  updateClaimEstimates() {
    this.loadingMessage$.next('updating estimates...please wait');
    this.claimInvoiceService.recalculateAllClaimEstimates(this.personEvent, true).subscribe(result => {
      this.alertService.successToastr('Estimates updated successfully...');
      this.emitDocument.emit(this.personEvent.firstMedicalReport);
      this.isLoading$.next(false);
    });
  }

  checkIfDocumentUploaded(genericDocument: GenericDocument) {
    this.claimRequirementService.getRequirementByDocumentTypeId(this.personEvent.personEventId, genericDocument.documentType).subscribe(results => {
      if (results && results.dateClosed == null) {
        results.dateClosed = new Date();
        this.claimRequirementService.updatePersonEventClaimRequirement(results).subscribe(results => {
          if (results) {
            this.refreshEmit(true);
          }
        });
      }
    })
  }

  refreshEmit($event: boolean) {
    this.refreshClaimEmit.emit(true);
  }

  allDocumentsEmitted($event: GenericDocument[]) {
    this.documentsEmitted = $event;
  }

  cancel() {
    this.emitDocument.emit(null);
  }

  readForm(): FirstMedicalReportForm {
    this.firstMedicalReportForm.medicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    this.firstMedicalReportForm.medicalReportForm.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    this.firstMedicalReportForm.medicalReportForm.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    this.firstMedicalReportForm.medicalReportForm.nextReviewDate = this.form.controls.dateOfNextReview.value ? this.form.controls.dateOfNextReview.value : null;
    this.firstMedicalReportForm.medicalReportForm.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    this.firstMedicalReportForm.medicalReportForm.healthcareProviderId = this.selectedHealthCareProvider ? this.selectedHealthCareProvider.rolePlayerId : null;
    this.firstMedicalReportForm.medicalReportForm.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    this.firstMedicalReportForm.medicalReportForm.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;


    let codes = '';
    const simplifiedCodes = [];

    for (const x of this.selectedICDCodes) {

      codes = codes + (codes.length > 0 ? `, ${x.icd10Code}` : x.icd10Code);
      const simplifiedCode = new ICD10CodeModel();

      simplifiedCode.icd10Code = x.icd10Code;
      simplifiedCode.icd10CodeId = x.icd10CodeId;
      simplifiedCode.icd10CodeDescription = x.icd10CodeDescription;
      simplifiedCode.bodySideAffected = +this.form.controls.bodySide.value;
      simplifiedCode.severity = +this.form.controls.severity.value;
      simplifiedCode.icd10DiagnosticGroupId = x.icd10DiagnosticGroupId;
      simplifiedCode.icd10CategoryId = x.icd10CategoryId;
      simplifiedCode.icd10SubCategoryId = x.icd10SubCategoryId;

      simplifiedCodes.push(simplifiedCode);
    }

    this.firstMedicalReportForm.medicalReportForm.icd10Codes = codes ? codes : null;
    this.firstMedicalReportForm.medicalReportForm.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;
    this.firstMedicalReportForm.clinicalDescription = this.form.controls.clinicalDescription.value ? this.form.controls.clinicalDescription.value : null;
    this.firstMedicalReportForm.mechanismOfInjury = this.form.controls.mechanismOfInjury.value ? this.form.controls.mechanismOfInjury.value : null;
    this.firstMedicalReportForm.isInjuryMechanismConsistent = this.form.controls.isInjuryMechanismConsistent.value ? this.form.controls.isInjuryMechanismConsistent.value : false;
    this.firstMedicalReportForm.isPreExistingConditions = this.form.controls.isPreExistingConditions.value ? this.form.controls.isPreExistingConditions.value : false;
    this.firstMedicalReportForm.preExistingConditions = this.form.controls.preExistingConditions.value ? this.form.controls.preExistingConditions.value : null;

    if (this.isUnfitForWorkSelected == true || this.form.controls.isUnfitForWork.value && this.form.controls.isUnfitForWork.value === 'Yes') {
      this.firstMedicalReportForm.lastDayOff = this.form.controls.lastDayOff.value ? this.form.controls.lastDayOff.value : null;
      this.firstMedicalReportForm.firstDayOff = this.form.controls.firstDayOff.value ? this.form.controls.firstDayOff.value : null;
      this.firstMedicalReportForm.estimatedDaysOff = this.form.controls.estimatedDaysOff.value ? this.form.controls.estimatedDaysOff.value : null;
    }

    return this.firstMedicalReportForm;
  }

  processFirstLastDate() {
    let formValue1 = new Date(this.form.get('firstDayOff').value);
    let formValue2 = new Date(this.form.get('lastDayOff').value);

    var date1 = new Date(formValue1);
    var date2 = new Date(formValue2);

    if (formValue1 && formValue2) {
      var days = Math.floor((Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate()) - Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) / (1000 * 60 * 60 * 24)) + 1;
      this.form.get('estimatedDaysOff').setValue(days);
    }
  }

  nextReviewDateApplicableChecked(event: MatCheckboxChange) {
    this.nextReviewSelected = event.checked;
    const validators = [Validators.required, DateRangeValidator.endAfterStart('dateOfConsultation')];
    if (this.nextReviewSelected) {
      this.applyValidationToFormControl(this.form, validators, 'dateOfNextReview');
    } else {
      this.clearValidationToFormControl(this.form, 'dateOfNextReview');
    }
  }

  isUnfitForWorkChange(mrChange: MatRadioChange) {
    const firstValidators = [Validators.required, DateValidator.checkIfDateLessThan('firstDayOff', this.datePipeService.transform(this.event.eventDate, Constants.dateString))];
    const lastValidators = [Validators.required, DateRangeValidator.endAfterStart('firstDayOff')];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, firstValidators, 'firstDayOff');
      this.applyValidationToFormControl(this.form, lastValidators, 'lastDayOff');
    } else {
      this.clearValidationToFormControl(this.form, 'firstDayOff');
      this.clearValidationToFormControl(this.form, 'lastDayOff');
    }
  }

  patchForm(medicalReport: FirstMedicalReportForm) {
    if (medicalReport) {
      const icd10CodesJson = JSON.parse(medicalReport.medicalReportForm.icd10CodesJson);
      this.form.patchValue({
        medicalReportCategory: medicalReport.medicalReportForm.reportCategoryId ? medicalReport.medicalReportForm.reportCategoryId : null,
        dateOfConsultation: medicalReport.medicalReportForm.consultationDate ? medicalReport.medicalReportForm.consultationDate : null,
        nextReviewDateApplicable: medicalReport.medicalReportForm.nextReviewDate ? true : false,
        dateOfNextReview: medicalReport.medicalReportForm.reportCategoryId ? medicalReport.medicalReportForm.nextReviewDate : null,
        bodySide: icd10CodesJson[0].bodySideAffected ? icd10CodesJson[0].bodySideAffected : null,
        severity: icd10CodesJson[0].severity ? icd10CodesJson[0].severity : null,
        reportDate: medicalReport.medicalReportForm.reportDate ? medicalReport.medicalReportForm.reportDate : null,
        healthCareProvider: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
        healthcareProviderId: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
        healthcareProviderPracticeNumber: medicalReport.medicalReportForm.healthcareProviderPracticeNumber ? medicalReport.medicalReportForm.healthcareProviderPracticeNumber : null,
        healthcareProviderName: medicalReport.medicalReportForm.healthcareProviderName ? medicalReport.medicalReportForm.healthcareProviderName : null,
        clinicalDescription: medicalReport.clinicalDescription ? medicalReport.clinicalDescription : null,
        mechanismOfInjury: medicalReport.mechanismOfInjury ? medicalReport.mechanismOfInjury : null,
        isInjuryMechanismConsistent: medicalReport.isInjuryMechanismConsistent ? medicalReport.isInjuryMechanismConsistent : false,
        isPreExistingConditions: medicalReport.isPreExistingConditions ? medicalReport.isPreExistingConditions : null,
        preExistingConditions: medicalReport.preExistingConditions ? medicalReport.preExistingConditions : null,
        firstDayOff: medicalReport.firstDayOff ? medicalReport.firstDayOff : null,
        lastDayOff: medicalReport.lastDayOff ? medicalReport.lastDayOff : null,
        estimatedDaysOff: medicalReport.estimatedDaysOff ? medicalReport.estimatedDaysOff : null
      });

      if (medicalReport.estimatedDaysOff) {
        this.isUnfitForWorkSelected = true;
        this.form.patchValue({ isUnfitForWork: 'Yes' });
      }

      if (medicalReport.isPreExistingConditions) {
        this.isPreExistingConditionSelected = true;
      }

      if (medicalReport.medicalReportForm.nextReviewDate) {
        this.nextReviewSelected = true;
      }

      if (this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson) {
        const icd10CodesJson = JSON.parse(this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson);
        icd10CodesJson.forEach(e => {

          const icd10Code = new ICD10Code();
          icd10Code.icd10Code = e.icd10Code;
          icd10Code.icd10CodeDescription = e.icd10CodeDescription;
          icd10Code.icd10CodeId = e.icd10CodeId;
          icd10Code.icd10SubCategoryId = e.icd10SubCategoryId;
          icd10Code.icd10CategoryId = e.icd10CategoryId;
          icd10Code.icd10DiagnosticGroupId = e.icd10DiagnosticGroupId;

          this.selectedICDCodes.push(icd10Code);
        });
      }

      if (medicalReport.medicalReportForm.icd10Codes) {
        this.selectedICDCodes = [...this.selectedICDCodes];
      }
    }
  }

  onIsPreExistingConditionsChecked(event: MatCheckboxChange) {
    this.isPreExistingConditionSelected = event.checked;
    const validators = [Validators.required];
    if (this.isPreExistingConditionSelected) {
      this.applyValidationToFormControl(this.form, validators, 'preExistingConditions');
    } else {
      this.clearValidationToFormControl(this.form, 'preExistingConditions');
    }
  }

  clearValidationToFormControl(form: UntypedFormGroup, controlName: string) {
    form.get(controlName).clearValidators();
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(form: UntypedFormGroup, validationToApply: any, controlName: string) {
    form.get(controlName).setValidators(validationToApply);
    form.get(controlName).markAsTouched();
    form.get(controlName).updateValueAndValidity();
  }

  setHealthCareProvider($event: HealthCareProvider) {
    this.isLoading$.next(true);
    this.selectedHealthCareProvider = $event;
    this.setHealthCareProviderDetails();
  }

  resetHCPSearch() {
    this.selectedHealthCareProvider = null;
  }

  onIcdCodeListFormStatusChanged(status: boolean) {
    this.isIcdCodeListFormPristine = status;
    if (this.isIcdCodeListFormPristine == true && this.form.valid) {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
  }
}
