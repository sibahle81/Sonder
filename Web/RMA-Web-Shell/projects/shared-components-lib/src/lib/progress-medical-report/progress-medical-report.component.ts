import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ProgressMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/progress-medical-report-form';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { EstimateEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { Constants } from 'projects/shared-utilities-lib/src/lib/pipe-formats/constants';
import { DateRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-range.validator';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { BehaviorSubject } from 'rxjs';
import { Constant } from 'src/app/shared/constants/constants';
import { ICD10CodeModel } from '../icd10-code-filter-dialog/icd10-code-model';
import { Icd10CodeListViewComponent } from '../icd10-code-list-view/icd10-code-list-view.component';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'progress-medical-report',
  templateUrl: './progress-medical-report.component.html',
  styleUrls: ['./progress-medical-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class ProgressMedicalReportComponent implements OnInit {

  public form: UntypedFormGroup;
  public startDate = new Date();
  public medicalReportCategories: Lookup[];
  public bodySides: Lookup[];
  public nextReviewSelected = false;
  public isPreExistingConditionSelected = false;
  maxDate = new Date();
  public severities: Lookup[];
  public userHealthCareProviders: UserHealthCareProvider[];
  public showHealthCareProviders: boolean;
  public selectedicdCodes: ICD10Code[] = [];
  public eventType: EventTypeEnum;
  public disabled = false;

  public isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

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

  public personEvent: PersonEventModel;
  icd10DiagnosticGroupId: number;

  constructor(
    public dialogRef: MatDialogRef<ProgressMedicalReportComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public readonly datepipe: DatePipe,
    public dialog: MatDialog,
    private readonly medicalEstimateService: MedicalEstimatesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.createForm();
    this.getLookUps();
    this.eventType = this.data.eventType;
    this.personEvent = this.data.personEvent;

    if (this.data.progressMedicalReport) {
      this.data.progressMedicalReport.progressMedicalReportFormId === 0 ? this.disablesFormFields() : this.enableFormFields();
      this.disabled = this.data.progressMedicalReport.progressMedicalReportFormId === 0;
      this.icd10DiagnosticGroupId = this.personEvent.physicalDamages[0].icd10DiagnosticGroupId;
      this.patchForm(this.data.progressMedicalReport);
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      radioStabilisedDetails: new UntypedFormControl(''),
      radioAdditionalTreatment: new UntypedFormControl(''),
      radioSpecialistDetails: new UntypedFormControl(''),
      radioRadiologyDetails: new UntypedFormControl(''),
      radioAdditionalOperationsProcedures: new UntypedFormControl(''),
      radioAdditionalPhysiotherapy: new UntypedFormControl(''),

      ctlNotStabilisedReason: new UntypedFormControl(''),
      ctlTreatmentDetails: new UntypedFormControl(''),
      ctlSpecialistReferralDetails: new UntypedFormControl(''),
      ctlRadiologyFindings: new UntypedFormControl(''),
      ctlOperationsProcedures: new UntypedFormControl(''),
      ctlPhysiotherapy: new UntypedFormControl(''),
      unfitEndDate: new UntypedFormControl('', DateRangeValidator.endAfterStart('unfitStartDate')),
      unfitStartDate: new UntypedFormControl(''),
      isUnfitForWork: new UntypedFormControl(''),

      medicalReportCategory: new UntypedFormControl('', [Validators.required]),
      dateOfConsultation: new UntypedFormControl('', [Validators.required, DateValidator.checkIfDateLessThan('dateOfConsultation', this.datepipe.transform(this.data.eventDate, Constants.dateFormat))]),
      bodySide: new UntypedFormControl('', [Validators.required]),
      severity: new UntypedFormControl('', [Validators.required]),
      reportDate: new UntypedFormControl({ value: new Date(), disabled: true }),
      healthCareProvider: new UntypedFormControl('', [Validators.required]),
      healthcareProviderId: new UntypedFormControl(''),
      healthcareProviderPracticeNumber: new UntypedFormControl({value: '', disabled: true}),
      healthcareProviderName: new UntypedFormControl({value: '', disabled: true}),
    });
  }

  getLookUps() {
    this.getSeverities();
    this.getBodySides();
    this.getUserHealthCareProviders();
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
    this.userService.getUserHealthCareProviders(user.email).subscribe(
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

  setHealthCareProviderDetails(userHealthCareProvider: UserHealthCareProvider) {
    this.form.patchValue({
      healthcareProviderPracticeNumber: userHealthCareProvider.practiceNumber,
      healthcareProviderName: userHealthCareProvider.name,
      healthcareProviderId: userHealthCareProvider.healthCareProviderId
    });
  }

  getMedicalReportCategories(): void {
    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;
    });
  }

  healthCareProviderDetailsChange($event: any ) {
    const healthCareProvider = this.userHealthCareProviders.find(a => a.healthCareProviderId === $event.value);
    this.setHealthCareProviderDetails(healthCareProvider);
  }

  removedSeletedICD10Code(icd10CodeId: number) {
    if (!this.disabled) {
      if (this.selectedicdCodes.length > 1) {
        const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
        this.selectedicdCodes.splice(index, 1);
        this.icd10CodeTable.renderRows();
      } else {
        const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
        this.selectedicdCodes.splice(index, 1);
      }
    }
  }

  save() {
    const firstMedicalReport = this.readForm();
    this.dialogRef.close(firstMedicalReport);
  }

  cancel() {
    this.dialogRef.close();
  }

  readForm(): ProgressMedicalReportForm {
    const progressMedicalReport = this.data.progressMedicalReport;
    progressMedicalReport.medicalReportForm.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    progressMedicalReport.medicalReportForm.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    progressMedicalReport.medicalReportForm.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    progressMedicalReport.medicalReportForm.healthcareProviderId = this.form.controls.healthcareProviderId.value ? this.form.controls.healthcareProviderId.value : null;
    progressMedicalReport.medicalReportForm.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    progressMedicalReport.medicalReportForm.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;
    progressMedicalReport.medicalReportForm.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;

    if (this.form.controls.isUnfitForWork.value && this.form.controls.isUnfitForWork.value === 'Yes') {
      progressMedicalReport.medicalReportForm.unfitEndDate = this.form.controls.unfitEndDate.value ? this.form.controls.unfitEndDate.value : null;
      progressMedicalReport.medicalReportForm.unfitStartDate = this.form.controls.unfitStartDate.value ? this.form.controls.unfitStartDate.value : null;
    }

    progressMedicalReport.notStabilisedReason = this.form.controls.ctlNotStabilisedReason.value ? this.form.controls.ctlNotStabilisedReason.value : null;
    progressMedicalReport.treatmentDetails = this.form.controls.ctlTreatmentDetails.value ? this.form.controls.ctlTreatmentDetails.value : null;
    progressMedicalReport.specialistReferralsHistory = this.form.controls.ctlSpecialistReferralDetails.value ? this.form.controls.ctlSpecialistReferralDetails.value : null;
    progressMedicalReport.radiologyFindings = this.form.controls.ctlRadiologyFindings.value ? this.form.controls.ctlRadiologyFindings.value : null;
    progressMedicalReport.operationsProcedures = this.form.controls.ctlOperationsProcedures.value ? this.form.controls.ctlOperationsProcedures.value : null;
    progressMedicalReport.physiotherapyTreatmentDetails = this.form.controls.ctlPhysiotherapy.value ? this.form.controls.ctlPhysiotherapy.value : null;

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

    progressMedicalReport.medicalReportForm.icd10Codes  = codes ? codes : null;
    progressMedicalReport.medicalReportForm.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;

    return progressMedicalReport;
  }

  patchForm(medicalReport: ProgressMedicalReportForm) {
    if (medicalReport) {
      const icd10CodesJson =  JSON.parse(medicalReport.medicalReportForm.icd10CodesJson);
      this.form.patchValue({
        medicalReportCategory: medicalReport.medicalReportForm.reportCategoryId ? medicalReport.medicalReportForm.reportCategoryId : null,
        dateOfConsultation: medicalReport.medicalReportForm.consultationDate ? medicalReport.medicalReportForm.consultationDate : null,
        bodySide: icd10CodesJson[0].bodySideAffected ? icd10CodesJson[0].bodySideAffected : null,
        severity: icd10CodesJson[0].severity ? icd10CodesJson[0].severity : null,
        reportDate: medicalReport.medicalReportForm.reportDate ? medicalReport.medicalReportForm.reportDate : null,
        healthCareProvider: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
        healthcareProviderId: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
        healthcareProviderPracticeNumber: medicalReport.medicalReportForm.healthcareProviderPracticeNumber ? medicalReport.medicalReportForm.healthcareProviderPracticeNumber : null,
        healthcareProviderName: medicalReport.medicalReportForm.healthcareProviderName ? medicalReport.medicalReportForm.healthcareProviderName : null,

        ctlNotStabilisedReason: medicalReport.notStabilisedReason ? medicalReport.notStabilisedReason : null,
        ctlTreatmentDetails: medicalReport.treatmentDetails ? medicalReport.treatmentDetails : null,
        ctlSpecialistReferralDetails: medicalReport.specialistReferralsHistory ? medicalReport.specialistReferralsHistory : null,
        ctlRadiologyFindings: medicalReport.radiologyFindings ? medicalReport.radiologyFindings : null,
        ctlOperationsProcedures: medicalReport.operationsProcedures ? medicalReport.operationsProcedures : null,
        ctlPhysiotherapy: medicalReport.physiotherapyTreatmentDetails ? medicalReport.physiotherapyTreatmentDetails : null,
        unfitEndDate: medicalReport.medicalReportForm.unfitEndDate ? medicalReport.medicalReportForm.unfitEndDate : null,
        unfitStartDate: medicalReport.medicalReportForm.unfitStartDate ? medicalReport.medicalReportForm.unfitStartDate : null,

        isUnfitForWork: medicalReport.medicalReportForm.unfitStartDate ? 'Yes' : 'No',
        radioStabilisedDetails: medicalReport.notStabilisedReason ? 'No' : 'Yes',
        radioAdditionalTreatment: medicalReport.treatmentDetails ? 'Yes' : 'No',
        radioSpecialistDetails: medicalReport.specialistReferralsHistory ? 'Yes' : 'No',
        radioRadiologyDetails: medicalReport.operationsProcedures ? 'Yes' : 'No',
        radioAdditionalOperationsProcedures: medicalReport.operationsProcedures ? 'Yes' : 'No',
        radioAdditionalPhysiotherapy: medicalReport.physiotherapyTreatmentDetails ? 'Yes' : 'No',
      });

      if (medicalReport.medicalReportForm.icd10CodesJson) {
        icd10CodesJson.forEach(e => {
          const icd10Code = new ICD10Code();
          icd10Code.icd10Code = e.icd10Code;
          icd10Code.icd10CodeDescription = e.icd10CodeDescription;
          icd10Code.icd10CodeId = e.icd10CodeId;
          icd10Code.icd10SubCategoryId = e.icd10SubCategoryId;

          this.selectedicdCodes.push(icd10Code);
        });
      }

      this.getMedicalEstimates(medicalReport.medicalReportForm.icd10Codes, medicalReport.medicalReportForm.reportDate)
    }
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

        this.getMedicalEstimates(codes, this.form.controls.reportDate.value)
      }
    });
  }

  disablesFormFields() {
    this.disableFormControl('radioStabilisedDetails');
    this.disableFormControl('radioAdditionalTreatment');
    this.disableFormControl('radioSpecialistDetails');
    this.disableFormControl('radioRadiologyDetails');
    this.disableFormControl('radioAdditionalOperationsProcedures');
    this.disableFormControl('radioAdditionalPhysiotherapy');
    this.disableFormControl('ctlNotStabilisedReason');
    this.disableFormControl('ctlTreatmentDetails');
    this.disableFormControl('ctlSpecialistReferralDetails');
    this.disableFormControl('ctlRadiologyFindings');
    this.disableFormControl('ctlOperationsProcedures');
    this.disableFormControl('ctlPhysiotherapy');
    this.disableFormControl('unfitEndDate');
    this.disableFormControl('unfitStartDate');
    this.disableFormControl('isUnfitForWork');
    this.disableFormControl('medicalReportCategory');
    this.disableFormControl('dateOfConsultation');
    this.disableFormControl('bodySide');
    this.disableFormControl('severity');
    this.disableFormControl('reportDate');
    this.disableFormControl('healthCareProvider');
    this.disableFormControl('healthcareProviderId');
  }

  enableFormFields() {
    this.enableFormControl('radioStabilisedDetails');
    this.enableFormControl('radioAdditionalTreatment');
    this.enableFormControl('radioSpecialistDetails');
    this.enableFormControl('radioRadiologyDetails');
    this.enableFormControl('radioAdditionalOperationsProcedures');
    this.enableFormControl('radioAdditionalPhysiotherapy');
    this.enableFormControl('ctlNotStabilisedReason');
    this.enableFormControl('ctlTreatmentDetails');
    this.enableFormControl('ctlSpecialistReferralDetails');
    this.enableFormControl('ctlRadiologyFindings');
    this.enableFormControl('ctlOperationsProcedures');
    this.enableFormControl('ctlPhysiotherapy');
    this.enableFormControl('unfitEndDate');
    this.enableFormControl('unfitStartDate');
    this.enableFormControl('isUnfitForWork');
    this.enableFormControl('medicalReportCategory');
    this.enableFormControl('dateOfConsultation');
    this.enableFormControl('bodySide');
    this.enableFormControl('severity');
    this.enableFormControl('reportDate');
    this.enableFormControl('healthCareProvider');
    this.enableFormControl('healthcareProviderId');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  getMedicalEstimates(codes: string, reportDate: Date){
    this.isLoadingEstimates$.next(true);
    let icd10CodeFilter = new ICD10EstimateFilter();
        icd10CodeFilter.eventType = this.eventType;
        icd10CodeFilter.icd10Codes = codes;
        icd10CodeFilter.icd10DiagnosticGroupId = this.icd10DiagnosticGroupId;
        icd10CodeFilter.reportDate = reportDate;
        this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
          if (results && results.length > 0) {
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
