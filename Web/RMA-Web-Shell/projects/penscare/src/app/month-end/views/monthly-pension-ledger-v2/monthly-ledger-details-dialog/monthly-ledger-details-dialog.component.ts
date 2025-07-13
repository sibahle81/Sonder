import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PenscareMonthEndService } from '../../../../pensioncase-manager/services/penscare-month-end.service';
import { MonthEndRunPensionCaseLedger } from '../../../../shared-penscare/models/month-end-pensioncase_ledger';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PagedRequest } from '../../../../../../../shared-models-lib/src/lib/pagination/PagedRequest';
import { MonthEndRunDateSearchRequest } from '../../../../shared-penscare/models/month-end-dates-search-request';
import { PagedRequestResult } from '../../../../../../../shared-models-lib/src/lib/pagination/PagedRequestResult';

@Component({
  selector: 'app-monthly-ledger-details-dialog',
  templateUrl: './monthly-ledger-details-dialog.component.html',
  styleUrls: ['./monthly-ledger-details-dialog.component.css']
})
export class MonthlyLedgerDetailsDialogComponent implements OnInit {
  title = 'Monthly Ledger Details';

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  dataSource: PagedRequestResult<MonthEndRunPensionCaseLedger>;
  constructor(
    private readonly dialog: MatDialog,
    public dialogRef: MatDialogRef<MonthlyLedgerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly pensionMonthEndService: PenscareMonthEndService) {
    this.title = data.title ? data.title : this.title;
  }
    ngOnInit(): void {
      this.loadMonthlyLedgers();
    }


  cancel(): void {
    this.dialogRef.close();
  }

  loadMonthlyLedgers(): void {
    var pagedRequest = new PagedRequest();
    pagedRequest.page = (this.paginator.pageIndex ?? 0) + 1;
    pagedRequest.pageSize = this.paginator.pageSize ?? 6;
    pagedRequest.orderBy = this.sort.active ?? "ClaimReferenceNumber";
    pagedRequest.isAscending = (this.sort.direction == 'asc');

    var searchParams = new MonthEndRunDateSearchRequest();
    searchParams.pensionCaseId = this.data.pensionCaseId;
    searchParams.monthEndRunDateId = this.data.monthEndRunDateId;
    searchParams.pagedRequest = pagedRequest;

    this.isLoading$.next(true);
    this.pensionMonthEndService.getMonthEndRunPensionCaseLedgers(searchParams).subscribe((result) => {
      this.isLoading$.next(false);
      if (result) {
        this.dataSource = result;
      }
    })
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'claimReferenceNumber', show: true },
      { def: 'beneficiaryName', show: true },
      { def: 'pensionAmount', show: true },
      { def: 'paye', show: true },
      { def: 'additionalTax', show: true },
      { def: 'paymentAmount', show: true },
      { def: 'pensionIncreaseId', show: true },
      { def: 'pensionLedgerPaymentStatusId', show: true },
    ];

    return columnDefinitions.filter((cd) => cd.show).map((cd) => cd.def);
  }
}
