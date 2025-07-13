import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MonthEndRunDateSearchRequest } from '../../../shared-penscare/models/month-end-dates-search-request';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PagedRequest } from '../../../../../../shared-models-lib/src/lib/pagination/PagedRequest';
import { BehaviorSubject } from 'rxjs';
import { PenscareMonthEndService } from '../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthEndRunLedgerSummary } from '../../../shared-penscare/models/month-end-ledger-summary';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { MonthlyLedgerDetailsDialogComponent } from './monthly-ledger-details-dialog/monthly-ledger-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'monthly-pension-ledger-v2',
  templateUrl: './monthly-pension-ledger-v2.component.html',
  styleUrls: ['./monthly-pension-ledger-v2.component.css']
})
export class MonthlyPensionLedgerV2Component implements OnInit {
  @Input() monthEndRunDateId: number;
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  dataSource: MonthEndRunLedgerSummary[];

  filterForm: UntypedFormGroup;

  constructor(
    private readonly pensionMonthEndService: PenscareMonthEndService,
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,) {

  }

  searchRequest: MonthEndRunDateSearchRequest;
  ngOnInit(): void {
    if (this.monthEndRunDateId) {
      this.searchRequest = new MonthEndRunDateSearchRequest();
      this.createFiltersForm();
      this.getMonthlyPensionSummary("");
    }
    
  }


  getMonthlyPensionSummary(searchTerm: string = "") {
    this.searchRequest.monthEndRunDateId = this.monthEndRunDateId;
    this.searchRequest.pagedRequest = this.getPagedRequest();
    this.searchRequest.pagedRequest.searchCriteria = searchTerm;
    this.isLoading$.next(true);
    this.pensionMonthEndService.getMonthEndRunLedgerSummary(this.searchRequest).subscribe((result) => {
      if (result) {
        this.isLoading$.next(false);
        this.dataSource = result.data;
      }
    });

  }

  getPagedRequest(): PagedRequest {
    var pagedRequest = new PagedRequest();
    pagedRequest.page = (this.paginator.pageIndex ?? 0) + 1;
    pagedRequest.pageSize = this.paginator.pageSize ?? 50;
    pagedRequest.orderBy = this.sort.active;
    pagedRequest.isAscending = (this.sort.direction == 'asc');

    return pagedRequest;
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'pensionCaseNumber', show: true },
      { def: 'pensionerDisplayName', show: true },
      { def: 'pensionAmount', show: true },
      { def: 'paye', show: true },
      { def: 'additionalTax', show: true },
      { def: 'paymentAmount', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }

  createFiltersForm(): void {
    if (this.filterForm) { return; }
    this.filterForm = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }]
    });

    this.filterForm.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.getMonthlyPensionSummary(response as string);
    });
  }

  openMonthlyLedgerDetailsDialog($event: MonthEndRunLedgerSummary) {
    const dialogRef = this.dialog.open(MonthlyLedgerDetailsDialogComponent, {
      width: '85%',
      disableClose: true,
      data: {
        title: "Month End Ledgers - " + $event.pensionCaseNumber,
        pensionCaseId: $event.pensionCaseId,
        monthEndRunDateId: this.monthEndRunDateId
      }
    });
  }
}
