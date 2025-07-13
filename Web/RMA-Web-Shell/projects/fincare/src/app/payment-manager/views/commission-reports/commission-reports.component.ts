import { CommissionDetail } from 'projects/clientcare/src/app/broker-manager/models/commission-detail';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-commission-reports',
  templateUrl: './commission-reports.component.html',
  styleUrls: ['./commission-reports.component.css']
})
export class CommissionReportsComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['policyNumber', 'repCode', 'transactionDate', 'allocatedAmount', 'commissionAmount', 'adminServiceFeeAmount', 'totalAmount'];

  datasource = new MatTableDataSource<CommissionDetail>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  form: UntypedFormGroup;
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

  constructor(public datePipe: DatePipe,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly lookupService: LookupService,
    private readonly toastr: ToastrManager) { }

  ngOnInit() {
    this.hasViewCommissionPermission = userUtility.hasPermission('View Commission');
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.hasViewCommissionPermission)
      this.isAuthorized = true;

    if (this.isAuthorized) {
      this.createForm();
      this.activatedRoute.params.subscribe((params: any) => {
        if (params.accountTypeId) {
          this.accountTypeId = params.accountTypeId;
          this.accountId = params.accountId;
        }
      });
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      startDate: [this.getToday(), [Validators.required]],
      endDate: [this.getToday()]
    });
  }

  navigateBack() {
    this.router.navigate(['/fincare/payment-manager/broker-accounts-view']);
  }

  downloadReport(): void {
    this.startDate = new Date(this.form.get('startDate').value);
    this.endDate = new Date(this.form.get('endDate').value)
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {
        this.parametersAudit = {
          accountTypeId: this.accountTypeId,
          accountId: this.accountId,
          fromDate: this.datePipe.transform(this.startDate, 'yyyy-MM-dd'),
          toDate: this.datePipe.transform(this.endDate, 'yyyy-MM-dd'),
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
        this.isLoading = false;
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
    return today
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
}

