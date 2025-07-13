import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BatchStatusEnum } from 'projects/shared-models-lib/src/lib/enums/batch-status-enum';
import { MonthlyPensionChangeReasonEnum } from 'projects/shared-models-lib/src/lib/enums/month-pension-change-reason-enum';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MonthlyPensionLedger } from '../../../shared-penscare/models/monthly-pension-ledger';
import { MonthlyPensionLedgerListDataSource } from './monthly-pension-ledger-list-datasource';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';

@Component({
  selector: 'app-monthly-pension-ledger-list',
  templateUrl: './monthly-pension-ledger-list.component.html',
  styleUrls: ['./../../../styles/penscare.css','./monthly-pension-ledger-list.component.css'],
  providers: [MonthlyPensionLedgerListDataSource]
})
export class MonthlyPensionLedgerListComponent implements OnInit {
  batchStatus = BatchStatusEnum;
  paymentStatus = PaymentStatusEnum;
  monthlyPensionChangeReason = MonthlyPensionChangeReasonEnum;
  @Input() monthlyPensionId: number
  @ViewChild('searchField', { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;

  menus: { title: string, action: string, disable: boolean}[];

  displayedColumns = ['pensionLedgerId','recipient','amount','paymentStatus','paye','additionalTax'];
  constructor(
    public readonly dataSource: MonthlyPensionLedgerListDataSource,
    private formBuilder: UntypedFormBuilder,
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
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.monthlyPensionId);
  }


  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  search(isInitialLoad?: boolean): void {
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(1, 5 , 'desc', '', this.currentQuery, this.monthlyPensionId);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'desc', '', '', this.monthlyPensionId);
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  filterMenu(item: MonthlyPensionLedger) {
    this.menus =
      [
        { title: 'Release', action: 'release', disable: item.batchStatus !== BatchStatusEnum.Waiting}
      ];
  }
}
