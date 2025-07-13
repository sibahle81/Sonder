import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { OtherEarningTypeModal } from '../other-earning-type-modal/other-earning-type-modal.component';
import { ICaptureEarningDetail, inits } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-detail-model';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { EarningType } from 'projects/claimcare/src/app/claim-manager/shared/entities/earning-type-model';
import { ClaimEarningTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/claim-earning-type';

@Component({
  selector: 'app-non-variable-earnings',
  templateUrl: './non-variable-earnings.component.html',
  styleUrls: ['./non-variable-earnings.component.css'],
  providers: [ClaimEarningService],
})

export class NonVariableEarningsComponent
  implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked, OnChanges {
  @Input() updateParentModel: ( part: Partial<any>, isFormValid: boolean ) => void;
  @Input() defaultValues: Partial<any>;
  @Input() nonVariableDetailUpdateList: Partial<ICaptureEarningDetail[]>;
  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator>;
  @Output() onFormValidChanged: EventEmitter<boolean> = new EventEmitter();

  public otherEarningBehaviorSubject$: BehaviorSubject<ICaptureEarningDetail> = new BehaviorSubject<ICaptureEarningDetail>(inits);
  public nonVariableEarnings: ICaptureEarningDetail[] = [];
  public dataSource: MatTableDataSource<ICaptureEarningDetail>;
  public displayedColumns: string[] = ['earningTypeName', 'nonVariableAmount', 'remove'];
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public formErrors: any;

  protected formArray: UntypedFormArray = this.formBuilder.array([]);
  protected formError: { [id: string]: string };
  protected totalColumnDisplay: boolean = false;
  protected pageSizeOptions;

  public formGroup: UntypedFormGroup = this.formBuilder.group({
    nonVariableEarnings: this.formArray,
  });
  protected unsubscribe: Subscription[] = [];
  protected otherEarningTypeId: number;

  constructor(
    protected dialog: MatDialog,
    protected formBuilder: UntypedFormBuilder,
    protected claimEarningService: ClaimEarningService,
    protected readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.formErrors = {
      earningTypeId: {},
      earningTypeName: {},
      amount: {},
    };
  }

  ngOnInit(): void {
    this.isLoading$.next(true);

    this.clearFormArray(this.formArray);

    if ((this.nonVariableDetailUpdateList !== null || undefined) && this.nonVariableDetailUpdateList.length > 0) {
      this.initializeExistingEarning();
    } else {
      this.initializeNewEarning();
    }

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

  public assessValidity(i, rowItem) {
    return this.nonVariableEarningsFormGroup().controls[i].get(rowItem).invalid;
  }

  public onAdd() {
    const dialogRef = this.dialog.open(OtherEarningTypeModal, {
      width: '410px',
    });
    dialogRef.afterClosed().subscribe((newRecordName) => {
      if (
        newRecordName == null ||
        newRecordName == undefined ||
        newRecordName == '' ||
        newRecordName == 'undefined' ||
        newRecordName == 'null'
      ) {
        return;
      } else {
        this.addNewRecordToGrid('Other (' + newRecordName + ')');
      }

      // Refresh the data-source
      this.dataSource = new MatTableDataSource<any>(this.nonVariableEarnings);
      this.dataSource.paginator = this.paginator?.last;
    });
  }

  public getSubTotal(): number {
    let total = 0;
    for (let i = 0; i < this.nonVariableEarnings?.length; i++) {
      total += this.nonVariableEarningsFormGroup()['controls'][i].value.nonVariableAmount
    }
    return total;
  }

  public onRemove(item: ICaptureEarningDetail) {
    const index: number = this.nonVariableEarnings.indexOf(item);

    if (index !== -1) {
      this.nonVariableEarnings.splice(index, 1);
      this.nonVariableEarningsFormGroup().removeAt(index);
    }

    this.dataSource = new MatTableDataSource<any>(this.nonVariableEarnings);
    this.dataSource.paginator = this.paginator?.last;
  }

  public showRemove(item: ICaptureEarningDetail): boolean {
    if (this.itemContains(item.earningTypeName, 'Other'))
      return true
    else
      return false;
  }

  public getTotalNonVariableEarning() {
    const tempList: any[] = [];
    tempList.push(this.nonVariableEarningsFormGroup()?.value);
    return tempList.map(t => t.nonVariableAmount).reduce((acc, value) => acc + value, 0);
  }

  private addRow(rowItem?: ICaptureEarningDetail, noUpdate?: boolean) {
    const row = this.formBuilder.group(
      {
        earningId: [rowItem.earningId ? rowItem.earningId : 0, []],
        earningDetailId: [rowItem.earningDetailId ? rowItem.earningDetailId : 0, []],
        earningTypeId: [rowItem.earningTypeId ? rowItem.earningTypeId : 0, []],
        earningTypeName: [rowItem.earningTypeName ? rowItem.earningTypeName : null, []],
        nonVariableAmount: [rowItem.nonVariableAmount ? rowItem.nonVariableAmount : 0, Validators.compose([Validators.min(0)])],
      },
      { updateOn: 'blur' }
    );
    this.formArray.push(row);
    if (!noUpdate) {
      this.updateView();
    }
  }

  private initForm() {
    const formChanges = this.formGroup.valueChanges.subscribe((val) => {
      this.updateParentModel(val, true);
    });
    this.unsubscribe.push(formChanges);
  }

  private initializeExistingEarning() {
    let sub = this.claimEarningService.getClaimEarningTypes(false).subscribe((earningTypes) => {
      this.otherEarningTypeId = earningTypes.find(x => x.earningTypeId === ClaimEarningTypeEnum.OtherNonVariable).earningTypeId;

      this.nonVariableDetailUpdateList.forEach((x, i) => {
        const currentRowItem: ICaptureEarningDetail = {
          idx: i + 1,
          earningId: x.earningId,
          earningDetailId: x.earningDetailId,
          earningTypeId: x.earningTypeId,
          earningTypeName: x.earningTypeId !== ClaimEarningTypeEnum.OtherNonVariable ? earningTypes.find(y => y.earningTypeId === x.earningTypeId)?.name : x.otherDescription,
          earningTypeRequired: earningTypes.find(y => y.earningTypeId === x.earningTypeId)?.isRequired,
          nonVariableAmount: x.nonVariableAmount,
        };
        this.nonVariableEarnings.push(currentRowItem);

        this.addRow(currentRowItem, false);
      });


      this.dataSource = new MatTableDataSource<any>(this.nonVariableEarnings);
      this.dataSource.paginator = this.paginator?.last;
      this.isLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  private initializeNewEarning() {
    let sub = this.claimEarningService.getClaimEarningTypes(false).subscribe((earningTypes) => {
      this.nonVariableEarnings = this.initializeRowItems(earningTypes);
      this.nonVariableEarnings.forEach((rowItem) => {
        this.addRow(rowItem, false);
      });

      this.dataSource = new MatTableDataSource<any>(this.nonVariableEarnings);
      this.dataSource.paginator = this.paginator?.last;
      this.isLoading$.next(false);
    });
    this.unsubscribe.push(sub);
  }

  private updateView() { }

  private initializeRowItems(variableEarningLookups: EarningType[]): ICaptureEarningDetail[] {
    let initializedRowItems: ICaptureEarningDetail[] = [];

    variableEarningLookups.forEach((x, i) => {
      const currentRowItem: ICaptureEarningDetail = {
        idx: i + 1,
        earningTypeId: x.earningTypeId,
        earningTypeName: x.name,
        earningTypeRequired: x.isRequired,
        nonVariableAmount: 0,
      };

      initializedRowItems.push(currentRowItem);
    });

    /*
    // Temporarily Remove the Other (variable) from the list. (so that it does not display in the front-end)
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

  private clearFormArray = (formArray: UntypedFormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  };

  private nonVariableEarningsFormGroup(): UntypedFormArray {
    return this.formGroup.get('nonVariableEarnings') as UntypedFormArray;
  }

  private addNewRecordToGrid(earningTypeName: string) {
    const newRow: ICaptureEarningDetail = {
      idx: this.nonVariableEarnings.length + 1,
      earningTypeId: this.otherEarningTypeId,
      earningTypeName: earningTypeName,
      earningTypeRequired: false,
      nonVariableAmount: 0,
    };

    this.nonVariableEarnings.push(newRow);
    this.addRow(newRow, false);
  }

}
