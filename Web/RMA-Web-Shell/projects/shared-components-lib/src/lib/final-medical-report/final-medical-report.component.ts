import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { Icd10CodeEstimateAmount } from 'projects/shared-models-lib/src/lib/common/icd10-code-estimate-amount';
import { ICD10EstimateFilter } from 'projects/shared-models-lib/src/lib/common/icd10-estimate-filter';
import { EstimateEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { SourceSystemEnum } from 'projects/shared-models-lib/src/lib/enums/source-enums';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MedicalEstimatesService } from 'projects/shared-services-lib/src/lib/services/medical-estimates/medical-estimates.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { BehaviorSubject } from 'rxjs';
import { Constant } from 'src/app/shared/constants/constants';
import { ICD10CodeModel } from '../icd10-code-filter-dialog/icd10-code-model';
import { Icd10CodeListViewComponent } from '../icd10-code-list-view/icd10-code-list-view.component';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';

@Component({
  selector: 'final-medical-report',
  templateUrl: './final-medical-report.component.html',
  styleUrls: ['./final-medical-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class FinalMedicalReportComponent implements OnInit {

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
    public dialogRef: MatDialogRef<FinalMedicalReportComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly medicalService: ICD10CodeService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public dialog: MatDialog,
    private readonly medicalEstimateService: MedicalEstimatesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.createForm();
    this.getLookUps();
    this.eventType = this.data.eventType;
    this.personEvent = this.data.personEvent;

    if (this.data.finalMedicalReport) {
      this.data.finalMedicalReport.finalMedicalReportFormId === 0 ? this.disablesFormFields() : this.enableFormFields();
      this.disabled = this.data.finalMedicalReport.finalMedicalReportFormId === 0;
      this.icd10DiagnosticGroupId = this.personEvent.physicalDamages[0].icd10DiagnosticGroupId;
      this.patchForm(this.data.finalMedicalReport);
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      medicalReportCategory: new UntypedFormControl('', [Validators.required]),
      dateOfConsultation: new UntypedFormControl('', [Validators.required]),
      bodySide: new UntypedFormControl('', [Validators.required]),
      severity: new UntypedFormControl('', [Validators.required]),
      reportDate: new UntypedFormControl({ value: new Date(), disabled: true }),
      healthCareProvider: new UntypedFormControl('', [Validators.required]),
      healthcareProviderId: new UntypedFormControl(''),
      healthcareProviderPracticeNumber: new UntypedFormControl({value: '', disabled: true}),
      healthcareProviderName: new UntypedFormControl({value: '', disabled: true}),

      radioIsEventSoleContributorToDisablement: new UntypedFormControl(''),
      radioIsConditionStabilised: new UntypedFormControl(''),

      ctlContributingCauses: new UntypedFormControl(''),
      ctlMechanismOfInjury: new UntypedFormControl(''),
      ctlInjuryOrDiseaseDetails: new UntypedFormControl(''),
      ctlImpairmentFindings: new UntypedFormControl(''),
      ctlDateReturnToWork: new UntypedFormControl(''),
      ctlDateStabilised: new UntypedFormControl('')
    });
  }

  disablesFormFields() {
    this.disableFormControl('medicalReportCategory');
    this.disableFormControl('dateOfConsultation');
    this.disableFormControl('bodySide');
    this.disableFormControl('severity');
    this.disableFormControl('reportDate');
    this.disableFormControl('healthCareProvider');
    this.disableFormControl('healthcareProviderId');
    this.disableFormControl('healthcareProviderPracticeNumber');
    this.disableFormControl('healthcareProviderName');
    this.disableFormControl('radioIsEventSoleContributorToDisablement');
    this.disableFormControl('radioIsConditionStabilised');
    this.disableFormControl('ctlMechanismOfInjury');
    this.disableFormControl('ctlInjuryOrDiseaseDetails');
    this.disableFormControl('ctlImpairmentFindings');
    this.disableFormControl('ctlDateReturnToWork');
    this.disableFormControl('ctlDateStabilised');
  }

  enableFormFields() {
    this.enableFormControl('medicalReportCategory');
    this.enableFormControl('dateOfConsultation');
    this.enableFormControl('bodySide');
    this.enableFormControl('severity');
    this.enableFormControl('reportDate');
    this.enableFormControl('healthCareProvider');
    this.enableFormControl('healthcareProviderId');
    this.enableFormControl('healthcareProviderPracticeNumber');
    this.enableFormControl('healthcareProviderName');
    this.enableFormControl('radioIsEventSoleContributorToDisablement');
    this.enableFormControl('radioIsConditionStabilised');
    this.enableFormControl('ctlMechanismOfInjury');
    this.enableFormControl('ctlInjuryOrDiseaseDetails');
    this.enableFormControl('ctlImpairmentFindings');
    this.enableFormControl('ctlDateReturnToWork');
    this.enableFormControl('ctlDateStabilised');
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
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

  readForm(): FinalMedicalReportForm {
    const finalMedicalReport = new FinalMedicalReportForm();
    const medicalReport = new MedicalReportForm();
    medicalReport.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    medicalReport.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    medicalReport.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    medicalReport.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    medicalReport.healthcareProviderId = this.form.controls.healthcareProviderId.value ? this.form.controls.healthcareProviderId.value : null;
    medicalReport.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    medicalReport.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;

    finalMedicalReport.dateStabilised = this.form.controls.ctlDateStabilised.value ? this.form.controls.ctlDateStabilised.value : null;
    finalMedicalReport.pevStabilisedDate = this.form.controls.ctlDateStabilised.value ? this.form.controls.ctlDateStabilised.value : null;
    finalMedicalReport.mechanismOfInjury = this.form.controls.ctlMechanismOfInjury.value ? this.form.controls.ctlMechanismOfInjury.value : null;
    finalMedicalReport.additionalContributoryCauses = this.form.controls.ctlContributingCauses.value ? this.form.controls.ctlContributingCauses.value : null;
    finalMedicalReport.injuryOrDiseaseDescription = this.form.controls.ctlInjuryOrDiseaseDetails.value ? this.form.controls.ctlInjuryOrDiseaseDetails.value : null;
    finalMedicalReport.impairmentFindings = this.form.controls.ctlImpairmentFindings.value ? this.form.controls.ctlImpairmentFindings.value : null;
    finalMedicalReport.dateReturnToWork = this.form.controls.ctlDateReturnToWork.value ? this.form.controls.ctlDateReturnToWork.value : null;
    finalMedicalReport.isStabilised = this.form.controls.ctlDateStabilised.value ? true : false;

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

    medicalReport.icd10Codes  = codes ? codes : null;
    medicalReport.icd10CodesJson = simplifiedCodes ? JSON.stringify(simplifiedCodes) : null;
    finalMedicalReport.medicalReportForm = medicalReport;

    return finalMedicalReport;
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
        healthCareProvider: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
        healthcareProviderId: medicalReport.medicalReportForm.healthcareProviderId ? medicalReport.medicalReportForm.healthcareProviderId : null,
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
            const existingICD10Code = this.selectedicdCodes.find(selectedicdCodes => selectedicdCodes.icd10CodeId === icd10Code.icd10CodeId)
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
