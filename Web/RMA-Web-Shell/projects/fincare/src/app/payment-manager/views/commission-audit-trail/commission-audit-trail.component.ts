import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommissionService } from 'projects/fincare/src/app/payment-manager//services/commission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { HeaderStatusEnum } from 'projects/fincare/src/app/shared/enum/header-status.enum';
import { CommissionAuditTrailModel } from 'projects/fincare/src/app/payment-manager//models/commission-audit-trail-model';
import { CommissionAccount } from 'projects/fincare/src/app/payment-manager//models/commission-account';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-commission-audit-trail',
  templateUrl: './commission-audit-trail.component.html',
  styleUrls: ['./commission-audit-trail.component.css']
})
export class CommissionAuditTrailComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['recepientName', 'action', 'amount', 'modifiedBy', 'modifiedDate', 'isFitAndProper', 'fitAndProperCheckDate', 'reason'];
  displayedBrokeragesColumns = ['accountName', 'actions'];
  datasource = new MatTableDataSource<CommissionAuditTrailModel>();
  datasourceAccounts = new MatTableDataSource<CommissionAccount>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('filterAccount', { static: false }) filter: ElementRef;
  form: UntypedFormGroup;

  accountCode: string;
  accountName: string;
  accountTypeId: number;
  accountId: number;

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
  startDate: Date;
  endDate: Date;
  formIsValid = true;
  reportDataAvailable: boolean;
  isLoadingPeriods: boolean;
  statementTotal: number;
  currentQuery: string;
  selectedRecepientId = 0;
  selectedRecepientTypeId = 0;
  commissionAccounts: CommissionAccount[] = [];
  hideBrokerages = true;
  brokerageSelected = false;
  headerIds: number[] = [];


  constructor(public datePipe: DatePipe,
              private readonly formBuilder: UntypedFormBuilder,
              private readonly commissionService: CommissionService,
              private router: Router, private readonly alertService: AlertService,
              private readonly lookupService: LookupService,
              private readonly toastr: ToastrManager) { }

  ngOnInit() {
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.createForm();
      this.getActiveCommissionAccounts();
    }
  }
  getActiveCommissionAccounts() {
    this.commissionService.getCommissionAccounts()
      .subscribe(data => {
        this.commissionAccounts = data;
        this.datasourceAccounts.data = data;
      });
  }

  createForm() {
    this.form = this.formBuilder.group({
      startDate: [null, [Validators.required]],
      endDate: [this.getToday()],
      searchedBrokerage: [''],
      filterAccount: ['']
    });
    this.form.get('searchedBrokerage').disable();
  }

  getAuditDetails() {
    if (this.form.valid) {
      this.datasource.data = [];
      this.headerIds = [];
      this.reportDataAvailable = false;
      this.startDate = new Date(this.form.get('startDate').value);
      this.endDate = new Date(this.form.get('endDate').value);
      this.isLoading = true;
      if (this.selectedRecepientId > 0) {
        const ids: number[] = [];
        this.commissionService.getCommissionAuditTrailByAccountId(this.startDate, this.endDate, this.selectedRecepientId, this.selectedRecepientTypeId)
          .subscribe(data => {
            this.datasource.data = data;
            this.isLoading = false;
            if (data.length > 0) {
              this.reportDataAvailable = true;
            }
            data.forEach(c => {
              if (ids.indexOf(c.headerId) < 0) {
                ids.push(c.headerId);
              }
            });
            if (ids.length > 0) {
            this.headerIds = ids;
            }
          });

      } else {
        this.commissionService.getCommissionAuditTrail(this.startDate, this.endDate)
          .subscribe(data => {
            this.datasource.data = data;
            this.isLoading = false;
            if (data.length > 0) {
              this.reportDataAvailable = true;
            }
          });
      }

    }
  }


  navigateBack() {
    this.router.navigate(['/fincare/payment-manager/broker-accounts-view']);
  }

  downloadReport(): void {
    let headerIds = 'default';
    if (this.headerIds.length > 0) {
      headerIds = this.headerIds.toString();
    }
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          startDate: this.getDateFormattedDate(this.startDate),
          endDate: this.getDateFormattedDate(this.endDate),
          headerIds
        };
        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMABrokerageCommissionAuditTrail';
        this.showParametersAudit = 'true';
        this.languageAudit = 'en-us';
        this.widthAudit = 100;
        this.heightAudit = 10;
        this.toolbarAudit = 'true';
        this.delay(6000);
      },
      error => {
        this.toastr.errorToastr(error);
        this.showReport = false;
        this.isDownloading = false;
      }
    );
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then(() => {
      this.showReport = true;
      this.isDownloading = false;
    });
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

  getStatusText(status: number) {
    switch (status) {
      case HeaderStatusEnum.PartiallyPaid: return 'Partially Paid';
      case HeaderStatusEnum.Paid: return 'Paid';
      case HeaderStatusEnum.Pending: return 'Current';
      case HeaderStatusEnum.Withheld: return 'Withheld';
      case HeaderStatusEnum.Submitted: return 'Released';
      case HeaderStatusEnum.Rejected: return 'Rejected';
      case HeaderStatusEnum.PartiallyRejected: return 'Partially Rejected';
    }
  }

  validateDates(): void {
    this.form.get('endDate').setErrors(null);
    this.form.get('startDate').setErrors(null);
    this.formIsValid = true;
    if (!this.form.get('startDate').value) {
      this.form.get('startDate').markAsTouched();
      this.form.get('startDate').setErrors({ required: true });
      this.formIsValid = false;
      return;
    }

    const startDate = new Date(this.form.get('startDate').value);
    const endDate = new Date(this.form.get('endDate').value);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      this.form.get('startDate').setErrors({ min: true });
      this.formIsValid = false;
    }
  }
  getMonthName(value: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(value) - 1];
  }

  searchCommissionAccounts() {
    this.selectedRecepientId = 0;
    this.form.patchValue({searchedBrokerage: ''});
    const query = this.form.get('filterAccount').value;
    if (query.length > 2) {
      const data = this.commissionAccounts.filter(c => c.accountCode.toLowerCase().indexOf(query.toLowerCase()) > -1 || c.accountName.toLowerCase().indexOf(query.toLowerCase()) > -1);
      this.datasourceAccounts.data = data;
      this.hideBrokerages = false;
    } else {
      this.datasourceAccounts.data = this.commissionAccounts;
      this.hideBrokerages = true;
    }
  }

  selectSearchedBrokerages(commissionAccount: CommissionAccount) {
    this.reportDataAvailable = false;
    this.datasource.data = [];
    this.selectedRecepientId = commissionAccount.accountId;
    this.selectedRecepientTypeId = commissionAccount.accountTypeId;
    this.form.patchValue({ searchedBrokerage: commissionAccount.accountName });
    this.hideBrokerages = true;
  }
  getDateFormattedDate(dt: Date): string {
    if (!dt) { return ''; }
    const dtm = new Date(dt);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }
}
