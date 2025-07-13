import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SharedDataService } from 'projects/fincare/src/app/payment-manager/services/shared-data.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommissionClawBackAccountMovement } from 'projects/fincare/src/app/payment-manager/models/commission-clawback-account-movement';
import { CommissionPaymentTypeEnum } from 'projects/fincare/src/app/shared/enum/commission-payment-type.enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-broker-account-clawback-summary',
  templateUrl: './broker-account-clawback-summary.component.html',
  styleUrls: ['./broker-account-clawback-summary.component.css']
})
export class BrokerAccountClawBackSummaryComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['paymentType', 'totalDueAmount', 'currentClawBackBalance', 'newClawBackBalance', 'createdDate', 'createdBy'];
  currentQuery: string;
  datasource = new MatTableDataSource<CommissionClawBackAccountMovement>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  rowCount: number;
  headerTotal = 0;
  hearderName: string;
  accountCode: string;
  accountName: string;
  accountBalance: number;

  showReport = false;
  isDownloading = false;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  errors: string[] = [];
  hasViewCommissionPermission = false;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  isAuthorized = false;
  isReleaseDetails = false;
  releaseDetailsDatasource = new MatTableDataSource<CommissionClawBackAccountMovement>();
  breakdownHeading = '';
  isRejectedDetails = false;
  isDownload: string;
  reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
  selectedreportFormat: string;
  accountTypeId: number;
  accountId: number;
  constructor(
    private readonly commissionService: CommissionService,
    private readonly activatedRoute: ActivatedRoute,
    private location: Location,
    private sharedDataService: SharedDataService,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager) { }

  ngOnInit() {
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission || this.hasReleaseCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.accountTypeId && params.accountId) {
          this.getCommissionClawBackAccountSummary(params.accountTypeId, params.accountId);
          this.accountId = params.accountId;
          this.accountTypeId = params.accountTypeId;
        }
      });
    }
    this.selectedreportFormat = this.reportFormats[0];
    this.isDownload = 'true';
  }

  getCommissionClawBackAccountSummary(accountTypeId: number, accountId: number) {
    this.isLoading = true;
    this.commissionService.getCommissionClawBackAccountSummary(accountTypeId, accountId)
      .subscribe(data => {
        if (data) {
          this.accountName = data.recepientName;
          this.accountCode = data.recepientCode;
          this.accountBalance = data.accountBalance;
          this.datasource.data = data.clawBackAccountMovements;
          this.sharedDataService.data[0] = data.recepientName;
          this.sharedDataService.data[1] = data.recepientCode;
          this.sharedDataService.data[2] = data.accountBalance.toString();
          this.isLoading = false;
        }
      });
  }

  navigateBack() {
    this.location.back();
  }

  getPayTypeText(typeId: number) {
    switch (typeId) {
      case CommissionPaymentTypeEnum.isfPayment: return 'ISF Payment';
      case CommissionPaymentTypeEnum.commissionPayment: return 'Commission Payment';
    }
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }
  public calculateTotalDueAmount() {
    return this.datasource.data.reduce((accum, curr) => accum + curr.totalDueAmount, 0);
  }

  public calculateCurrentClawBackBalance() {
    return this.datasource.data.reduce((accum, curr) => accum + curr.currentClawBackBalance, 0);
  }

  public calculateNewClawBackBalance() {
    return this.datasource.data.reduce((accum, curr) => accum + curr.newClawBackBalance, 0);
  }
  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          accountTypeId: this.accountTypeId,
          accountId: this.accountId
        };

        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMABrokerageAccountCommissionClawback';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 10;
        this.heightAudit = 10;
        this.toolbarAudit = 'false';
        this.showReport = true;
        this.isDownloading = false;
      },
      error => {
        this.toastr.errorToastr(error);
        this.showReport = false;
        this.isDownloading = false;
      }
    );
  }

  reportFormatChange(event: MatRadioChange) {
    this.isDownload = 'true';
    this.selectedreportFormat = event.value;
    if (event.value === 'EXCEL') {
      this.isDownload = 'false';
    }
  }
}
