import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { ICaptureEarningDetail, IEarningMonth, inits } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-detail-model';
import { OtherEarningTypeModal } from 'projects/claimcare/src/app/claim-manager/views/claim-earnings/capture-earnings/other-earning-type-modal/other-earning-type-modal.component';
import { DatePipe } from '@angular/common';
import { Constants } from 'projects/claimcare/src/app/constants';
import { EarningType } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-type-model';
import { ClaimEarningTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/claim-earning-type';

@Component({
  selector: 'app-variable-earnings',
  templateUrl: './variable-earnings.component.html',
  styleUrls: ['./variable-earnings.component.css'],
  providers: [ClaimEarningService, DatePipe],
})
export class VariableEarningsComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, OnChanges {
  @Input() updateParentModel: (part: Partial<any>, isFormValid: boolean) => void;
  @Input() defaultValues: Partial<any>;
  @Input() eventDate: Partial<Date>;
  @Input() variableDetailUpdateList: Partial<ICaptureEarningDetail[]>;
  @Output() onFormValidChanged: EventEmitter<boolean> = new EventEmitter();

  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator>;

  public otherEarningBehaviorSubject$: BehaviorSubject<ICaptureEarningDetail> = new BehaviorSubject<ICaptureEarningDetail>(inits);
  public variableEarnings: ICaptureEarningDetail[] = [];
  public dataSource: MatTableDataSource<ICaptureEarningDetail>;
  public displayedColumns: string[] = [];
  public columnsToDisplay: string[] = [];
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public VARIABLE_EARNING_MONTH_CONSTANT = Constants.variableEarningMonthConstant;

  private unsubscribe: Subscription[] = [];

  protected formError: { [id: string]: string };
  protected totalColumnDisplay: boolean = false;
  protected pageSizeOptions;
  protected formArray: UntypedFormArray = this.formBuilder.array([]);
  protected otherEarningTypeId: number;

  public formGroup: UntypedFormGroup = this.formBuilder.group({ variableEarnings: this.formArray });
  public formErrors: any;

  constructor(
    protected dialog: MatDialog,
    protected formBuilder: UntypedFormBuilder,
    protected claimEarningService: ClaimEarningService,
    protected readonly changeDetectorRef: ChangeDetectorRef,
    protected datePipe: DatePipe
  ) {
    this.formErrors = {
    };
  }

  ngOnInit(): void {
    this.isLoading$.next(true);

    this.generateDynamicColumnHeaders();
    this.clearFormArray(this.formArray);

    if ((this.variableDetailUpdateList !== null || undefined) && this.variableDetailUpdateList.length > 0)
      this.initializeExistingEarning();
    else
      this.initializeNewEarning();

    this.initForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  ngAfterViewInit() { }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.onFormValidChanged.emit(this.formGroup.valid);
  }

  public getMonthValue(column: string, item: ICaptureEarningDetail) {
    return item.months.find(x => x.month === column).amount;
  }

  public getFormControlName(column: string, item: ICaptureEarningDetail) {
    return item.months.find(x => x.month === column).month;
  }

  public assessValidity(rowIndex, column: any, item: ICaptureEarningDetail) {
    let columnIndex = item.months.findIndex(x => x.month === column);
    let months = this.variableEarningsFormGroup().controls[rowIndex].get('months');

    if (months.value[columnIndex].amount >= 0)
      return true;
    else
      return false;
  }

  public getFullTotal(): number {
    return this.calculateGridTotal();
  }

  public calculateRowTotal(index: number): number {
    const variableEarningRow = this.formGroup.value.variableEarnings[index];
    let total = 0;

    for (let i = 0; i < this.VARIABLE_EARNING_MONTH_CONSTANT; i++) {
      total += variableEarningRow.months[i].amount;
    }

    variableEarningRow.total = total;
    this.variableEarningsFormGroup()['controls'][index]['controls'].total.patchValue(total);

    let formControls = this.variableEarningsFormGroup()['controls'];
    formControls.forEach((fc) => {
      if (fc.dirty && fc.touched && fc.value.total > 0) {
        fc['controls'].total.clearValidators();
        fc['controls'].total.setValidators(Validators.compose([Validators.min(0)]));
      } else if (fc.dirty && fc.touched && fc.value.total === 0) {
        fc['controls'].total.clearValidators();
        fc['controls'].total.setValidators(Validators.compose([Validators.min(0)]));
      }
    });

    return total;
  }

  public onAdd() {
    const dialogRef = this.dialog.open(OtherEarningTypeModal, {
      width: '410px',
    });

    let sub = dialogRef.afterClosed().subscribe((newRecordName) => {
      if (
        newRecordName == null ||
        newRecordName == undefined ||
        newRecordName == '' ||
        newRecordName == 'undefined' ||
        newRecordName == 'null'
      ) {
        return;
      } else {
        this.addNewRecordToGrid('Other (' + newRecordName + ')')
      }

      // Refresh the data-source
      this.dataSource = new MatTableDataSource<any>(this.variableEarnings);
      this.dataSource.paginator = this.paginator?.last;
    });
    this.unsubscribe.push(sub);
  }

  public onRemove(item: ICaptureEarningDetail) {
    const index: number = this.variableEarnings.indexOf(item);
    if (index !== -1) {
      this.variableEarnings.splice(index, 1);
      this.variableEarningsFormGroup().removeAt(index);
    }
    this.dataSource = new MatTableDataSource<any>(this.variableEarnings);
    this.dataSource.paginator = this.paginator?.last;
  }

  public showRemove(item: ICaptureEarningDetail): boolean {
    if (this.itemContains(item.earningTypeName, 'Other'))
      return true
    else
      return false;
  }

  public getFormGroupName(column: any, item: ICaptureEarningDetail): number {
    let index = item.months.findIndex(x => x.month === column);
    return index;
  }

  private calculateGridTotal(): number {
    let total = 0;
    for (let i = 0; i < this.variableEarnings?.length; i++) {
      total += this.variableEarningsFormGroup()['controls'][i].value.total
    }
    return total;
  }

  private getPreviousMonth(month: number) {
    return this.datePipe.transform(new Date(this.eventDate.getFullYear(), this.eventDate.getMonth() - month, this.eventDate.getMonth()), 'yyyy-MM').toString();
  }

  private addRow(rowItem?: ICaptureEarningDetail, isUpdate?: boolean) {

    let dynamicMonthsList: any[] = [];

    if (isUpdate) {
      for (let i = 0; i < rowItem.months.length; i++) {
        let month = new UntypedFormGroup({
          'earningDetailId': new UntypedFormControl(rowItem.months[i].earningDetailId),
          'amount': new UntypedFormControl(rowItem.months[i].amount, Validators.compose([Validators.min(0)])),
          'month': new UntypedFormControl(rowItem.months[i].month)
        })
        dynamicMonthsList.push(month);
        rowItem.variableAmountTotal += rowItem.months[i].amount;
      }
    } else {
      for (let i = 0; i < rowItem.months.length; i++) {
        let month = new UntypedFormGroup({
          'earningDetailId': new UntypedFormControl(0),
          'amount': new UntypedFormControl(0, Validators.compose([Validators.min(0)])),
          'month': new UntypedFormControl('Month' + (i + 1) + ' | ' + this.getPreviousMonth(this.VARIABLE_EARNING_MONTH_CONSTANT - i))
        })
        dynamicMonthsList.push(month);
        rowItem.variableAmountTotal += rowItem.months[i].amount;
      }
    }

    const row: UntypedFormGroup = this.formBuilder.group(
      {
        earningId: [rowItem.earningId ? rowItem.earningId : 0, []],
        earningTypeId: [rowItem.earningTypeId ? rowItem.earningTypeId : 0, []],
        earningTypeName: [rowItem.earningTypeName ? rowItem.earningTypeName : null, []],
        total: [rowItem.variableAmountTotal ? rowItem.variableAmountTotal : 0, [Validators.compose([Validators.min(0)])]],
        months: this.formBuilder.array(dynamicMonthsList),
      },
      { updateOn: 'blur' }
    );

    this.formArray.push(row);

    if (!isUpdate) {
      this.updateView();
    }
  }

  private initForm() {
    const formChanges = this.formGroup.valueChanges.subscribe((val) => {
      this.updateParentModel(val, true);
    });
    this.unsubscribe.push(formChanges);
  }

  private updateView() { }

  private generateDynamicColumnHeaders() {
    this.columnsToDisplay.push('EarningType')
    for (let i = 0; i < this.VARIABLE_EARNING_MONTH_CONSTANT; i++) {
      let month = 'Month' + (i + 1) + ' | ' + this.getPreviousMonth(this.VARIABLE_EARNING_MONTH_CONSTANT - i);

      this.displayedColumns.push(month);
      this.columnsToDisplay.push(month);
    }
    this.columnsToDisplay.push('Sub Total')
    this.columnsToDisplay.push('Action')
  }

  private initializeNewEarning() {
    let sub = this.claimEarningService.getClaimEarningTypes(true).subscribe((earningTypes) => {
      this.variableEarnings = this.initializeNewEarningRowItems(earningTypes);
      this.variableEarnings.forEach((rowItem) => {
        this.addRow(rowItem, false);
      });

      this.dataSource = new MatTableDataSource<any>(this.variableEarnings);
      this.dataSource.paginator = this.paginator?.last;
      this.isLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  private initializeExistingEarning() {
    let sub = this.claimEarningService.getClaimEarningTypes(true).subscribe((earningTypes) => {
      this.otherEarningTypeId = earningTypes.find(x => x.earningTypeId === ClaimEarningTypeEnum.OtherVariable).earningTypeId;
      this.variableDetailUpdateList.forEach((x, i) => {
        const currentRowItem: ICaptureEarningDetail = {
          idx: i + 1,
          earningId: x.earningId,
          earningTypeId: x.earningTypeId,
          earningTypeName: x.earningTypeId !== ClaimEarningTypeEnum.OtherVariable ? earningTypes.find(y => y.earningTypeId === x.earningTypeId)?.name : x.otherDescription,
          earningTypeRequired: earningTypes.find(y => y.earningTypeId === x.earningTypeId)?.isRequired,
          months: this.initializeMonths(x.months),
        };
        this.variableEarnings.push(currentRowItem);

        this.addRow(currentRowItem, true);
      });

      this.dataSource = new MatTableDataSource<any>(this.variableEarnings);
      this.dataSource.paginator = this.paginator?.last;
      this.isLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  private initializeNewEarningRowItems(variableEarningLookups: EarningType[]): ICaptureEarningDetail[] {
    let initializedRowItems: ICaptureEarningDetail[] = [];

    variableEarningLookups.forEach((x, i) => {
      const currentRowItem: ICaptureEarningDetail = {
        idx: i + 1,
        earningTypeId: x.earningTypeId,
        earningTypeName: x.name,
        earningTypeRequired: x.isRequired,
        months: this.initializeMonths(),
        variableAmountTotal: 0,
      };
      initializedRowItems.push(currentRowItem);
    });

    /*
    // Temporarily Remove the Other (variable) from the list.
    // because we want to the user to be able to add other rows which will serve as other, then we will link them to the Other (variable)-header in the backend
    // We just remove it from the list so that it does not show in the front-end,
    // however we do need the id hence we broadcast that record so that we can access it later in the event the user has added other variables.
    */
    const found = initializedRowItems
      .filter((y) => this.itemContains(y.earningTypeName, 'Other'))
      .shift();
    if (found) {
      this.otherEarningBehaviorSubject$.next(found);
      this.otherEarningTypeId = found.earningTypeId;
      initializedRowItems = initializedRowItems.filter(
        (item) => item.earningTypeId !== found.earningTypeId
      );
    }

    return initializedRowItems;
  }

  private itemContains(obj, term: string): boolean {
    if (obj.indexOf(term) != -1) {
      return true;
    } else {
      return false;
    }
  }

  private clearFormArray = (formArray: UntypedFormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };

  private variableEarningsFormGroup(): UntypedFormArray {
    return this.formGroup.get('variableEarnings') as UntypedFormArray;
  }

  private addNewRecordToGrid(earningTypeName: string) {

    const newRow: ICaptureEarningDetail = {
      idx: this.variableEarnings.length + 1,
      earningTypeId: this.otherEarningTypeId,
      earningTypeName: earningTypeName,
      earningTypeRequired: false,
      months: this.initializeMonths(),
      variableAmountTotal: 0,
    };

    this.variableEarnings.push(newRow);
    this.addRow(newRow, false);
  }

  private initializeMonths(monthValues?: IEarningMonth[]): IEarningMonth[] {

    const monthElements: IEarningMonth[] = [];
    if (!monthValues) {
      for (let i = 0; i < this.VARIABLE_EARNING_MONTH_CONSTANT; i++) {
        const month: IEarningMonth = {
          month: 'Month' + (i + 1) + ' | ' + this.getPreviousMonth(this.VARIABLE_EARNING_MONTH_CONSTANT - i),
          amount: 0,
          earningDetailId: 0
        };
        monthElements.push(month);
      }
    } else {
      for (let i = 0; i < monthValues.length; i++) {
        const element = monthValues[i];
        const month: IEarningMonth = {
          month: element.month,
          amount: element.amount,
          earningDetailId: element.earningDetailId
        };
        monthElements.push(month);
      }
    }

    return monthElements;
  }
}
