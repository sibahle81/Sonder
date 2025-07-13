import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { Constants } from 'projects/claimcare/src/app/constants';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { UploadControlComponent } from '../../upload-control/upload-control.component';
import { DocumentManagementService } from '../document-management.service';
import { DocumentType } from 'projects/shared-models-lib/src/lib/common/document-type';
import { Document } from '../document';
import { DocumentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/document-status-enum';
import { DialogComponent } from '../../dialogs/dialog/dialog.component';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { ICD10CodeModel } from '../../icd10-code-filter-dialog/icd10-code-model';
import { Icd10CodeListViewComponent } from '../../icd10-code-list-view/icd10-code-list-view.component';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { ConsultationDateValidator } from 'projects/shared-utilities-lib/src/lib/validators/consultation-date-validator';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { EstimateEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { MatTable } from '@angular/material/table';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { Constant } from 'src/app/shared/constants/constants';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';

@Component({
  selector: 'lib-upload-final-report-document',
  templateUrl: './upload-final-report-document.component.html',
  styleUrls: ['./upload-final-report-document.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class UploadFinalReportDocumentComponent implements OnInit {
  @ViewChild('registrationDocuments', { static: true }) registrationDocumentsUploadControlComponent: UploadControlComponent;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  documentType: DocumentType;
  keys: { [key: string]: string };
  isUploading: boolean;
  allowedDocumentTypes: string;
  documentSet: DocumentSetEnum;
  documentTypes: DocumentType[];
  form: UntypedFormGroup;
  isLoading: boolean;
  canClose = false;
  selectedId: any;
  documentDescription: string;

  startDate = new Date();
  medicalReportCategories: Lookup[];
  bodySides: Lookup[];
  nextReviewSelected = false;
  isPreExistingConditionSelected = false;
  maxDate = new Date();
  severities: Lookup[];
  userHealthCareProviders: HealthCareProvider[];
  showHealthCareProviders: boolean;
  selectedicdCodes: ICD10Code[] = [];
  eventType: EventTypeEnum;

  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  icd10DiagnosticGroupId: number;
  public isLoadingEstimates$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public minEstimate: EstimateEnum = EstimateEnum.Min ;
  public averageEstimate: EstimateEnum = EstimateEnum.Average ;
  public maxEstimate: EstimateEnum = EstimateEnum.Max ;

  public medicalEstimateType: EstimateTypeEnum = EstimateTypeEnum.Medical ;
  public pdEstimateType: EstimateTypeEnum = EstimateTypeEnum.PDLumpSum ;
  public ttdEstimateType: EstimateTypeEnum = EstimateTypeEnum.DaysOff ;
  public icd10CodesEstimatesAmounts: Icd10CodeEstimateAmount[] = [];
  @ViewChild('icd10CodeTable') icd10CodeTable: MatTable<ICD10Code>;

  displayedColumns = ['icd10Code', 'minEsimatedAmount','avgEsimatedAmount', 'maxEsimatedAmount', 'minPDPercentage','avgPDPercentage', 'maxPDPercentage', 'minTTD','avgTTD', 'maxTTD'];

  private selectMSP: ElementRef;
  @ViewChild('selectMSP', { static: false }) set content(content: ElementRef) {
    if (content) {
      this.selectMSP = content;

      const selectMSPKeyUp = fromEvent(this.selectMSP.nativeElement, 'keyup')
        .pipe(
          map((e: any) => e.target.value),
          debounceTime(300),
          distinctUntilChanged()
        );

      selectMSPKeyUp.subscribe((searchData: string) => {
        if (!String.isNullOrEmpty(searchData) && searchData.length > 2) {
          const user = this.authService.getCurrentUser();
          if(user.isInternalUser){
            this.getUserHealthCareProvidersForInternalUser(searchData);
          }
          else{
            this.getUserHealthCareProviders();
          }
        }
      });
    }
  }

  constructor(
    public dialogRef: MatDialogRef<UploadFinalReportDocumentComponent>,
    private readonly alertService: AlertService,
    private readonly documentManagementService: DocumentManagementService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public readonly datepipe: DatePipe,
    private readonly medicalEstimateService: MedicalEstimatesService,
    public healthcareProviderService: HealthcareProviderService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.isLoading = true;
    this.isUploading = true;
    this.documentDescription = '';
    this.createForm();
    this.getAllowedDocumentTypes();
    if (this.data.item) {
      this.patchForm();
    }
    this.documentType = new DocumentType();
    this.keys = this.data.documentRequest.keys;
    this.documentSet = this.data.documentRequest.documentSet;
    this.getDocumentTypesByDocumentSet(this.documentSet);
    this.getLookUps();

    if (this.data.personEvent) {
      this.eventType = this.data.eventDetail.eventType;
      if (this.data.personEvent.physicalDamages.length > 0) {
        this.form.get('severity').setValue(this.data.personEvent.physicalDamages[0].injuries[0].injurySeverityType);
        this.icd10DiagnosticGroupId = this.data.personEvent.physicalDamages[0].icd10DiagnosticGroupId;
      }
    }
  }

  getAllowedDocumentTypes() {
    this.lookupService.getItemByKey('AllowedDocumentTypes').subscribe(result => {
      this.registrationDocumentsUploadControlComponent.acceptedTypes = result;
      this.isLoading = false;
    });
  }

  getDocumentTypesByDocumentSet(documentSet: DocumentSetEnum) {
    this.documentManagementService.GetDocumentTypesBySetId(documentSet).subscribe(results => {
      this.documentTypes = results.filter(r => r.name === Constants.finalMedicalReport);
      this.form.get('documentType').setValue(this.documentTypes[0].id);
      this.isLoading = false;
    });
  }

  bytesToSize(bytes: number, decimals?: number): string {
    if (bytes === 0) { return '0 Bytes'; }
    const k = 1024;
    const dm = decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  UploadDocuments(): void {
    this.isLoading$.next(true);
    this.isUploading = true;
    this.keys = this.data.documentRequest.keys;

    const selectedFiles = this.registrationDocumentsUploadControlComponent.getUploadedFiles();

    this.canClose = true;
    for (const file of selectedFiles) {
      const document = new Document();
      this.readForm();
      document.docTypeId = this.selectedId;
      document.systemName = this.data.documentRequest.system;
      document.fileName = file.name;
      document.keys = this.keys;
      document.documentStatus = DocumentStatusEnum.Received;
      document.documentStatusText = DocumentStatusEnum[DocumentStatusEnum.Received];
      document.fileExtension = file.file.type;
      document.documentSet = this.data.documentRequest.documentSet;
      document.documentDescription = this.documentDescription;
      document.createdBy = this.authService.getCurrentUser().email;
      // Use FileReader() object to get file to upload
      const reader = new FileReader();
      // Setup onload event for reader
      reader.onload = () => {
        // Store base64 encoded representation of file
        document.fileAsBase64 = reader.result.toString();
        // POST to server
        this.documentManagementService.UploadDocument(document).subscribe(result => {
          const finalMedicalReport = this.readForm();
          this.isLoading$.next(false);
          if (result.documentExist) {
            this.isUploading = false;
            this.openAlreadyExistDialog();
          } else {
            this.alertService.success('Document uploaded sucessfully');
            finalMedicalReport.medicalReportForm.documentId = result.id;
            this.dialogRef.close(finalMedicalReport);
          }
        });
      };
      // Read the file
      reader.readAsDataURL(file.file);
    }

  }

  openAlreadyExistDialog(): void {
    const question = `Document already exists, please upload another PDF?`;
    const hideCloseBtn = true;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: { question, hideCloseBtn }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response !== null) {
        this.registrationDocumentsUploadControlComponent.clearUploadedDocs();
      }
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      documentType: new UntypedFormControl('', [Validators.required]),
      documentDescription: new UntypedFormControl(''),
      radioIsEventSoleContributorToDisablement: new UntypedFormControl(''),
      radioIsConditionStabilised: new UntypedFormControl('', [Validators.required]),
      ctlContributingCauses: new UntypedFormControl(''),
      ctlMechanismOfInjury: new UntypedFormControl(''),
      ctlInjuryOrDiseaseDetails: new UntypedFormControl(''),
      ctlImpairmentFindings: new UntypedFormControl(''),
      ctlDateReturnToWork: new UntypedFormControl('', [DateValidator.checkIfDateLessThan('ctlDateReturnToWork', this.datepipe.transform(this.data.eventDate, Constants.dateString))]),
      ctlDateStabilised: new UntypedFormControl('', [Validators.required, DateValidator.checkIfDateLessThan('ctlDateStabilised', this.datepipe.transform(this.data.eventDate, Constants.dateString))]),
      healthCareProvider: new UntypedFormControl('', [Validators.required]),
      healthcareProviderId: new UntypedFormControl(''),
      healthcareProviderPracticeNumber: new UntypedFormControl({ value: '', disabled: true }),
      healthcareProviderName: new UntypedFormControl({ value: '', disabled: true }),
      medicalReportCategory: new UntypedFormControl('', [Validators.required]),
      dateOfConsultation: new UntypedFormControl('', [Validators.required, DateValidator.checkIfDateLessThan('dateOfConsultation', this.datepipe.transform(this.data.eventDate, Constants.dateString)),
      ConsultationDateValidator.firstConsultationDateLessThan('dateOfConsultation', this.datepipe.transform(this.data.firstMedicalConsultationDate, Constants.dateString)),
      ConsultationDateValidator.progressConsultationDateLessThan('dateOfConsultation', this.datepipe.transform(this.data.progresMedicalConsultationDate, Constants.dateString))]),
      bodySide: new UntypedFormControl('', [Validators.required]),
      severity: new UntypedFormControl('', [Validators.required]),
      reportDate: new UntypedFormControl({ value: new Date(), disabled: true }),
    });
  }

  readForm(): FinalMedicalReportForm {
    this.selectedId = this.form.controls.documentType.value;
    this.documentDescription = this.form.controls.documentDescription.value;

    const finalMedicalReport = new FinalMedicalReportForm();
    const medicalReport = new MedicalReportForm();
    medicalReport.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    medicalReport.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    medicalReport.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    medicalReport.healthcareProviderId = this.form.controls.healthcareProviderId.value ? this.form.controls.healthcareProviderId.value : null;
    medicalReport.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    medicalReport.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;
    medicalReport.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    medicalReport.reportTypeId = MedicalFormReportTypeEnum.FinalAccidentMedicalReport;

    finalMedicalReport.additionalContributoryCauses = (this.form.controls.radioIsEventSoleContributorToDisablement.value === 'No') ? this.form.controls.ctlContributingCauses.value : null;
    finalMedicalReport.mechanismOfInjury = this.form.controls.ctlMechanismOfInjury.value;
    finalMedicalReport.injuryOrDiseaseDescription = this.form.controls.ctlInjuryOrDiseaseDetails.value;
    finalMedicalReport.impairmentFindings = this.form.controls.ctlImpairmentFindings.value;
    finalMedicalReport.isStabilised = this.form.controls.radioIsConditionStabilised.value === 'Yes' ? true : false;
    finalMedicalReport.dateReturnToWork = this.form.controls.ctlDateReturnToWork.value;
    finalMedicalReport.dateStabilised = this.form.controls.ctlDateStabilised.value;
    let codes = '';

    const simplifiedCodes = [];
    for (const x of this.selectedicdCodes) {
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

    medicalReport.icd10Codes = codes ? codes : null;
    medicalReport.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;
    finalMedicalReport.medicalReportForm = medicalReport;

    return finalMedicalReport;
  }

  onDocumentSelect() {
    this.form.markAsDirty();
    this.isUploading = false;
  }

  patchForm() {
    this.form.patchValue({
      documentType: this.data.item.docTypeId
    });

    this.onDocumentSelect();
  }

  getLookUps() {
    this.getSeverities();
    this.getBodySides();
    this.getMedicalReportCategories();
  }

  getSeverities() {
    this.lookupService.getInjurySeverities().subscribe(severities => {
      this.severities = severities;
    });
  }

  getBodySides() {
    this.lookupService.getBodySides().subscribe(bodySides => {
      this.bodySides = bodySides;
    });
  }

  getUserHealthCareProviders(): void {
    const user = this.authService.getCurrentUser();
    this.healthcareProviderService.filterHealthCareProviders(user.email).subscribe(
      userHealthCareProviders => {
        if (userHealthCareProviders) {
          if (userHealthCareProviders.length === 1) {
            this.showHealthCareProviders = false;
            this.setHealthCareProviderDetails(userHealthCareProviders[0]);
          } else {
            this.showHealthCareProviders = true;
            this.userHealthCareProviders = userHealthCareProviders;
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
        }
      }
    );
  }

  checkHCP($event: any){
    if($event.target.value.length === 0){
      this.form.patchValue({
        healthcareProviderPracticeNumber: "",
        healthcareProviderName: ""
      });
    }
  }

  setHealthCareProviderDetails(userHealthCareProvider: HealthCareProvider) {
    this.form.patchValue({
      healthcareProviderPracticeNumber: userHealthCareProvider.practiceNumber,
      healthcareProviderName: userHealthCareProvider.name,
      healthcareProviderId: userHealthCareProvider.rolePlayerId
    });
  }

  healthCareProviderDetailsChange($event: any) {
    const healthCareProvider = this.userHealthCareProviders.find(a => a.rolePlayerId === $event.option.value);
    this.setHealthCareProviderDetails(healthCareProvider);
  }

  getMedicalReportCategories(): void {
    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;
    });
  }

  openICD10CodeDialog() {
    const dialogRef = this.dialog.open(Icd10CodeListViewComponent, {
      width: '65%',
      maxHeight: '750px',
      data: { eventType: this.eventType }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.isLoadingEstimates$.next(true);
        let codes = '';

        data.forEach(icd10CodeModel => {

          codes = codes + (codes.length > 0 ? `, ${icd10CodeModel.icd10Code}` : icd10CodeModel.icd10Code);

          const icd10Code = new ICD10Code();
          icd10Code.icd10Code = icd10CodeModel.icd10Code;
          icd10Code.icd10CodeDescription = icd10CodeModel.icd10CodeDescription;
          icd10Code.icd10CodeId = icd10CodeModel.icd10CodeId;
          icd10Code.icd10SubCategoryId = icd10CodeModel.icd10SubCategoryId;

          if (this.selectedicdCodes.length > 0) {
            const existingICD10Code = this.selectedicdCodes.find(selectedicdCodes => selectedicdCodes.icd10CodeId === icd10Code.icd10CodeId);
            if (!existingICD10Code) {
              this.selectedicdCodes.push(icd10Code);
            }
          } else {
            this.selectedicdCodes.push(icd10Code);
          }
        });

        let icd10CodeFilter = new ICD10EstimateFilter();
        icd10CodeFilter.eventType = this.eventType;
        icd10CodeFilter.icd10Codes = codes;
        icd10CodeFilter.reportDate = this.form.controls.reportDate.value;
        this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
          if(results && results.length > 0) {
            if(this.icd10CodesEstimatesAmounts.length === 0) {
              this.icd10CodesEstimatesAmounts = results
            } else {
              results.forEach(icd10CodesEstimatesAmount => {
                const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(x => x.icd10Code === icd10CodesEstimatesAmount.icd10Code);
                if(!icd10CodeEstimate){
                  this.icd10CodesEstimatesAmounts.push(icd10CodesEstimatesAmount);
                }
              });
              
            }
          }
          this.isLoadingEstimates$.next(false);
        })
      }
    });
  }

  save() {
    const selectedFiles = this.registrationDocumentsUploadControlComponent.getUploadedFiles();
    if (selectedFiles.length > 0) {
      this.UploadDocuments();
    } else {
      this.alertService.loading('Please Upload a file before submitting');
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  removedSeletedICD10Code(icd10CodeId: number) {
    if(this.selectedicdCodes.length > 1){
      const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
      this.selectedicdCodes.splice(index, 1);
      this.icd10CodeTable.renderRows();
    } else {
      const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
      this.selectedicdCodes.splice(index, 1);
    }
    
  }

  getEstimatedAmount(icd10Code: string, estimateEnum: EstimateEnum, estimateTypeEnum :EstimateTypeEnum ): string {
    if(this.icd10CodesEstimatesAmounts && this.icd10CodesEstimatesAmounts.length > 0) {
      const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(a => a.icd10Code === icd10Code);
      if(icd10CodeEstimate !== undefined){
        switch (estimateTypeEnum) {
          case EstimateTypeEnum.Medical:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.medicalMinimumCost.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.medicalAverageCost.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.medicalMaximumCost.toString();
              }

          case EstimateTypeEnum.PDLumpSum:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.pdExtentMinimum.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.pdExtentAverage.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.pdExtentMaximum.toString();
                }
          case EstimateTypeEnum.DaysOff:
            switch (estimateEnum) {
              case EstimateEnum.Min:
                return icd10CodeEstimate.daysOffMinimum.toString();
              case EstimateEnum.Average:
                return icd10CodeEstimate.daysOffAverage.toString();
              case EstimateEnum.Max:
                return icd10CodeEstimate.daysOffMaximum.toString();
               }
          default: 
            return Constant.EstimateNotFound;
       }
      } else {
        return Constant.EstimateNotFound;
      }
    } else {
      return Constant.EstimateNotFound;
    }
  }

  formatMoney(value: string): string {
    return value && value != '' ? (value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) + '.00' : value;
  }
}

