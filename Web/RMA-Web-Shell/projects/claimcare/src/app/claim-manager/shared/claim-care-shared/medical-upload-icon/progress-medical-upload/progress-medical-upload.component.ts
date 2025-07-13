import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AccidentService } from '../../../../Services/accident.service';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { Constants } from 'projects/claimcare/src/app/constants';
import { DateRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-range.validator';
import { ICD10CodeModel } from 'projects/shared-components-lib/src/lib/icd10-code-filter-dialog/icd10-code-model';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { InjurySeverityTypeEnum } from '../../../enums/injury-severity-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { MatRadioChange } from '@angular/material/radio';
import { ClaimReferralDetail } from '../../../entities/claim-referral-detail';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/enums/referral-status-enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'progress-medical-upload',
  templateUrl: './progress-medical-upload.component.html',
  styleUrls: ['./progress-medical-upload.component.css']
})
export class ProgressMedicalUploadComponent extends UnSubscribe implements OnChanges {
  @Input() personEvent: PersonEventModel;
  @Input() event: EventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() currentQuery = '';
  @Input() selectedMedicalReport: ProgressMedicalReportForm;

  @Output() emitDocument: EventEmitter<ProgressMedicalReportForm> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isLoadingHealthCare$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  claimMedicalDocuments = DocumentSetEnum.ClaimMedicalDocuments;
  documentTypeEnums: DocumentTypeEnum[] = [DocumentTypeEnum.ProgressMedicalReport];

  form: UntypedFormGroup;
  userHealthCareProviders: HealthCareProvider[];
  filteredUserHealthCareProviders: HealthCareProvider[];

  startDate = new Date();
  maxDate = new Date();
  minDate = new Date();
  eventStartDate = new Date();
  nextReviewSelected = false;
  isUnfitForWork = false;

  bodySides: Lookup[];
  severities: Lookup[];
  medicalReportCategories: Lookup[];

  showHealthCareProviders: boolean;
  selectedICDCodes: ICD10Code[] = [];
  progressMedicalReportForm: ProgressMedicalReportForm;

  documentType: DocumentType;
  documentUploaded = false;
  hideEndDate = false;
  documentsEmitted: GenericDocument[];
  reportDate: Date;
  selectedDocIndex: number;
  documentKey: string;
  selectedHealthCareProvider: HealthCareProvider;
  isIcdCodeListFormPristine: boolean;
  
  documentUploadStatus = DocumentStatusEnum.Accepted;

  constructor(
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public readonly datePipeService: DatePipe,
    private readonly accidentService: AccidentService,
    public healthcareProviderService: HealthcareProviderService,
    private readonly claimCareService: ClaimCareService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService
  ) {
    super();
  }

  getLookUps() {
    this.getSeverities();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getLookUps();
    this.getEventUnfitStartDate() ;
  }


  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.isLoadingHealthCare$.next(true);
      this.currentQuery = this.currentQuery.trim();

      const user = this.authService.getCurrentUser();
      user.isInternalUser ? this.getUserHealthCareProvidersForInternalUser(this.currentQuery) : this.getUserHealthCareProviders();
    }
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

      isUnfitForWork: [{ value: '', disabled: this.isReadOnly }],
      documentType: [{ value: '', disabled: true }, [Validators.required]],
      documentDescription: [{ value: '', disabled: this.isReadOnly }],
      radioStabilisedDetails: [{ value: '', disabled: this.isReadOnly }],
      radioAdditionalTreatment: [{ value: '', disabled: this.isReadOnly }],
      radioSpecialistDetails: [{ value: '', disabled: this.isReadOnly }],
      radioRadiologyDetails: [{ value: '', disabled: this.isReadOnly }],
      radioAdditionalOperationsProcedures: [{ value: '', disabled: this.isReadOnly }],
      radioAdditionalPhysiotherapy: [{ value: '', disabled: this.isReadOnly }],

      ctlDateStabilised: [{ value: '', disabled: this.isReadOnly }],
      ctlNotStabilisedReason: [{ value: '', disabled: this.isReadOnly }],
      ctlTreatmentDetails: [{ value: '', disabled: this.isReadOnly }],
      ctlSpecialistReferralDetails: [{ value: '', disabled: this.isReadOnly }],
      ctlRadiologyFindings: [{ value: '', disabled: this.isReadOnly }],
      ctlOperationsProcedures: [{ value: '', disabled: this.isReadOnly }],
      ctlPhysiotherapy: [{ value: '', disabled: this.isReadOnly }],
      unfitStartDate: [{ value: '', disabled: this.isReadOnly },[DateRangeValidator.endAfterStart(this.eventStartDate.toDateString())]],
      unfitEndDate: [{ value: '', disabled: this.isReadOnly }, [DateRangeValidator.endAfterStart('unfitStartDate')]],
    });

    if (this.selectedMedicalReport.progressMedicalReportFormId > 0) {
      this.patchForm(this.selectedMedicalReport);
    }
    else {
      this.selectedMedicalReport = new ProgressMedicalReportForm();
      this.selectedMedicalReport.medicalReportForm = new MedicalReportForm();
    }
    const icd10CodesJson = this.personEvent.firstMedicalReport ? JSON.parse(this.personEvent.firstMedicalReport.medicalReportForm.icd10CodesJson) : undefined;

    if (icd10CodesJson && icd10CodesJson[0].severity) {
    } else if (this.personEvent && this.personEvent.physicalDamages.length > 0) {
      this.form.get('severity').setValue(+InjurySeverityTypeEnum.Mild);
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

      if (this.personEvent && this.event && this.selectedMedicalReport.progressMedicalReportFormId > 0) {
        this.getHealthCareProvider(this.selectedMedicalReport.medicalReportForm.healthcareProviderId);
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

  showUnfitEndDate($event: any) {
    this.hideEndDate = true;
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
    this.progressMedicalReportForm.medicalReportForm.personEventId = this.personEvent.personEventId;
    this.progressMedicalReportForm.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.ProgressAccidentMedicalReport;
    
    this.progressMedicalReportForm.medicalReportForm.documentStatusId = DocumentStatusEnum.Received;

    if (!this.isWizard) {
      this.accidentService.ValidateProgressMedicalReport(this.progressMedicalReportForm).subscribe(result => {
        if (result) {
          this.personEvent.progressMedicalReportForms.push(result);
          this.emitDocument.emit(result);
          this.compareFirstMedicalWithProgressMedicalReport();
        } else {
          this.isLoading$.next(false);
        }
      });
    } else {
      this.personEvent.progressMedicalReportForms.push(this.progressMedicalReportForm);
      this.emitDocument.emit(this.progressMedicalReportForm);
      this.isLoading$.next(false);
    }
  }

  compareFirstMedicalWithProgressMedicalReport() {
    this.accidentService.getFirstMedicalReportForm(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        if (result.medicalReportForm && result.medicalReportForm.icd10CodesJson
          && this.progressMedicalReportForm.medicalReportForm
          && this.progressMedicalReportForm.medicalReportForm.icd10CodesJson) {
          const icd10CodesJsonFirst = JSON.parse(result.medicalReportForm.icd10CodesJson);
          const icd10CodesJsonProgress = JSON.parse(this.progressMedicalReportForm.medicalReportForm.icd10CodesJson);
          
          let count = 0;
          icd10CodesJsonFirst.forEach(icdCodeFirstMedical => {
            const index = icd10CodesJsonProgress.findIndex(icdCode => icdCode.icd10DiagnosticGroupId === icdCodeFirstMedical.icd10DiagnosticGroupId);
            if (index === -1 && count === 0) {
              this.startMedicalReportsNotSame();
              count++;
            }
          });
          if (count > 0) {
            this.isLoading$.next(false);
          }
        }
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  startMedicalReportsNotSame() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = '1st-medical-report-mismatch';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    this.wizardService.startWizard(startWizardRequest).subscribe(r => {
      this.isLoading$.next(false);
      this.alertService.success('Workflow notification created for CCA: 1st medical report differs from 2nd medical report.', 'Success', true);
    });
  }

  sendCCAReferral()
  {
    this.userService.getUsersByRoleName(Constants.ccaRole).subscribe(
      data => {
        if (data) {
          data.forEach(userId => {
            const referalDetailsData = new ClaimReferralDetail();
            referalDetailsData.ClaimId = this.personEvent.claims[0].claimId;
            referalDetailsData.ownerId = this.authService.getCurrentUser().id;
            referalDetailsData.referralQuery = 'Claimant is under active treatment';
            referalDetailsData.receivedDate = new Date();
            referalDetailsData.referrerUser = userId.id;
            referalDetailsData.contextualData = `${Constants.holisticViewUrl}${this.personEvent.eventId}/${this.personEvent.personEventId}`;
            referalDetailsData.referredToUserName = userId.displayName;
            referalDetailsData.referralStatusId = ReferralStatusEnum.Open;
            referalDetailsData.referralQueryTypeId = ReferralStatusEnum.Open;
            this.claimCareService.AddClaimReferralDetail(referalDetailsData).subscribe((result) => {
              if(result)
                {
                }
             });
          });
        }
      }
    );
  }

  addMedicalReport() {
    if (!this.selectedMedicalReport) {
      if (this.personEvent.progressMedicalReportForms) {
        this.personEvent.progressMedicalReportForms.push(this.progressMedicalReportForm);
      } else {
        this.personEvent.progressMedicalReportForms = [];
        this.personEvent.progressMedicalReportForms.push(this.progressMedicalReportForm);
      }
    }
  }

  allDocumentsEmitted($event: GenericDocument[]) {
    const filteredDocuments = $event.filter(doc => doc.documentType === DocumentTypeEnum.ProgressMedicalReport);
    this.documentsEmitted = filteredDocuments;
  }

  cancel() {
    this.emitDocument.emit(null);
  }

  readForm(): ProgressMedicalReportForm {
    this.selectedMedicalReport.medicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    this.selectedMedicalReport.medicalReportForm.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    this.selectedMedicalReport.medicalReportForm.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    this.selectedMedicalReport.medicalReportForm.healthcareProviderId = this.selectedHealthCareProvider ? this.selectedHealthCareProvider.rolePlayerId : null;
    this.selectedMedicalReport.medicalReportForm.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    this.selectedMedicalReport.medicalReportForm.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;
    this.selectedMedicalReport.medicalReportForm.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    this.selectedMedicalReport.medicalReportForm.reportTypeId = MedicalFormReportTypeEnum.ProgressAccidentMedicalReport;

    if (this.form.controls.isUnfitForWork.value && this.form.controls.isUnfitForWork.value === 'Yes') {
      this.selectedMedicalReport.medicalReportForm.unfitEndDate = this.form.controls.unfitEndDate.value ? this.form.controls.unfitEndDate.value : null;
      this.selectedMedicalReport.medicalReportForm.unfitStartDate = this.form.controls.unfitStartDate.value ? this.form.controls.unfitStartDate.value : null;
    }

    this.selectedMedicalReport.notStabilisedReason = this.form.controls.ctlNotStabilisedReason.value ? this.form.controls.ctlNotStabilisedReason.value : null;
    this.selectedMedicalReport.treatmentDetails = this.form.controls.ctlTreatmentDetails.value ? this.form.controls.ctlTreatmentDetails.value : null;
    this.selectedMedicalReport.specialistReferralsHistory = this.form.controls.ctlSpecialistReferralDetails.value ? this.form.controls.ctlSpecialistReferralDetails.value : null;
    this.selectedMedicalReport.radiologyFindings = this.form.controls.ctlRadiologyFindings.value ? this.form.controls.ctlRadiologyFindings.value : null;
    this.selectedMedicalReport.operationsProcedures = this.form.controls.ctlOperationsProcedures.value ? this.form.controls.ctlOperationsProcedures.value : null;
    this.selectedMedicalReport.physiotherapyTreatmentDetails = this.form.controls.ctlPhysiotherapy.value ? this.form.controls.ctlPhysiotherapy.value : null;

    this.selectedMedicalReport.isStabilisedChecked = this.form.controls.radioStabilisedDetails.value === 'Yes' ? true : false;
    this.selectedMedicalReport.isTreatmentChecked = this.form.controls.radioAdditionalTreatment.value === 'Yes' ? true : false;
    this.selectedMedicalReport.isSpecialistReferralsHistoryChecked = this.form.controls.radioSpecialistDetails.value === 'Yes' ? true : false;
    this.selectedMedicalReport.isRadiologyFindingsChecked = this.form.controls.radioRadiologyDetails.value === 'Yes' ? true : false;
    this.selectedMedicalReport.isOperationsProceduresChecked = this.form.controls.radioAdditionalOperationsProcedures.value === 'Yes' ? true : false;
    this.selectedMedicalReport.isPhysiotherapyTreatmentDetailsChecked = this.form.controls.radioAdditionalPhysiotherapy.value === 'Yes' ? true : false;
    this.selectedMedicalReport.dateStabilised = this.form.controls.ctlDateStabilised.value ? this.form.controls.ctlDateStabilised.value : null;
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

    this.selectedMedicalReport.medicalReportForm.icd10Codes = codes ? codes : null;
    this.selectedMedicalReport.medicalReportForm.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;
    this.progressMedicalReportForm = this.selectedMedicalReport;

    return this.selectedMedicalReport;
  }

  patchForm(medicalReport: ProgressMedicalReportForm) {
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
        radioStabilisedDetails: medicalReport.isStabilisedChecked ? 'Yes' : 'No',
        radioAdditionalTreatment: medicalReport.isTreatmentChecked ? 'Yes' : 'No',
        radioSpecialistDetails: medicalReport.isSpecialistReferralsHistoryChecked ? 'Yes' : 'No',
        radioRadiologyDetails: medicalReport.isRadiologyFindingsChecked ? 'Yes' : 'No',
        radioAdditionalOperationsProcedures: medicalReport.isOperationsProceduresChecked ? 'Yes' : 'No',
        radioAdditionalPhysiotherapy: medicalReport.isPhysiotherapyTreatmentDetailsChecked ? 'Yes' : 'No',
        isUnfitForWork: medicalReport.medicalReportForm.unfitStartDate ? 'Yes' : 'No',

        unfitStartDate: medicalReport.medicalReportForm.unfitStartDate ? medicalReport.medicalReportForm.unfitStartDate : null,
        unfitEndDate: medicalReport.medicalReportForm.unfitEndDate ? medicalReport.medicalReportForm.unfitEndDate : null,
        ctlNotStabilisedReason: medicalReport.notStabilisedReason ? medicalReport.notStabilisedReason : null,
        ctlTreatmentDetails: medicalReport.treatmentDetails ? medicalReport.treatmentDetails : null,
        ctlSpecialistReferralDetails: medicalReport.specialistReferralsHistory ? medicalReport.specialistReferralsHistory : null,
        ctlRadiologyFindings: medicalReport.radiologyFindings ? medicalReport.radiologyFindings : null,
        ctlOperationsProcedures: medicalReport.operationsProcedures ? medicalReport.operationsProcedures : null,
        ctlPhysiotherapy: medicalReport.physiotherapyTreatmentDetails ? medicalReport.physiotherapyTreatmentDetails : null,
        ctlDateStabilised: medicalReport.dateStabilised ? medicalReport.dateStabilised : null,

      });

      if (medicalReport.medicalReportForm.nextReviewDate) {
        this.nextReviewSelected = true;
      }
      if (medicalReport.medicalReportForm.icd10CodesJson) {
        const icd10CodesJson = JSON.parse(medicalReport.medicalReportForm.icd10CodesJson);
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
    this.isLoading$.next(false);
  }

  checkReportInDigiCare(data: any) {
    if (data.medicalReportForm.reportTypeId === MedicalFormReportTypeEnum.FirstAccidentMedicalReport) {
      this.checkIfFirstMedicalReportExists();
    }
  }

  checkIfFirstMedicalReportExists() {
    this.accidentService.GetProgressMedicalReportForms(this.personEvent.personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe((progressMedicalReport) => {
      if (progressMedicalReport.length !== 0) {
        this.progressMedicalReportForm = progressMedicalReport[0];
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  getEventUnfitStartDate() {
    this.eventStartDate = new Date(this.event.eventDate);
  }

  getSelectedDocumentIndex() {
    if (this.selectedMedicalReport) {
      this.selectedDocIndex = this.personEvent.progressMedicalReportForms.findIndex(
        report => report === this.selectedMedicalReport
      );
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

  isRadioStabilisedDetailsChanged(mrChange: MatRadioChange) {
    const ctlDateStabilised = [Validators.required, DateValidator.checkIfDateLessThan('ctlDateStabilised', this.datePipeService.transform(this.event.eventDate, Constants.dateString))]
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, ctlDateStabilised, 'ctlDateStabilised');
      this.clearValidationToFormControl(this.form, 'ctlNotStabilisedReason');
    } else {
      this.applyValidationToFormControl(this.form, validators, 'ctlNotStabilisedReason');
      this.clearValidationToFormControl(this.form, 'ctlDateStabilised');

    }
  }
  isUnfitForWorkOnChange(mrChange: MatRadioChange) {
    const unfitEndDateValidator = [Validators.required, DateRangeValidator.endAfterStart('unfitStartDate')];
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'unfitStartDate');
      this.applyValidationToFormControl(this.form, unfitEndDateValidator, 'unfitEndDate');
    } else {
      this.clearValidationToFormControl(this.form, 'unfitStartDate');
      this.clearValidationToFormControl(this.form, 'unfitEndDate');
    }
  }

  isRadioAdditionalTreatment(mrChange: MatRadioChange) {
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'ctlTreatmentDetails');
    } else {
      this.clearValidationToFormControl(this.form, 'ctlTreatmentDetails');

    }
  }

  isRadioSpecialistDetails(mrChange: MatRadioChange) {
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'ctlSpecialistReferralDetails');
    } else {
      this.clearValidationToFormControl(this.form, 'ctlSpecialistReferralDetails');

    }
  }

  isRadioRadiologyDetailssChanged(mrChange: MatRadioChange) {
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'ctlOperationsProcedures');
    } else {
      this.clearValidationToFormControl(this.form, 'ctlOperationsProcedures');

    }
  }
  isradioAdditionalOperationsProceduresChanged(mrChange: MatRadioChange) {
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'ctlRadiologyFindings');
    } else {
      this.clearValidationToFormControl(this.form, 'ctlRadiologyFindings');

    }
  }
  isradioAdditionalPhysiotherapyChanged(mrChange: MatRadioChange) {
    const validators = [Validators.required];
    if (mrChange.value === 'Yes') {
      this.applyValidationToFormControl(this.form, validators, 'ctlPhysiotherapy');
    } else {
      this.clearValidationToFormControl(this.form, 'ctlPhysiotherapy');

    }
  }

  onIcdCodeListFormStatusChanged(status: boolean) {
    this.isIcdCodeListFormPristine = status;
    if(this.isIcdCodeListFormPristine == true && this.form.valid)
    {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
    }
  }
}
