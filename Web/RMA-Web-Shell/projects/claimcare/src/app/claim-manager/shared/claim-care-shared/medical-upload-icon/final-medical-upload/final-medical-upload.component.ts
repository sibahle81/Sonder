import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AccidentService } from '../../../../Services/accident.service';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Constants } from 'projects/clientcare/src/app/constants';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'final-medical-upload',
  templateUrl: './final-medical-upload.component.html',
  styleUrls: ['./final-medical-upload.component.css']
})
export class FinalMedicalUploadComponent extends UnSubscribe implements OnChanges {
  @Input() personEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() currentQuery = '';
  @Input() selectedFinalMedicalReport: FinalMedicalReportForm;

  @Output() emitDocument: EventEmitter<FinalMedicalReportForm> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingHealthCare$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  documentSystemName = DocumentSystemNameEnum.WizardManager;
  claimMedicalDocuments = DocumentSetEnum.ClaimMedicalDocuments;
  finalMedicalReportEnum: DocumentTypeEnum[] = [DocumentTypeEnum.FinalMedicalReport];

  selectedHealthCareProvider: HealthCareProvider;
  
  form: UntypedFormGroup;
  userHealthCareProviders: HealthCareProvider[];
  filteredUserHealthCareProviders: HealthCareProvider[];
  minDate = new Date();
  startDate = new Date();
  maxDate = new Date();
  nextReviewSelected = false;
  isPreExistingConditionSelected = false;

  bodySides: Lookup[];
  severities: Lookup[];
  medicalReportCategories: Lookup[];

  showHealthCareProviders: boolean;
  selectedICDCodes: ICD10Code[] = [];
  finalMedicalReportForm: FinalMedicalReportForm;

  documentType: DocumentType;
  documentUploaded = false;
  documentsEmitted: GenericDocument[];
  reportDate: Date;
  isIcdCodeListFormPristine: boolean;

  constructor(
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public readonly datePipeService: DatePipe,
    private readonly accidentService: AccidentService,
    public healthcareProviderService: HealthcareProviderService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
  ) { 
    super();

  }

  getLookUps() {
    this.getSeverities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookUps();
  }



  createForm() {
    this.minDate = this.event && this.event.eventDate ? new Date(this.event.eventDate).getCorrectUCTDate() : new Date();
    
    this.form = this.formBuilder.group({
      medicalReportCategory: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      dateOfConsultation: [{ value: '', disabled: this.isReadOnly },
      [Validators.required, DateValidator.checkIfDateLessThan('dateOfConsultation', this.datePipeService.transform(this.event.eventDate, Constants.dateString))]],
      bodySide: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      severity: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      reportDate: [{ value: new Date(), disabled: true }],
      healthcareProviderPracticeNumber: [{ value: '', disabled: true }, [Validators.required]],
      healthcareProviderName: [{ value: '', disabled: true }, [Validators.required]],
      radioIsEventSoleContributorToDisablement: [{ value: '', disabled: this.isReadOnly }],
      radioIsConditionStabilised: [{ value: '', disabled: this.isReadOnly }, [Validators.required]],
      ctlContributingCauses: [{ value: '', disabled: this.isReadOnly }],
      ctlMechanismOfInjury: [{ value: '', disabled: this.isReadOnly }],
      ctlInjuryOrDiseaseDetails: [{ value: '', disabled: this.isReadOnly }],
      ctlImpairmentFindings: [{ value: '', disabled: this.isReadOnly }],
      ctlDateReturnToWork: [{ value: '', disabled: this.isReadOnly }, [DateValidator.checkIfDateLessThan('ctlDateReturnToWork', this.datePipeService.transform(this.event.eventDate, Constants.dateString))]],
      ctlDateStabilised: [{ value: '', disabled: this.isReadOnly }, [Validators.required, DateValidator.checkIfDateLessThan('ctlDateStabilised', this.datePipeService.transform(this.event.eventDate, Constants.dateString))]],
    });
    if (this.selectedFinalMedicalReport.finalMedicalReportFormId > 0) {
      this.finalMedicalReportForm = this.selectedFinalMedicalReport;
      this.patchForm(this.selectedFinalMedicalReport);
    }
    else {
      this.finalMedicalReportForm = new FinalMedicalReportForm();
      this.finalMedicalReportForm.medicalReportForm = new MedicalReportForm();
    }
    this.isLoading$.next(false);
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
  
      if (this.personEvent && this.event && this.selectedFinalMedicalReport.finalMedicalReportFormId > 0) {
        this.getHealthCareProvider(this.selectedFinalMedicalReport.medicalReportForm.healthcareProviderId);
      }
      else {
        this.createForm();
      }
    });
  }

  
  getHealthCareProvider(healthCareProviderId: number) {
    this.isLoading$.next(true);
    this.healthcareProviderService.getHealthCareProviderById(healthCareProviderId).subscribe(result => {
      if (result) {
        this.selectedHealthCareProvider = result;
        this.createForm();
      }
    });
  }

  emitIcd10CodeList($event) {
    this.selectedICDCodes = $event;
  }

  getUserHealthCareProviders(): void {
    const user = this.authService.getCurrentUser();
    this.healthcareProviderService.filterHealthCareProviders(user.email).subscribe(
      userHealthCareProviders => {
        if (userHealthCareProviders) {
          if (userHealthCareProviders.length === 1) {
            this.showHealthCareProviders = false;
            this.isLoadingHealthCare$.next(false);
          } else {
            this.showHealthCareProviders = true;
            this.userHealthCareProviders = userHealthCareProviders;
            this.filteredUserHealthCareProviders = userHealthCareProviders;
            this.isLoadingHealthCare$.next(false);
          }
        }
      }
    );
  }

  getUserHealthCareProvidersForInternalUser(searchCriteria: string): void {
    this.healthcareProviderService.filterHealthCareProviders(searchCriteria).subscribe(
      userHealthCareProviders => {
        if (userHealthCareProviders) {
          this.userHealthCareProviders = userHealthCareProviders;
          this.filteredUserHealthCareProviders = userHealthCareProviders;
          this.isLoadingHealthCare$.next(false);
        }
      }
    );
  }

  onNationalityKey(value) {
    this.filteredUserHealthCareProviders = this.dropDownSearch(value, 'healthCareProvider');
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();

    switch (name) {
      case 'healthCareProvider':
        return this.setData(filter, this.filteredUserHealthCareProviders, this.userHealthCareProviders);
    }
  }

  setData(filter: string, filteredList: HealthCareProvider[], originalList: HealthCareProvider[]) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(option => option.name.toLocaleLowerCase().includes(filter));
    }
  }


  save() {
    this.isLoading$.next(true);
    this.readForm();
    this.saveMedicalReport();
  }

  saveMedicalReport() {
    this.isLoading$.next(true);
    this.finalMedicalReportForm.medicalReportForm.personEventId = this.personEvent.personEventId;
    this.finalMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FinalAccidentMedicalReport;

    this.finalMedicalReportForm.medicalReportForm.documentStatusId = DocumentStatusEnum.Received;

    if (!this.isWizard) {
      this.accidentService.ValidateFinalMedicalReportSTP(this.finalMedicalReportForm).subscribe((result) => {
        if (result) {
          this.personEvent.finalMedicalReport = result;
          this.emitDocument.emit(result);
          this.isLoading$.next(false);
          this.compareFirstMedicalWithFinalMedicalReport();
        }
      });
    } else {
      this.personEvent.finalMedicalReport = this.finalMedicalReportForm;
      this.emitDocument.emit(this.finalMedicalReportForm);
      this.isLoading$.next(false);
    }
  }

  compareFirstMedicalWithFinalMedicalReport() {
    this.accidentService.getFirstMedicalReportForm(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        if (result.medicalReportForm && result.medicalReportForm.icd10CodesJson
          && this.finalMedicalReportForm.medicalReportForm
          && this.finalMedicalReportForm.medicalReportForm.icd10Codes) {
          const icd10CodesJsonFirst = JSON.parse(result.medicalReportForm.icd10CodesJson);
          const icd10CodesJsonFinal = JSON.parse(this.finalMedicalReportForm.medicalReportForm.icd10CodesJson);

          let count = 0;
          icd10CodesJsonFirst.forEach(icdCodeFirstMedical => {
            const index = icd10CodesJsonFinal.findIndex(icdCode => icdCode.icd10DiagnosticGroupId === icdCodeFirstMedical.icd10DiagnosticGroupId);
            if (index === -1 && count === 0) {
              this.startMedicalReportsNotSame();
              count++;
            }
          });
        }
      }
    });
  }

  startUploadFinalMedicalReportWorkflow() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'upload-final-medical-report-workflow-cca';
    startWizardRequest.linkedItemId = this.personEvent.personEventId;
    startWizardRequest.data = JSON.stringify(this.personEvent);
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      if (result) {
        this.alertService.success('Upload final medical report workflow started', 'Success', true);
      }
    });
  }

  allDocumentsEmitted($event: GenericDocument[]) {
    const filteredDocuments = $event.filter(doc => doc.documentType === DocumentTypeEnum.FinalMedicalReport);
    this.documentsEmitted = filteredDocuments;
  }

  cancel() {
    this.emitDocument.emit(null);
  }

  checkIfFirstMedicalReportExists() {
    this.accidentService.GetFinalMedicalReportForms(this.personEvent.personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe((finalMedicalReport) => {
      if (finalMedicalReport.length !== 0) {
        this.finalMedicalReportForm = finalMedicalReport[0];
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  readForm(): FinalMedicalReportForm {
    this.finalMedicalReportForm.medicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    this.finalMedicalReportForm.medicalReportForm.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    this.finalMedicalReportForm.medicalReportForm.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    this.finalMedicalReportForm.medicalReportForm.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    this.finalMedicalReportForm.medicalReportForm.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;
    this.finalMedicalReportForm.medicalReportForm.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    this.finalMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.FinalAccidentMedicalReport;
    this.finalMedicalReportForm.medicalReportForm.healthcareProviderId = this.selectedHealthCareProvider ? this.selectedHealthCareProvider.rolePlayerId : null;

    this.finalMedicalReportForm.additionalContributoryCauses = (this.form.controls.radioIsEventSoleContributorToDisablement.value === 'No') ? this.form.controls.ctlContributingCauses.value : null;
    this.finalMedicalReportForm.mechanismOfInjury = this.form.controls.ctlMechanismOfInjury.value;
    this.finalMedicalReportForm.injuryOrDiseaseDescription = this.form.controls.ctlInjuryOrDiseaseDetails.value;
    this.finalMedicalReportForm.impairmentFindings = this.form.controls.ctlImpairmentFindings.value;
    this.finalMedicalReportForm.isStabilised = this.form.controls.radioIsConditionStabilised.value === 'Yes' ? true : false;
    this.finalMedicalReportForm.dateReturnToWork = this.form.controls.ctlDateReturnToWork.value;
    this.finalMedicalReportForm.dateStabilised = this.form.controls.ctlDateStabilised.value;
    let codes = '';

    const simplifiedCodes = [];
    for (const x of this.selectedICDCodes) {
      codes = codes + (codes.length > 0 ? `, ${x.icd10Code}` : x.icd10Code);

      const simplifiedCode = new ICD10CodeModel();

      simplifiedCode.icd10Code = x.icd10Code;
      simplifiedCode.icd10CodeId = x.icd10CodeId;
      simplifiedCode.icd10CodeDescription = x.icd10CodeDescription;
      simplifiedCode.bodySideAffected = this.form.controls.bodySide.value;
      simplifiedCode.severity = this.form.controls.severity.value;
      simplifiedCode.icd10DiagnosticGroupId = x.icd10DiagnosticGroupId;
      simplifiedCode.icd10CategoryId = x.icd10CategoryId;
      simplifiedCode.icd10SubCategoryId = x.icd10SubCategoryId;

      simplifiedCodes.push(simplifiedCode);
    }

    this.finalMedicalReportForm.medicalReportForm.icd10Codes = codes ? codes : null;
    this.finalMedicalReportForm.medicalReportForm.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;


    return this.finalMedicalReportForm;
  }

  patchForm(medicalReport: FinalMedicalReportForm) {
    if (medicalReport) {
      const icd10CodesJson =  JSON.parse(medicalReport.medicalReportForm.icd10CodesJson);
      this.form.patchValue({
        medicalReportCategory: medicalReport.medicalReportForm.reportCategoryId ? medicalReport.medicalReportForm.reportCategoryId : null,
        dateOfConsultation: medicalReport.medicalReportForm.consultationDate ? medicalReport.medicalReportForm.consultationDate : null,
        nextReviewDateApplicable: medicalReport.medicalReportForm.nextReviewDate ? true : false,
        dateOfNextReview: medicalReport.medicalReportForm.reportCategoryId ? medicalReport.medicalReportForm.nextReviewDate : null,
        bodySide: icd10CodesJson[0].bodySideAffected ? icd10CodesJson[0].bodySideAffected : null,
        severity: icd10CodesJson[0].severity ? icd10CodesJson[0].severity : null,
        reportDate: medicalReport.medicalReportForm.reportDate ? medicalReport.medicalReportForm.reportDate : null,
        healthcareProviderPracticeNumber: medicalReport.medicalReportForm.healthcareProviderPracticeNumber ? medicalReport.medicalReportForm.healthcareProviderPracticeNumber : null,
        healthcareProviderName: medicalReport.medicalReportForm.healthcareProviderName ? medicalReport.medicalReportForm.healthcareProviderName : null,


        radioIsEventSoleContributorToDisablement: medicalReport.additionalContributoryCauses ? 'No' : 'Yes',
        radioIsConditionStabilised: medicalReport.isStabilised ? 'Yes' : 'No',

        ctlContributingCauses: medicalReport.additionalContributoryCauses ? medicalReport.additionalContributoryCauses : null,
        ctlMechanismOfInjury: medicalReport.mechanismOfInjury ? medicalReport.mechanismOfInjury : null,
        ctlInjuryOrDiseaseDetails: medicalReport.injuryOrDiseaseDescription ? medicalReport.injuryOrDiseaseDescription : null,
        ctlImpairmentFindings: medicalReport.impairmentFindings ? medicalReport.impairmentFindings : null,
        ctlDateReturnToWork: medicalReport.dateReturnToWork ? medicalReport.dateReturnToWork : null,
        ctlDateStabilised: medicalReport.dateStabilised ? medicalReport.dateStabilised : null

      });
      if (medicalReport.medicalReportForm.nextReviewDate) {
        this.nextReviewSelected = true;
      }
      if (medicalReport.medicalReportForm.icd10CodesJson) {
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
    }
  }

  checkReportInDigiCare(data: any) {
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstAccidentMedicalReport) {
      this.checkIfFirstMedicalReportExists();
    }
  }
  
  setHealthCareProviderDetails() {
    this.form.patchValue({
      healthcareProviderPracticeNumber: this.selectedHealthCareProvider.practiceNumber,
      healthcareProviderName: this.selectedHealthCareProvider.name,
    });

    if(this.form.valid)
    {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
    this.isLoading$.next(false);
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
    if(this.isIcdCodeListFormPristine == true && this.form.valid)
    {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
  }

  startMedicalReportsNotSame() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = '1st-medical-report-mismatch';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    this.wizardService.startWizard(startWizardRequest).subscribe(r => {
      this.alertService.success('Workflow notification created for CCA: 1st medical report differs from 2nd medical report.', 'Success', true);
    });
  }
}
