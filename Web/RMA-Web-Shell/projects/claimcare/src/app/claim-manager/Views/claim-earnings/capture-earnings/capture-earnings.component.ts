import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Observer, Subscription } from 'rxjs';
import { ICaptureEarningTab } from './capture-earnings-tab';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { EarningDetail, ICaptureEarningDetail } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-detail-model';
import { Earning } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-model';
import { Constants } from 'projects/claimcare/src/app/constants';
import { ClaimEarningTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/claim-earning-type';
import { PersonEventModel } from '../../../shared/entities/personEvent/personEvent.model';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';
import { uniqueInputValidator } from 'projects/shared-utilities-lib/src/lib/validators/unique-input-validator';
import { exactYearsValidator } from 'projects/shared-utilities-lib/src/lib/validators/exact-years-validator';
import { minYearsValidator } from 'projects/shared-utilities-lib/src/lib/validators/minimum-years-validator';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { GenericDocument } from 'projects/shared-components-lib/src/lib/models/generic-document';

@Component({
  templateUrl: './capture-earnings.component.html',
  styleUrls: ['./capture-earnings.component.css'],
  providers: [DatePipe],
})
export class CaptureEarningsComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Output() updatePersonEvent = new EventEmitter<boolean>();

  isSavingEarnings$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  section21Form: UntypedFormGroup;

  earningsBehaviorSubject$: BehaviorSubject<any> = new BehaviorSubject<any>('');
  nonVariableDetailUpdateList: ICaptureEarningDetail[] = [];
  variableDetailUpdateList: ICaptureEarningDetail[] = [];

  personEvent: PersonEventModel;

  asyncTabs: Observable<ICaptureEarningTab[]>;

  MONTHS = Constants.variableEarningMonthConstant;

  isUpdate: boolean = false;
  nonVariableFormIsValid: boolean;
  variableFormIsValid: boolean;
  captureMonths = false;

  isNonVariable: boolean = true;
  isVariable: boolean = false;

  unsubscribe: Subscription[] = [];
  earningId: number | null;

  color = 'primary';
  mode = 'indeterminate';

  eventDate: Date;

  variableItems: EarningDetail[] = [];
  nonVariableItems: EarningDetail[] = [];

  selectedIndex = 0;

  documentSet = DocumentSetEnum.EmployeeEarningsDocuments;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  documentTypeFilter = [DocumentTypeEnum.RMAFormulaSheet];
  documentComponentReady$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  section51FormulaSheetOverride$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  maxDate = new Date().getCorrectUCTDate();

  constructor(
    public dialogRef: MatDialogRef<CaptureEarningsComponent>,
    private readonly claimEarningService: ClaimEarningService,
    private readonly alertService: AlertService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit() {
    this.asyncTabs = new Observable(
      (observer: Observer<ICaptureEarningTab[]>) => {
        setTimeout(() => {
          observer.next([
            { label: 'NonVariableEarnings', content: 'Non Variable Earnings' },
            { label: 'VariableEarnings', content: 'Variable Earnings' },
          ]);
          this.earningId = this.data?.earningId;
          this.eventDate = this.data?.eventDate;
          this.personEvent = this.data?.personEvent;

          if (this.data?.earningItem != null) {
            this.populateFormForEdit(this.data?.earningItem);
            this.isUpdate = true;
          }
        }, 500);
      }
    );
    this.unsubscribe.push(this.asyncTabs.subscribe(res => { }));

    if ((this.data?.isTrainee || this.data?.isAgeUnder26) && this.data.earningType != EarningsTypeEnum.Current) {
      this.createSection21Form();
    }
  }

  createSection21Form() {
    this.section21Form = this.formBuilder.group({
      sec51EmpNo: [{ value: null, disabled: false }, [Validators.required, uniqueInputValidator(this.data.personEvent.rolePlayer.person.personEmployments[0].employeeNumber)]],
      sec51DateOfBirth: [{ value: null, disabled: !this.data?.isAgeUnder26 }, [Validators.required, exactYearsValidator(26)]],
      sec51DateOfQualification: [{ value: null, disabled: !this.data?.isTrainee }, [Validators.required]],
      sec51DateOfEngagement: [{ value: null, disabled: !this.data?.isTrainee && !this.data?.isAgeUnder26 }, [Validators.required, minYearsValidator(5)]],
    });

    this.setSection21Form();
  }

  setSection21Form() {
    let earning = this.data.earningItem as Earning;

    this.section21Form.patchValue({
      sec51EmpNo: earning?.sec51EmpNo ? earning.sec51EmpNo : null,
      sec51DateOfBirth: earning?.sec51DateOfBirth ? earning.sec51DateOfBirth : null,
      sec51DateOfQualification: earning?.sec51DateOfQualification ? earning.sec51DateOfQualification : null,
      sec51DateOfEngagement: earning?.sec51DateOfEngagement ? earning.sec51DateOfEngagement : null
    });

    if (earning?.sec51DateOfBirth) {
      this.handleControls('sec51DateOfBirth', earning.sec51DateOfBirth);
    }

    if (earning?.sec51DateOfQualification) {
      this.handleControls('sec51DateOfQualification', earning.sec51DateOfQualification);
    }

    if (earning?.sec51DateOfEngagement) {
      this.handleControls('sec51DateOfEngagement', earning.sec51DateOfEngagement);
    }
  }

  readSection21Form(earning: Earning) {
    if (!this.section21Form) { return; }
    earning.sec51EmpNo = this.section21Form.controls.sec51EmpNo.value;
    earning.sec51DateOfBirth = this.section21Form.controls.sec51DateOfBirth.value;
    earning.sec51DateOfQualification = this.section21Form.controls.sec51DateOfQualification.value;
    earning.sec51DateOfEngagement = this.section21Form.controls.sec51DateOfEngagement.value;
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    const newEarning = this.earningsBehaviorSubject$.value;
    const searchList = newEarning?.nonVariableEarnings as ICaptureEarningDetail[];

    if (searchList) {
      const amount = searchList.filter(x => x.earningTypeId === ClaimEarningTypeEnum.BasicSalary)[0].nonVariableAmount;

      if (amount <= 0)
        return false;
      else if (!this.nonVariableFormIsValid || !this.variableFormIsValid) {
        return false;
      } else if ((this.section21Form && !this.section21Form?.valid && !this.section51FormulaSheetOverride$.value)) {
        this.section21Form.controls.sec51EmpNo.markAsTouched();
        this.section21Form.controls.sec51EmpNo.updateValueAndValidity();

        this.section21Form.controls.sec51DateOfBirth.markAsTouched();
        this.section21Form.controls.sec51DateOfBirth.updateValueAndValidity();

        this.section21Form.controls.sec51DateOfQualification.markAsTouched();
        this.section21Form.controls.sec51DateOfQualification.updateValueAndValidity();

        this.section21Form.controls.sec51DateOfEngagement.markAsTouched();
        this.section21Form.controls.sec51DateOfEngagement.updateValueAndValidity();

        return false;
      }
      else
        return true;
    }
  }

  onSave() {
    this.isSavingEarnings$.next(true);
    const newEarning = this.earningsBehaviorSubject$.value;

    if (newEarning === null || undefined) {
      this.alertService.error('Unable to save your earnings, Please you have captured data', 'Not Saved', true);
    }

    let earning = new Earning();
    earning.earningDetails = [];

    // Earnings | Header
    earning.personEventId = this.personEvent.personEventId;
    earning.nonVariableSubTotal = this.sumNonVariableSubTotal(newEarning?.nonVariableEarnings);
    earning.variableSubTotal = this.sumVariableSubTotal(newEarning?.variableEarnings);
    earning.total = this.displayPayableEarnings();
    earning.earningsType = this.data.earningType;
    earning.isEstimated = false;
    earning.isVerified = false;

    this.readSection21Form(earning);

    // Earnings | Details
    newEarning?.nonVariableEarnings.forEach((element: ICaptureEarningDetail) => {
      let nonVariableEarningDetail = {} as EarningDetail;
      nonVariableEarningDetail.earningTypeId = element.earningTypeId;
      nonVariableEarningDetail.earningDetailId = element?.earningDetailId ?? 0;
      nonVariableEarningDetail.otherDescription = this.itemContains(element.earningTypeName, 'Other') ? element.earningTypeName.toString() : null;
      nonVariableEarningDetail.amount = element.nonVariableAmount;
      earning.earningDetails.push(nonVariableEarningDetail);
    });

    newEarning?.variableEarnings.forEach((element: ICaptureEarningDetail) => {
      element.months.forEach((month, index) => {
        earning.earningDetails.push(this.setVariableEarningDetails(element, month.amount, index));
      });
    });

    this.personEvent.earnings = this.personEvent.earnings ? this.personEvent.earnings : [];
    const index = this.personEvent.earnings.findIndex(s => s == earning);
    if (index > -1) {
      this.personEvent.earnings[index] = earning;
    } else {
      this.personEvent.earnings.push(earning);
    }

    this.dialogRef.close();
    this.isSavingEarnings$.next(false);
  }

  onUpdate() {
    const newEarning = this.earningsBehaviorSubject$.value;

    if (newEarning === null || undefined) {
      this.alertService.error('Unable to update your earnings', 'Not Updated', true);
    }

    this.isSavingEarnings$.next(true);

    let earning = this.data.earningItem as Earning;

    let updateNonVariableChanges = newEarning?.nonVariableEarnings as ICaptureEarningDetail[];
    let updateVariableChanges = newEarning?.variableEarnings as ICaptureEarningDetail[];

    // Earnings | Header
    earning.nonVariableSubTotal = this.sumNonVariableSubTotal(updateNonVariableChanges);
    earning.variableSubTotal = this.sumVariableSubTotal(updateVariableChanges);
    earning.total = this.displayPayableEarnings();
    earning.isVerified = earning.isVerified ?? false;
    earning.modifiedDate = new Date().getCorrectUCTDate();

    this.readSection21Form(earning);

    // Earnings | Details
    earning.earningDetails = [];
    updateNonVariableChanges.forEach((element: ICaptureEarningDetail) => {
      let updateEarningDetail = {} as EarningDetail;
      updateEarningDetail.earningId = element.earningId;
      updateEarningDetail.earningDetailId = element?.earningDetailId ?? 0;
      updateEarningDetail.earningTypeId = element.earningTypeId;
      updateEarningDetail.otherDescription = this.itemContains(element.earningTypeName, 'Other') ? element.earningTypeName.toString() : null;
      updateEarningDetail.amount = element.nonVariableAmount;
      updateEarningDetail.month = null;
      earning.earningDetails.push(updateEarningDetail);
    });

    updateVariableChanges.forEach((element: ICaptureEarningDetail) => {
      element.months.forEach(month => {
        let updateEarningDetail = {} as EarningDetail;
        updateEarningDetail.earningId = element.earningId;
        updateEarningDetail.earningDetailId = element?.earningDetailId ?? 0;
        updateEarningDetail.earningTypeId = element.earningTypeId;
        updateEarningDetail.otherDescription = this.itemContains(element.earningTypeName, 'Other') ? element.earningTypeName.toString() : null;
        updateEarningDetail.amount = month.amount;
        updateEarningDetail.month = month.month;
        earning.earningDetails.push(updateEarningDetail);
      });
    });

    const index = this.personEvent.earnings.findIndex(s => s == earning);
    if (index > -1) {
      this.personEvent.earnings[index] = earning;
    } else {
      this.personEvent.earnings.push(earning);
    }

    this.dialogRef.close();
    this.isSavingEarnings$.next(false);
  }

  displayNonVariable(tab: string): boolean {
    if (tab === 'NonVariableEarnings') {
      return true;
    } else {
      return false;
    }
  }

  displayVariable(tab: string): boolean {
    if (tab === 'VariableEarnings') {
      return true;
    } else {
      return false;
    }
  }

  updateEarning = (part: Partial<any>, isFormValid: boolean) => {
    const newEaring = this.earningsBehaviorSubject$.value;
    const updatedEarning = { ...newEaring, ...part };
    this.earningsBehaviorSubject$.next(updatedEarning);
  };

  public onNonVariableFormValidChangedHandler(isValid: boolean): void {
    this.nonVariableFormIsValid = isValid;
  }

  public onVariableFormValidChangedHandler(isValid: boolean): void {
    this.variableFormIsValid = isValid;
  }

  public displayAvgVariables(): number {
    return this.getAvgVariables();
  }

  public displayBasicSalary() {
    return this.getBasicSalary();
  }

  public displayNonVariables() {
    return this.getNonVariables();
  }

  public displayPayableEarnings() {
    return this.getAvgVariables() + this.getBasicSalary() + this.getNonVariables();
  }

  private getAvgVariables(): number {
    let total = 0;
    let earnings = this.earningsBehaviorSubject$.value?.variableEarnings as ICaptureEarningDetail[];

    if (!earnings) {
      return total;
    }
    else {
      return total = this.sumVariableSubTotal(earnings) / this.MONTHS;
    }
  }

  private getBasicSalary() {
    let total = 0;
    let earnings = this.earningsBehaviorSubject$.value?.nonVariableEarnings as ICaptureEarningDetail[];

    if (earnings === null || earnings === undefined)
      return total;
    else
      return total = earnings?.find(x => x.earningTypeId === ClaimEarningTypeEnum.BasicSalary).nonVariableAmount;
  }

  private getNonVariables() {
    let total = 0;
    let earnings = this.earningsBehaviorSubject$.value?.nonVariableEarnings as ICaptureEarningDetail[];

    if (earnings === null || earnings === undefined)
      return total;
    else
      return total = this.sumNonVariableSubTotal(earnings.filter(x => x.earningTypeId !== ClaimEarningTypeEnum.BasicSalary));
  }

  private populateFormForEdit(earningItem: any) {
    this.formatNonVariableDataForUpdate(earningItem);
    this.formatVariableDataForUpdate(earningItem);
  }

  private formatVariableDataForUpdate(earningItem: any) {
    this.variableItems = earningItem?.earningDetails.filter(x => x.month) as EarningDetail[];

    this.variableDetailUpdateList = [];

    let groupBy = this.variableItems.reduce(function (r, a) {
      r[a.earningTypeId] = r[a.earningTypeId] || [];
      r[a.earningTypeId].push(a);
      return r;
    }, Object.create(null));

    var groupByList = Object.keys(groupBy).map((key) => [Number(key), groupBy[key]]);

    for (let i = 0; i < groupByList.length; i++) {
      const elementGrouped = groupByList[i][1] as EarningDetail[];
      let item = {} as ICaptureEarningDetail;

      //Common properties.
      item.earningId = elementGrouped[0]?.earningId;
      item.earningTypeId = elementGrouped[0]?.earningTypeId;
      item.otherDescription = elementGrouped[0]?.otherDescription;
      item.months = [];

      for (let j = 0; j < elementGrouped.length; j++) {
        const elementItem = elementGrouped[j] as EarningDetail;

        item.months.push({
          earningDetailId: elementItem.earningDetailId,
          amount: elementItem.amount,
          month: elementItem.month
        })
      }

      this.variableDetailUpdateList.push(item);
    }
  }

  private formatNonVariableDataForUpdate(earningItem: any) {
    this.nonVariableItems = earningItem?.earningDetails.filter(x => !x.month) as EarningDetail[];

    this.nonVariableDetailUpdateList = [];

    this.nonVariableItems.forEach(element => {
      let item = {} as ICaptureEarningDetail;

      item.earningDetailId = element.earningDetailId;
      item.earningId = element.earningId;
      item.earningTypeId = element.earningTypeId;
      item.otherDescription = element.otherDescription;
      item.nonVariableAmount = element.amount;

      this.nonVariableDetailUpdateList.push(item);
    });
  }

  private setVariableEarningDetails(element: ICaptureEarningDetail, amount: number, index: number): EarningDetail {
    let variableEarningDetail = {} as EarningDetail;

    variableEarningDetail.earningTypeId = element.earningTypeId;
    variableEarningDetail.otherDescription = this.itemContains(element.earningTypeName, 'Other') ? element.earningTypeName.toString() : null;
    variableEarningDetail.month = 'Month' + (index + 1) + ' | ' + this.getPreviousMonth(Constants.variableEarningMonthConstant - index);
    variableEarningDetail.amount = amount;

    return variableEarningDetail;
  }

  private itemContains(obj, term: string): boolean {
    if (obj !== null || undefined) {
      if (obj.indexOf(term) != -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private getPreviousMonth(month: number) {
    return this.datePipe.transform(new Date(this.eventDate.getFullYear(), this.eventDate.getMonth() - month, this.eventDate.getMonth()), 'yyyy-MM').toString();
  }

  private sumVariableSubTotal(variableEarnings: any[]): number {
    let total = 0;
    for (let i = 0; i < variableEarnings.length; i++) {
      const element = variableEarnings[i] as ICaptureEarningDetail;
      for (let j = 0; j < Constants.variableEarningMonthConstant; j++) {
        total += element.months[j].amount;
      }
    }
    return total;
  }

  private sumNonVariableSubTotal(nonVariableEarnings: ICaptureEarningDetail[]): number {
    const result = nonVariableEarnings.reduce<number>((accumulator, obj) => {
      return accumulator + obj.nonVariableAmount;
    }, 0);
    return result;
  }

  getEarningType(earningsType: EarningsTypeEnum): string {
    return this.formatText(earningsType ? EarningsTypeEnum[earningsType] : 'N/A');
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  handleControls(changedField: string, event: Date): void {
    if (this.data.isAgeUnder26 && !this.data.isTrainee) {
      if (changedField == 'sec51DateOfBirth') {
        if (event) {
          this.disableFormControl('sec51DateOfEngagement');
        } else {
          this.enableFormControl('sec51DateOfEngagement');
        }
      }

      if (changedField == 'sec51DateOfEngagement') {
        if (event) {
          this.disableFormControl('sec51DateOfBirth');
        } else {
          this.enableFormControl('sec51DateOfBirth');
        }
      }
    }

    if (this.data.isTrainee && !this.data.isAgeUnder26) {
      if (changedField == 'sec51DateOfQualification') {
        if (event) {
          this.disableFormControl('sec51DateOfEngagement');
        } else {
          this.enableFormControl('sec51DateOfEngagement');
        }
      }

      if (changedField == 'sec51DateOfEngagement') {
        if (event) {
          this.disableFormControl('sec51DateOfQualification');
        } else {
          this.enableFormControl('sec51DateOfQualification');
        }
      }
    }

    if (this.data.isTrainee && this.data.isAgeUnder26) {
      if (changedField == 'sec51DateOfBirth') {
        if (event) {
          this.disableFormControl('sec51DateOfQualification');
          this.disableFormControl('sec51DateOfEngagement');
        } else {
          this.enableFormControl('sec51DateOfQualification');
          this.enableFormControl('sec51DateOfEngagement');
        }
      }

      if (changedField == 'sec51DateOfQualification') {
        if (event) {
          this.disableFormControl('sec51DateOfBirth');
          this.disableFormControl('sec51DateOfEngagement');
        } else {
          this.enableFormControl('sec51DateOfBirth');
          this.enableFormControl('sec51DateOfEngagement');
        }
      }

      if (changedField == 'sec51DateOfEngagement') {
        if (event) {
          this.disableFormControl('sec51DateOfBirth');
          this.disableFormControl('sec51DateOfQualification');
        } else {
          this.enableFormControl('sec51DateOfBirth');
          this.enableFormControl('sec51DateOfQualification');
        }
      }
    }
  }

  resetSection51Form() {
    this.section21Form.controls.sec51DateOfBirth.reset();
    this.section21Form.controls.sec51DateOfQualification.reset();
    this.section21Form.controls.sec51DateOfEngagement.reset();

    this.enableFormControl('sec51DateOfEngagement');

    if (this.data.isAgeUnder26) {
      this.enableFormControl('sec51DateOfBirth');
    }

    if (this.data.isTrainee) {
      this.enableFormControl('sec51DateOfQualification');
    }

    this.section21Form.updateValueAndValidity();
  }

  disableFormControl(controlName: string) {
    const control = this.section21Form.get(controlName);
    if (control) {
      control.reset();
      control.setErrors(null);
      control.disable();
    }
  }

  enableFormControl(controlName: string) {
    const control = this.section21Form.get(controlName);
    if (control) {
      control.setErrors(null);
      control.enable();
    }
  }

  setDocumentComponentReady($event: boolean) {
    if ($event) {
      this.documentComponentReady$.next(true);
    }
  }

  isRMAFormulaSheetDocumentsUploaded($event: GenericDocument[]) {
    if ($event.some(s => s.documentType == DocumentTypeEnum.RMAFormulaSheet)) {
      this.section21Form.reset();

      this.disableFormControl('sec51EmpNo');
      this.disableFormControl('sec51DateOfBirth');
      this.disableFormControl('sec51DateOfQualification');
      this.disableFormControl('sec51DateOfEngagement');

      this.section51FormulaSheetOverride$.next(true);
    } else {
      this.section51FormulaSheetOverride$.next(false);
      this.createSection21Form();
    }
  }

}
