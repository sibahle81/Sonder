import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatTable } from '@angular/material/table';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { Constants } from 'projects/claimcare/src/app/constants';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';
import { ICD10Code } from 'projects/medicare/src/app/medi-manager/models/icd10-code';
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
import { DateRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-range.validator';
import { DateValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-validator';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { Constant } from 'src/app/shared/constants/constants';
import { ICD10CodeModel } from '../icd10-code-filter-dialog/icd10-code-model';
import { Icd10CodeListViewComponent } from '../icd10-code-list-view/icd10-code-list-view.component';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
@Component({
  selector: 'first-medical-report',
  templateUrl: './first-medical-report.component.html',
  styleUrls: ['./first-medical-report.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class FirstMedicalReportComponent implements OnInit {

  public form: UntypedFormGroup;
  public startDate = new Date();
  public medicalReportCategories: Lookup[];
  public bodySides: Lookup[];
  public nextReviewSelected = false;
  public isPreExistingConditionSelected = false;
  maxDate = new Date();
  public severities: Lookup[];

  public healthCareProviders: HealthCareProvider[];
  public showHealthCareProviders: boolean;
  public selectedicdCodes: ICD10Code[] = [];
  public eventType: EventTypeEnum;

  public isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public isLoadingEstimates$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public minEstimate: EstimateEnum = EstimateEnum.Min;
  public averageEstimate: EstimateEnum = EstimateEnum.Average;
  public maxEstimate: EstimateEnum = EstimateEnum.Max;

  public medicalEstimateType: EstimateTypeEnum = EstimateTypeEnum.Medical;
  public pdEstimateType: EstimateTypeEnum = EstimateTypeEnum.PDLumpSum;
  public ttdEstimateType: EstimateTypeEnum = EstimateTypeEnum.DaysOff;
  public icd10CodesEstimatesAmounts: Icd10CodeEstimateAmount[] = [];
  @ViewChild('icd10CodeTable') icd10CodeTable: MatTable<ICD10Code>;

  displayedColumns = ['icd10Code', 'minEsimatedAmount', 'avgEsimatedAmount', 'maxEsimatedAmount', 'minPDPercentage', 'avgPDPercentage', 'maxPDPercentage', 'minTTD', 'avgTTD', 'maxTTD'];

  public personEvent: PersonEventModel;
  icd10DiagnosticGroupId: number;
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
            this.getUserHealthCareProvidersForInternalUser();
          }
          else{
            this.getUserHealthCareProviders();
          }
        }
      });
    }
  }
  constructor(
    public dialogRef: MatDialogRef<FirstMedicalReportComponent>,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    public readonly datepipe: DatePipe,
    public dialog: MatDialog,
    public healthcareProviderService: HealthcareProviderService,
    private readonly medicalEstimateService: MedicalEstimatesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.createForm();
    this.getLookUps();
    this.eventType = this.data.eventType;
    this.personEvent = this.data.personEvent;

    if (this.data.firstMedicalReportForm) {
      this.icd10DiagnosticGroupId = this.personEvent.physicalDamages[0].icd10DiagnosticGroupId;
      this.patchForm(this.data.firstMedicalReportForm);
      if(this.personEvent.isStraightThroughProcess){
        this.disableControls();
      }
    }
    this.getUserHealthCareProviders();
  }

  disableControls() {
    this.form.get('medicalReportCategory').disable();
    this.form.get('dateOfConsultation').disable();
    this.form.get('nextReviewDateApplicable').disable();
    this.form.get('dateOfNextReview').disable();
    this.form.get('bodySide').disable();
    this.form.get('severity').disable();
    this.form.get('reportDate').disable();
    this.form.get('healthCareProvider').disable();
    this.form.get('healthcareProviderPracticeNumber').disable();
    this.form.get('healthcareProviderName').disable();
    this.form.get('clinicalDescription').disable();
    this.form.get('mechanismOfInjury').disable();
    this.form.get('isInjuryMechanismConsistent').disable();
    this.form.get('isPreExistingConditions').disable();
    this.form.get('preExistingConditions').disable();
  }

  createForm() {
    this.form = this.formBuilder.group({
      medicalReportCategory: new UntypedFormControl('', [Validators.required]),
      dateOfConsultation: new UntypedFormControl('', [Validators.required]),
      nextReviewDateApplicable: new UntypedFormControl(''),
      dateOfNextReview: new UntypedFormControl(''),
      bodySide: new UntypedFormControl('', [Validators.required]),
      severity: new UntypedFormControl('', [Validators.required]),
      reportDate: new UntypedFormControl({ value: new Date(), disabled: true }),
      healthCareProvider: new UntypedFormControl('', [Validators.required]),
      healthcareProviderId: new UntypedFormControl(''),
      healthcareProviderPracticeNumber: new UntypedFormControl({ value: '', disabled: true },[Validators.required]),
      healthcareProviderName: new UntypedFormControl({ value: '', disabled: true },[Validators.required]),
      clinicalDescription: new UntypedFormControl('', [Validators.required]),
      mechanismOfInjury: new UntypedFormControl(''),
      isInjuryMechanismConsistent: new UntypedFormControl(''),
      isPreExistingConditions: new UntypedFormControl(''),
      preExistingConditions: new UntypedFormControl(''),
      lastDayOff: new UntypedFormControl(''),
      firstDayOff: new UntypedFormControl(''),
      isUnfitForWork: new UntypedFormControl(''),
      estimatedDaysOff: new UntypedFormControl({ value: '', disabled: true }),
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
    this.healthcareProviderService.GetHealthCareProviders().subscribe(
      userHealthCareProviders => {
        if (userHealthCareProviders) {
          if (userHealthCareProviders.length === 1) {
            this.showHealthCareProviders = false;
            this.setHealthCareProviderDetails(userHealthCareProviders[0]);
          } else {
            this.showHealthCareProviders = true;
            this.healthCareProviders = userHealthCareProviders;
          }
        }
      }
    );
  }

  getUserHealthCareProvidersForInternalUser(): void {
    this.healthcareProviderService.GetHealthCareProviders().subscribe(
      userHealthCareProviders => {
        if (userHealthCareProviders) {
          this.healthCareProviders = userHealthCareProviders;
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

  getMedicalReportCategories(): void {
    this.lookupService.getMedicalReportCategories().subscribe(data => {
      this.medicalReportCategories = data;
    });
  }

  healthCareProviderDetailsChange($event: any) {
    const healthCareProvider = this.healthCareProviders.find(a => a.rolePlayerId === $event.option.value);
    this.setHealthCareProviderDetails(healthCareProvider);
  }

  removedSeletedICD10Code(icd10CodeId: number) {
    if (this.selectedicdCodes.length > 1) {
      const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
      this.selectedicdCodes.splice(index, 1);
      this.icd10CodeTable.renderRows();
    } else {
      const index = this.selectedicdCodes.findIndex(a => a.icd10CodeId === icd10CodeId);
      this.selectedicdCodes.splice(index, 1);
    }
  }

  save() {
    const firstMedicalReport = this.readForm();
    this.dialogRef.close(firstMedicalReport);
  }

  cancel() {
    this.dialogRef.close();
  }

  readForm(): FirstMedicalReportForm {
    const firstMedicalReport = new FirstMedicalReportForm();
    const medicalReport = new MedicalReportForm();
    medicalReport.medicalReportSystemSource = SourceSystemEnum.Modernisation;
    medicalReport.reportCategoryId = this.form.controls.medicalReportCategory.value ? this.form.controls.medicalReportCategory.value : null;
    medicalReport.consultationDate = this.form.controls.dateOfConsultation.value ? this.form.controls.dateOfConsultation.value : null;
    medicalReport.nextReviewDate = this.form.controls.dateOfNextReview.value ? this.form.controls.dateOfNextReview.value : null;
    medicalReport.reportDate = this.form.controls.reportDate.value ? this.form.controls.reportDate.value : null;
    medicalReport.healthcareProviderId = this.form.controls.healthcareProviderId.value ? this.form.controls.healthcareProviderId.value : null;
    medicalReport.healthcareProviderName = this.form.controls.healthcareProviderName.value ? this.form.controls.healthcareProviderName.value : null;
    medicalReport.healthcareProviderPracticeNumber = this.form.controls.healthcareProviderPracticeNumber.value ? this.form.controls.healthcareProviderPracticeNumber.value : null;

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
    firstMedicalReport.medicalReportForm = medicalReport;
    firstMedicalReport.clinicalDescription = this.form.controls.clinicalDescription.value ? this.form.controls.clinicalDescription.value : null;
    firstMedicalReport.mechanismOfInjury = this.form.controls.mechanismOfInjury.value ? this.form.controls.mechanismOfInjury.value : null;
    firstMedicalReport.isInjuryMechanismConsistent = this.form.controls.isInjuryMechanismConsistent.value ? this.form.controls.isInjuryMechanismConsistent.value : false;
    firstMedicalReport.isPreExistingConditions = this.form.controls.isPreExistingConditions.value ? this.form.controls.isPreExistingConditions.value : false;
    firstMedicalReport.preExistingConditions = this.form.controls.preExistingConditions.value ? this.form.controls.preExistingConditions.value : 'none';

    if (this.form.controls.isUnfitForWork.value && this.form.controls.isUnfitForWork.value === 'Yes') {
      firstMedicalReport.lastDayOff = this.form.controls.lastDayOff.value ? this.form.controls.lastDayOff.value : null;
      firstMedicalReport.firstDayOff = this.form.controls.firstDayOff.value ? this.form.controls.firstDayOff.value : null;
      firstMedicalReport.estimatedDaysOff = firstMedicalReport.firstDayOff.getDate() - firstMedicalReport.lastDayOff.getDate();
    }

    return firstMedicalReport;
  }

  onChecked(event: MatCheckboxChange) {
    this.nextReviewSelected = event.checked;
    const validators = [Validators.required, DateRangeValidator.endAfterStart('dateOfConsultation')];
    if (this.nextReviewSelected) {
      this.applyValidationToFormControl(this.form, validators, 'dateOfNextReview');
    } else {
      this.clearValidationToFormControl(this.form, 'dateOfNextReview');
    }
  }

  isUnfitForWorkChange(mrChange: MatRadioChange) {
    const firstValidators = [Validators.required, DateValidator.checkIfDateLessThan('firstDayOff', this.datepipe.transform(this.data.event.eventDate, Constants.dateString))];
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
        preExistingConditions: medicalReport.preExistingConditions ? medicalReport.preExistingConditions : false
      });

      if (medicalReport.estimatedDaysOff) {
        this.form.controls.isUnfitForWork.setValue('Yes');
        this.form.controls.lastDayOff.setValue(medicalReport.lastDayOff);
        this.form.controls.firstDayOff.setValue(medicalReport.firstDayOff);
        this.form.controls.estimatedDaysOff.setValue(medicalReport.estimatedDaysOff);
      } else {
        this.form.controls.isUnfitForWork.setValue('No');
      }
      if (medicalReport.isPreExistingConditions) {
        this.isPreExistingConditionSelected = true;
      }
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

          this.selectedicdCodes.push(icd10Code);
        });
      }

      this.getMedicalEstimates(medicalReport.medicalReportForm.icd10Codes, medicalReport.medicalReportForm.reportDate)
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

  lastDayOffChange() {
    var date1 = new Date (this.form.get('firstDayOff').value);
    var date2 = new Date (this.form.get('lastDayOff').value);
    var time = date2.getTime() - date1.getTime();
    var days = time / (1000 * 3600 * 24) + 1;
    this.form.get('estimatedDaysOff').setValue(days);
  }

  firstDayOffChange() {
    var date2 = new Date (this.form.get('lastDayOff').value);
    if (date2) {
      var date1 = new Date (this.form.get('firstDayOff').value);
      var time = date2.getTime() - date1.getTime();
      var days = time / (1000 * 3600 * 24) + 1;
      this.form.get('estimatedDaysOff').setValue(days);
    }
  }

  getMedicalEstimates(codes: string, reportDate: Date) {
    this.isLoadingEstimates$.next(true);
    let icd10CodeFilter = new ICD10EstimateFilter();
    icd10CodeFilter.eventType = this.eventType;
    icd10CodeFilter.icd10Codes = codes;
    icd10CodeFilter.icd10DiagnosticGroupId = this.icd10DiagnosticGroupId;
    icd10CodeFilter.reportDate = reportDate;
    this.medicalEstimateService.getICD10Estimates(icd10CodeFilter).subscribe(results => {
      if (results && results.length > 0) {
        if (this.icd10CodesEstimatesAmounts.length === 0) {
          this.icd10CodesEstimatesAmounts = results
        } else {
          results.forEach(icd10CodesEstimatesAmount => {
            const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(x => x.icd10Code === icd10CodesEstimatesAmount.icd10Code);
            if (!icd10CodeEstimate) {
              this.icd10CodesEstimatesAmounts.push(icd10CodesEstimatesAmount);
            }
          });

        }
      }
      this.isLoadingEstimates$.next(false);
    })
  }

  getEstimatedAmount(icd10Code: string, estimateEnum: EstimateEnum, estimateTypeEnum: EstimateTypeEnum): string {
    if(this.icd10CodesEstimatesAmounts && this.icd10CodesEstimatesAmounts.length > 0) {
      const icd10CodeEstimate = this.icd10CodesEstimatesAmounts.find(a => a.icd10Code === icd10Code);
      if (icd10CodeEstimate !== undefined) {
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
