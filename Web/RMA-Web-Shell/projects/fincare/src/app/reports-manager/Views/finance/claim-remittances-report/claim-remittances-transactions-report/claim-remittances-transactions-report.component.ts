import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ClaimRemittancesTransactionsReportDatasource } from './claim-remittances-transactions-report.datasource';
import { GetRemittanceTransactionsListDetails } from 'projects/fincare/src/app/payment-manager/models/get-remittance-transactions-list-details-model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewRemittanceReportComponent } from '../view-remittance-report/view-remittance-report.component';

@Component({
  selector: 'app-claim-remittances-transactions-report',
  templateUrl: './claim-remittances-transactions-report.component.html',
  styleUrls: ['./claim-remittances-transactions-report.component.css']
})
export class ClaimRemittancesTransactionsReportComponent implements OnInit {
  batchReference;

  selectedReport;
  startDate;
  endDate;

  reports = [
    { key: 'RM 34 Bank Details', value: 'RMA.Reports.FinCare/RMAFinCareRemittanceRM34BankDetailsByPaymentId'},
    { key: 'RM 34 By Cheque Number', value: 'RMA.Reports.FinCare/RMAFinCareRM34MemberRemittance'},
    { key: 'RM 35 By Cheque Number', value: 'RMA.Reports.FinCare/RMAFinanceRemittanceRM35ChequeNumberReportByPaymentId'},
    { key: 'RM35 group by date range', value: 'RMA.Reports.FinCare/RMAFinanceRemittanceRM35ChequeNumberReportByPaymentId'},
    { key: 'Under Payment', value: 'RMA.Reports.FinCare/RMAFinanceUnderPaymentReport'},
    { key: 'Non Payment', value: 'RMA.Reports.FinCare/RMAFinanceNonPaymentReport'},
  ];
  
  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  constructor(
    public readonly dataSource: ClaimRemittancesTransactionsReportDatasource,
    private readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    private readonly dialog: MatDialog,
  ) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
        if (params.reference) {
            this.batchReference = params.reference;
        }
    });
    this.activatedRoute.queryParams.subscribe((queryParams: any) => {
      if (queryParams.selectedReport) {
          this.selectedReport = queryParams.selectedReport;
      }
      if (queryParams.startDate) {
          this.startDate = queryParams.startDate;
      }
      if (queryParams.endDate) {
          this.endDate = queryParams.endDate;
      }
    });
    this.dataSource.setControls(this.paginator, this.sort);
    this.getRemittancesTransactionsList(this.batchReference);
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { display: 'Batch No', def: 'batchReference', show: true },
      { display: 'Reference', def: 'reference', show: true },
      { display: 'Payee', def: 'payee', show: true },
      { display: 'Reconciliation Date', def: 'reconciliationDate', show: true },
      { display: 'Action', def: 'Actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getRemittancesTransactionsList(batchReference) {
    this.dataSource.getData(batchReference);
  }

  back() {
    this.router.navigate(['fincare/reports-manager/finance/finance-report/claim-remittances/'], { queryParams: {selectedReport: this.selectedReport, startDate: this.startDate, endDate: this.endDate} });
  }

  onViewReport(item: GetRemittanceTransactionsListDetails) {
    this.openReportDialog(item);
  }

  openReportDialog(row: GetRemittanceTransactionsListDetails): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.height = '650px';
    dialogConfig.data = {
      Id: row.paymentId,
      ReportTitle: this.selectedReport,
      ReportUrl: this.reports.find(r => r.key === this.selectedReport).value,
      StartDate: this.startDate,
      EndDate: this.endDate
    };
    this.dialog.open(ViewRemittanceReportComponent,
      dialogConfig);
  }
}
