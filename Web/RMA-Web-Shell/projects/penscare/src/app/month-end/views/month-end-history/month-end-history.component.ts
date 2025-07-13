import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BatchStatusEnum } from 'projects/shared-models-lib/src/lib/enums/batch-status-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthlyPension } from '../../../shared-penscare/models/monthly-pension.model';
import { MonthEndHistoryDataSource } from './month-end-history-datasource';

@Component({
  selector: 'app-month-end-history',
  templateUrl: './month-end-history.component.html',
  styleUrls: ['./../../../styles/penscare.css','./month-end-history.component.css'],
  providers: [MonthEndHistoryDataSource]
})
export class MonthEndHistoryComponent implements OnInit {

  @ViewChild('searchField', { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Output() loadMonthEndDates = new EventEmitter();

  batchStatus = BatchStatusEnum;
  viewMonthlyPensionLedgerList = false;
  selectedMonthlyPensionId: number;
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;

  menus: { title: string, action: string, disable: boolean}[];

  displayedColumns = ['paymentDate',  'totalAmount', 'releasedAmount','batchStatus','actions'];
  constructor(
    public readonly dataSource: MonthEndHistoryDataSource,
    private readonly penscareMonthEndService: PenscareMonthEndService,
    private formBuilder: UntypedFormBuilder,
    private readonly alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();

    this.search(true);
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }


  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  search(isInitialLoad?: boolean): void {
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(1, 5 , 'desc', '', this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'desc', '', '');
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  filterMenu(item: MonthlyPension) {
    this.menus =
      [
        { title: 'View', action: 'view', disable: false},
        { title: 'Release', action: 'release', disable: item.batchStatus !== BatchStatusEnum.Waiting}
      ];
  }

  onMenuItemClick(item, menu): void {
    switch (menu.action) {
      case 'view':
        this.selectedMonthlyPensionId = item.monthlyPensionId;
        this.viewMonthlyPensionLedgerList = true;
        break;
      case 'release':
        const releaseMonthEndRequest = {
            monthlyPensionId: item.monthlyPensionId
        }
        this.alertService.success('Month End Release scheduled successfully');
        this.penscareMonthEndService.releaseMonthEndPayments(releaseMonthEndRequest).subscribe();
        this.loadMonthEndDates.emit();
        break;
    }
  }
}
