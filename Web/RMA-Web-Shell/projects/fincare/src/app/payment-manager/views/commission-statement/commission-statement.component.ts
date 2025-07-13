import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Location, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from '../../services/shared-data.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommissionService } from '../../services/commission.service';
import { CommissionDetail } from '../../models/commission-detail';
import { CommissionStatementModel } from '../../models/commission-statement-model';
import { map } from 'rxjs/operators';
import { CommissionPeriod } from '../../models/commission-period';
import { ReSendStatementRequest } from '../../models/resend-statement-request';
import { CommissionEmailAuditDialogComponent } from '../commission-email-audit-dialog/commission-email-audit-dialog.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { CommissionEmailBrokerComponent } from '../commission-email-broker/commission-email-broker.component';
@Component({
  selector: 'app-commission-statement',
  templateUrl: './commission-statement.component.html',
  styleUrls: ['./commission-statement.component.css']
})
export class CommissionStatementComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['transactionDate', 'transactionReference', 'transactionType', 'amount'];

  datasource = new MatTableDataSource<CommissionStatementModel>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  form: UntypedFormGroup;

  accountCode: string;
  accountName: string;
  accountTypeId: number;
  accountId: number;

  showReport = false;
  isDownloading = false;

  ssrsBaseUrl: string;
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
  startDate: Date;
  endDate: Date;
  formIsValid = true;
  reportDataAvailable: boolean;
  periodId = 0;
  periods: CommissionPeriod[];
  isLoadingPeriods: boolean;
  statementTotal: number;
  isSending: boolean;
  hideEmailAudit = true;
  hideShareToBroker = true;
  noStatementFound = false;
  isShareToBrokerDisabled = false;

  constructor(public datePipe: DatePipe,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly commissionService: CommissionService,
              private readonly activatedRoute: ActivatedRoute,
              private router: Router,
              private readonly lookupService: LookupService,
              private sharedDataService: SharedDataService,
              private sentEmailsDialog: MatDialog,
              private readonly toastr: ToastrManager,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.createForm();
      this.accountName = this.sharedDataService.data[0];
      this.accountCode = this.sharedDataService.data[1];
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.accountTypeId && params.accountId) {
          this.accountTypeId = params.accountTypeId;
          this.accountId = params.accountId;
          this.getPeriods();
        }
      });

      if (!this.accountName) {
        this.getAccountDetails();
      }
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      period: [null, Validators.required]
    });
  }

  getStatementDetails() {
    if (this.form.valid) {
      this.reportDataAvailable = false;
      this.isLoading = true;
      this.commissionService.getCommissionStatement(this.accountTypeId, this.accountId, this.periodId)
        .subscribe(data => {
          this.datasource.data = data;
          this.isLoading = false;
          if (data.length > 0) {
            this.reportDataAvailable = true;
            this.noStatementFound = false;
          } else {
            this.noStatementFound = true;
          }
        });
    }
  }

  navigateBack() {
    this.router.navigate(['/fincare/payment-manager/broker-accounts-view']);
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.Common/Placeholder';
    this.showParametersAudit = 'false';
    this.parametersAudit = { default: true };
    this.languageAudit = 'en-us';
    this.widthAudit = 50;
    this.heightAudit = 50;
    this.toolbarAudit = 'false';
  }

  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          accountTypeId: this.accountTypeId,
          accountId: this.accountId,
          periodId: this.periodId
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMABrokerageCommissionStatement';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 100;
        this.heightAudit = 10;
        this.toolbarAudit = 'true';
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

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getToday(): Date {
    const dtm = new Date();
    dtm.setHours(0, 0, 0, 0);
    const today = new Date(dtm);
    return today;
  }

  getPeriods() {
    this.isLoadingPeriods = true;
    this.commissionService.getCommissionPeriodsByAccountAndType(this.accountTypeId, this.accountId)
      .pipe(map(data => {
        this.periods = data;
        this.isLoadingPeriods = false;
      }))
      .subscribe();
  }

  onPeriodSelect(event: any) {
    this.periodId = event.value;
    this.hideEmailAudit = false;
    this.hideShareToBroker = false;
  }

  getMonthName(value: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(value) - 1];
  }

  formatNumberAsPositive(amount: number) {
    if (amount < 0) {
      return amount * (-1);
    } else {
      return amount;
    }
  }

  getStatementTotal(): number {
    let statementTotal = 0;
    this.datasource.data.forEach(c => { statementTotal += c.amount; });
    return statementTotal;
  }

  resendStatement() {
    if (this.form.valid) {
      this.reportDataAvailable = false;
      this.isSending = true;
      const statementRequest = new ReSendStatementRequest();
      statementRequest.accountId = this.accountId;
      statementRequest.accountTypeId = this.accountTypeId;
      statementRequest.periodId = this.periodId;
      this.commissionService.reSendStatement(statementRequest)
        .subscribe(c => this.isSending = false);
    }
  }

  showSentEmailsDialog() {
    const dialog = this.sentEmailsDialog.open(CommissionEmailAuditDialogComponent, this.getSentEmailsDialogConfig());
    dialog.afterClosed().subscribe((result: boolean) => {
      if (result) {

      }
    });
  }

  getSentEmailsDialogConfig(): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.height = '650px',
      config.width = '600px';
    config.data = {
      accountId: this.accountId,
      periodId: this.periodId,
      accountTypeId: this.accountTypeId
    };
    return config;
  }

  getAccountDetails() {
    this.commissionService.getCommissionAccountByAccountId(this.accountTypeId, this.accountId)
      .subscribe(data => {
        if (data) {
          this.accountName = data.accountName;
          this.accountCode = data.accountCode;
        }
      });
  }

  openEmailDialog() {
    const dialog = this.sentEmailsDialog.open(CommissionEmailBrokerComponent, this.getEmailsToBrokerDialogConfig());
    dialog.afterClosed().subscribe((result: boolean) => {
      if (result) {

      }
    });
  }

  getEmailsToBrokerDialogConfig(): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.height = '200px',
      config.width = '700px';
    config.data = {
      accountId: this.accountId,
      periodId: this.periodId,
      accountTypeId: this.accountTypeId
    };
    return config;
  }
}

