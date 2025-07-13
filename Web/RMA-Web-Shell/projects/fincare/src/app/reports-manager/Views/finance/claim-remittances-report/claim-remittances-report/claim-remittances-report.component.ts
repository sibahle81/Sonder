import { DatePipe, KeyValue } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GetRemittanceTransactionsListParams } from 'projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-params';
import { ClaimRemittancesReportDatasource } from './claim-remittances-report.datasource';
import { Subscription } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GetRemittanceTransactionsList } from 'projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-model';
import { Constants } from 'projects/fincare/src/app/payment-manager/models/constants';

@Component({
  selector: 'app-claim-remittances-report',
  templateUrl: './claim-remittances-report.component.html',
  styleUrls: ['./claim-remittances-report.component.css']
})
export class ClaimRemittancesReportComponent implements OnInit, OnDestroy {
  reports = [
    { key: 'RM 34 Bank Details', value: 'RM 34 Bank Details'},
    { key: 'RM 34 By Cheque Number', value: 'RM 34 By Cheque Number'},
    { key: 'RM 35 By Cheque Number', value: 'RM 35 By Cheque Number'},
    { key: 'RM35 group by date range', value: 'RM35 group by date range'},
    { key: 'Under Payment', value: 'Under Payment'},
    { key: 'Non Payment', value: 'Non Payment'},
  ];

  standardFiltersExpanded = true;

  selectedReport: any;
  triggerReset: boolean;
  form: UntypedFormGroup;
  parameters: KeyValue<string, string>[];
  
  private postSubscribe: Subscription;
  
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    public readonly dataSource: ClaimRemittancesReportDatasource,
    private datePipe: DatePipe,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.createForm();
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (queryParams && queryParams.selectedReport && queryParams.startDate && queryParams.endDate) {
        this.selectedReport = this.reports.find(_s => _s.key === queryParams.selectedReport);
        const startDate = new Date(queryParams.startDate);
        const endDate = new Date(queryParams.endDate);

        this.form.patchValue({
          endDate: endDate,
          startDate: startDate
        });
        this.applyData();
      }
    });
    this.dataSource.setControls(this.paginator, this.sort);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl('')
    });

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    this.form.patchValue({
      endDate: endDate,
      startDate: startDate
    });
  }

  reportSelected($event: any) {
    this.selectedReport = $event;
  }

  reset() {
    this.standardFiltersExpanded = true;
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Batch No', def: 'batchReference', show: true },
      { display: 'No of Transactions', def: 'totalNoOfTransactions', show: true },
      { display: 'Batch Created Date', def: 'batchCreatedDate', show: true },
      { display: 'Action', def: 'Actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  applyData() {
    let requestParams: GetRemittanceTransactionsListParams = { 
      StartDate: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
      EndDate: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString)
    };

    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData(requestParams);

  }

  onViewDetails(getRemittanceTransactionsList: GetRemittanceTransactionsList) {
    this.router.navigate(['fincare/reports-manager/finance/finance-report/claim-remittances-transactions/', getRemittanceTransactionsList.batchReference],
      { queryParams: {
        selectedReport: this.selectedReport.key, startDate: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
        endDate: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString)
      }
    });
  }

  ngOnDestroy() {
    if (this.postSubscribe) {
      this.postSubscribe.unsubscribe();
    }
  }
}
