import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { DatePipe } from '@angular/common';
import { Format } from 'projects/shared-utilities-lib/src/lib/pipes/format';
import { DataGridUtil } from 'projects/shared-utilities-lib/src/lib/grid/datagrid.util';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/payment-status-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { FilterPaymentsRequest } from 'projects/fincare/src/app/payment-manager/models/filter-payments-request';
import { PaymentType } from 'projects/fincare/src/app/payment-manager/models/payment-type';
import { PaymentStatus } from 'projects/fincare/src/app/payment-manager/models/payment-status';
import { PaymentDataSource } from 'projects/fincare/src/app/payment-manager/services/payment-list.datasource';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { PaymentDialogComponent } from 'projects/fincare/src/app/payment-manager/views/payment-dialog/payment-dialog.component';
import { PaymentAuditComponent } from 'projects/fincare/src/app/payment-manager/views/payment-audit/payment-audit.component';
import { RefundPaymentAuditComponent } from 'projects/fincare/src/app/billing-manager/views/refund-payment-audit/refund-payment-audit.component';
import { RefundPaymentDialogComponent } from 'projects/fincare/src/app/billing-manager/views/refund-payment-dialog/refund-payment-dialog.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-payment-refund-list',
  templateUrl: './payment-refund-list.component.html',
  styleUrls: ['./payment-refund-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PaymentRefundListComponent extends BaseSearchComponent implements OnInit {
  selectedFilterTypeId: number;
  selectedPaymentType = PaymentTypeEnum.Refund;
  selectedPaymentStatus = PaymentStatusEnum.Pending;
  filterPaymentsRequest: FilterPaymentsRequest;
  selectedProductType: number;

  startDt: UntypedFormControl;
  endDt: UntypedFormControl;

  paymentTypes = [new PaymentType(3, 'Refund')];
  paymentStatuses = [new PaymentStatus(0, 'All'), new PaymentStatus(1, 'Pending'), new PaymentStatus(2, 'Submitted'),
  new PaymentStatus(3, 'Paid'), new PaymentStatus(4, 'Rejected'), new PaymentStatus(5, 'Reconciled'),
  new PaymentStatus(6, 'Not Reconciled'), new PaymentStatus(7, 'Queued')];

  startDate: Date;
  endDate: Date;
  start: any;
  end: any;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  formatAudit: string;
  isDownload: string;
  errors: string[] = [];

  showReport = false;
  //isLoading = false;
  isDownloading = false;

  hasSubmitPaymentPermission = false;
  hasPermissionSubmitAllPayments = false;
  currentUserObject: User;


  reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
  selectedreportFormat: string;
  @Input() selectreportFormat: string;

  menus: { title: string, action: string, disable: boolean }[];

  constructor(
    dataSource: PaymentDataSource,
    formBuilder: UntypedFormBuilder,
    router: Router,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    private readonly dateAdapter: DateAdapter<NativeDateAdapter>,
    private readonly datePipe: DatePipe,
    private readonly authService: AuthService,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager) {

    super(dataSource, formBuilder, router,
      '', // Redirect URL
      []); // Display Columns

    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');
  }

  openPaymentNotificationDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to send a payment notification for this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      if (row.emailAddress === '' || row.emailAddress === null) {
        this.error('No email address specified for the given beneficiary.');
        return;
      }

      const datasource = (this.dataSource as PaymentDataSource);
      datasource.sendPaymentNotification(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        notificationSent => {
          if (notificationSent) {
            this.done('Request to send payment notification sent!');
          } else {
            this.error('An error occured while trying to submit the payment notification request.');
          }

          this.filterPaymentsRequest = new FilterPaymentsRequest();
          this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
          this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
          this.getData(this.filterPaymentsRequest);
        },
        error => this.error(error));
    });
  }

  openPaymentSubmissionDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to submit this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      const datasource = (this.dataSource as PaymentDataSource);
      datasource.submitPayment(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        payment => {
          if (payment.paymentStatus === PaymentStatusEnum.Queued || payment.paymentStatus === PaymentStatusEnum.Submitted) {
            this.done('Payment has been queued for submission!');
          } else {
            this.error('An error occured while trying to submit the payment.');
          }

          this.filterPaymentsRequest = new FilterPaymentsRequest();
          this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
          this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
          this.getData(this.filterPaymentsRequest);
        },
        error => this.error(error));
    });
  }

  openPaymentAuditDialog(row: Payment): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.height = '650px';
    dialogConfig.data = {
      Id: row.paymentId
    };
    this.dialog.open(RefundPaymentAuditComponent,
      dialogConfig);
  }

  openPaymentEditDialog(row: Payment): void {
    row.dialogView = 'edit';
    row.dialogQuestion = 'Are you sure you want to edit this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
      width: '400px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      /* if (!this.isValidEmailFormat(payment.emailAddress)) {
        this.error('Email address provided is invalid.');
        return;
      } */

      const datasource = (this.dataSource as PaymentDataSource);
      datasource.editPayment(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        edited => {
          if (edited) {
            this.done('Payment edited!');
          } else {
            this.error('An error occured while trying to edit the payment.');
          }

          this.filterPaymentsRequest = new FilterPaymentsRequest();
          this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
          this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
          this.getData(this.filterPaymentsRequest);
        },
        error => this.error(error));
    });
  }

  ngOnInit(): void {
    this.createForm();
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.clearData();

    this.getPaymentTypes();
    this.getPaymentStatuses();
    //this.selectedPaymentType = this.paymentTypes[3].id;
    this.selectedPaymentType = 3;
    this.selectedPaymentStatus = this.paymentStatuses[0].id;

    this.dataSource.clearData();

    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
    this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
    this.getData(this.filterPaymentsRequest);

    this.currentUserObject = this.authService.getCurrentUser();
    this.hasSubmitPaymentPermission = userUtility.hasPermission('Submit Payment');
    this.hasPermissionSubmitAllPayments = userUtility.hasPermission('Submit All Payments');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'expand', def: 'expand', show: true },
      { display: 'Payee Details', def: 'payee', show: true },
      { display: 'Company', def: 'company', show: true },
      { display: 'Product', def: 'product', show: true },
      { display: 'Policy No', def: 'policyReference', show: true },
      { display: 'Amount', def: 'amount', show: true },
      { display: 'Account Details', def: 'accountNo', show: true },
      { display: 'Actions', def: 'actions', show: true }
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }


  getData(data: FilterPaymentsRequest): void {
    this.filterPaymentsRequest.startDate = this.start;
    this.filterPaymentsRequest.endDate = this.end;
    (this.dataSource as PaymentDataSource).getData(data);
  }

  search(): void {
    if (this.form.valid) {
      this.selectedPaymentStatus = PaymentStatusEnum.Pending;
      this.currentQuery = this.readForm();
      (this.dataSource as PaymentDataSource).searchData({
        filter: this.selectedFilterTypeId,
        query: this.currentQuery
      });
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl('', [Validators.required]),
      query: new UntypedFormControl('', [Validators.minLength(3), Validators.required])
    });
  }

  onMenuItemClick(item: Payment, menu: any): void {
    switch (menu.action) {
      case 'audit':
        this.openPaymentAuditDialog(item);
        break;
      case 'edit':
        this.openPaymentEditDialog(item);
        break;
      case 'sendpaymentnotification':
        this.openPaymentNotificationDialog(item);
        break;
      case 'submit':
        this.openPaymentSubmissionDialog(item);
        break;
      case 'resubmit':
        this.openPaymentSubmissionDialog(item);
        break;
    }
  }

  filterMenu(item: Payment) {
    this.menus = null;

    switch (item.paymentStatus) {
      case this.paymentStatuses[0].id:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Pending:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: this.disablePaymentSubmission(item) },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Submitted:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Paid:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Rejected:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Reconciled:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.NotReconciled:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
      case PaymentStatusEnum.Queued:
        this.menus =
          [
            { title: 'Audit', action: 'audit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
          ];
        break;
    }
  }

  selectedFilterChanged($event: any) {
    this.selectedFilterTypeId = $event.value as number;
  }

  paymentTypeChanged($event: any) {
    this.selectedPaymentType = $event.value;
    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
    this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
    // this.getData(this.filterPaymentsRequest);
    if (this.selectedPaymentType === PaymentTypeEnum.Commission) {
      this.router.navigate([`/fincare/payment-manager/payment-commision-list`]);
    } else if (this.selectedPaymentType === PaymentTypeEnum.Claim) {
      this.router.navigate([`/fincare/payment-manager/payment-claim-list`]);
    } else if (this.selectedPaymentType === this.paymentTypes[0].id) {
      this.router.navigate([`/fincare/payment-manager/payment-list`]);
    } else if (this.selectedPaymentType === PaymentTypeEnum.Pension) {
      this.router.navigate([`/fincare/payment-manager/payment-pension-list`]);
    } else {
      this.getData(this.filterPaymentsRequest);
    }
  }

  // paymentStatusChanged($event: any) {
  //   this.selectedPaymentStatus = $event.value;
  //   this.filterPaymentsRequest = new FilterPaymentsRequest();
  //   this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
  //   this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
  //   this.getData(this.filterPaymentsRequest);
  // }

  claimTypeChanged($event: any) {
    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
    this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
    this.getData(this.filterPaymentsRequest);
  }

  onFilterChanged() {
    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
    this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
    this.filterPaymentsRequest.productType = this.selectedProductType;
    this.getData(this.filterPaymentsRequest);
  }

  getPaymentTypeDesc(id: number): string {
    let filterPayments = this.paymentTypes.filter(type => type.id === id);
    if (filterPayments && filterPayments.length > 0) {
      return this.paymentTypes.filter(type => type.id === id)[0].name;
    }
  }

  getPaymentStatusDesc(id: number): string {
    let filterPaymentStatus = this.paymentStatuses.filter(status => status.id === id);
    if (filterPaymentStatus && filterPaymentStatus.length > 0) {
      return this.paymentStatuses.filter(status => status.id === id)[0].name;
    }
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.getData(this.filterPaymentsRequest);
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.getData(this.filterPaymentsRequest);
  }

  exportToExcel(): void {
    const columnDefinitions = [
      { display: 'Payment Reference', def: 'reference', show: true },
      { display: 'Batch No', def: 'batchReference', show: true },
      {
        display: 'Authorised Date', def: 'createdDate', show: (this.selectedPaymentStatus === this.paymentStatuses[0].id ||
          this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.selectedPaymentStatus === PaymentStatusEnum.Queued)
      },
      { display: 'Submission Date', def: 'submissionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Submitted) },
      { display: 'Rejection Date', def: 'rejectionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected) },
      { display: 'Payment Date', def: 'paymentConfirmationDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Paid) },
      {
        display: 'Client Notification Date', def: 'clientNotificationDate',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Paid || this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      {
        display: 'Reconciliation Date', def: 'reconciliationDate',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Reconciled || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled)
      },
      { display: 'Company', def: 'company', show: true },
      { display: 'Branch', def: 'branch', show: true },
      { display: 'Product', def: 'product', show: true },
      { display: 'Payment Type', def: 'paymentType', show: true },
      { display: 'Payment Status', def: 'paymentStatus', show: true },
      { display: 'Payee Details', def: 'payee', show: true },
      { display: 'Claim No', def: 'claimReference', show: true },
      { display: 'Policy No', def: 'policyReference', show: true },
      { display: 'Amount', def: 'amount', show: true },
      { display: 'Account Details', def: 'accountNo', show: true },
      { display: 'Error Description', def: 'errorDescription', show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected) }
    ];

    const def: any[] = [];
    const exprtcsv: any[] = [];
    (JSON.parse(JSON.stringify(this.dataSource.data)) as any[]).forEach(x => {
      const obj = new Object();
      const frmt = new Format();
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < columnDefinitions.map(cd => cd.def).length; i++) {
        if (columnDefinitions[i].show) {
          let transfrmVal = frmt.transform(x[columnDefinitions[i].def], '');
          switch (columnDefinitions[i].def) {
            case 'createdDate': {
              transfrmVal = this.datePipe.transform(frmt.transform(x[columnDefinitions[i].def], ''), 'dd MMMM yyyy hh:mm a');
              break;
            }
            case 'submissionDate': {
              transfrmVal = this.datePipe.transform(frmt.transform(x[columnDefinitions[i].def], ''), 'dd MMMM yyyy hh:mm a');
              break;
            }
            case 'paymentConfirmationDate': {
              transfrmVal = this.datePipe.transform(frmt.transform(x[columnDefinitions[i].def], ''), 'dd MMMM yyyy hh:mm a');
              break;
            }
            case 'clientNotificationDate': {
              transfrmVal = this.datePipe.transform(frmt.transform(x[columnDefinitions[i].def], ''), 'dd MMMM yyyy hh:mm a');
              break;
            }
            case 'paymentType': {
              transfrmVal = this.getPaymentTypeDesc(frmt.transform(x[columnDefinitions[i].def], ''));
              break;
            }
            case 'paymentStatus': {
              transfrmVal = this.getPaymentStatusDesc(frmt.transform(x[columnDefinitions[i].def], ''));
              break;
            }
          }
          obj[columnDefinitions[i].display] = transfrmVal;
        }
      }
      exprtcsv.push(obj);
    }
    );

    DataGridUtil.downloadcsv(exprtcsv, def, 'List_Of' + '_RefundPayments_');

    this.done('Payment records exported successfully');
  }
  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading = true;
    this.showReport = false;
    const value = this.form.getRawValue();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (data: any) => {

        this.parametersAudit = {
          DateFrom: this.start,
          DateTo: this.end,
          PaymentTypeId: this.selectedPaymentType,
          PaymentStatusId: this.selectedPaymentStatus,
          Product: this.selectedProductType

        };

        this.reportServerAudit = data;
        this.reportUrlAudit = 'RMA.Reports.FinCare/RMAPaymentList';
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
        // this.isLoading = false;
      }
    );
  }

  done(statusMassage: string) {
    this.toastr.successToastr(statusMassage);
  }

  error(statusMassage: string) {
    this.toastr.errorToastr(statusMassage);
  }

  getPaymentTypes(): void {

    // this.paymentService.getPaymentTypes().subscribe(paymentTypes =>
    // this.paymentTypes = paymentTypes);
  }

  getPaymentStatuses(): void {

    // this.paymentService.getPaymentStatuses().subscribe(paymentStatuses =>
    // this.paymentStatuses = paymentStatuses);
  }

  checkBankResponses(): void {
    const row = new Payment();
    row.dialogQuestion = 'Are you sure you want to process bank responses?';
    const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      (this.dataSource as PaymentDataSource).checkBankResponses().subscribe(() => {
        this.done('Bank responses processed.');
        this.filterPaymentsRequest = new FilterPaymentsRequest();
        this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
        this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
        this.getData(this.filterPaymentsRequest);
      });
    });
  }

  checkBankStatements(): void {
    const row = new Payment();
    row.dialogQuestion = 'Are you sure you want to process bank statements?';
    const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      (this.dataSource as PaymentDataSource).checkBankStatements().subscribe(() => {
        this.done('Bank statements processed.');
        this.filterPaymentsRequest = new FilterPaymentsRequest();
        this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
        this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
        this.getData(this.filterPaymentsRequest);
      });
    });
  }

  submitAll(): void {
    if (this.hasPermissionSubmitAllPayments) {
      const row = new Payment();
      row.dialogQuestion = 'Are you sure you want to submit all pending payments?';
      const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
        width: '300px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }

        (this.dataSource as PaymentDataSource).submitAll().subscribe(() => {
          this.done('Payments queued.');
          this.filterPaymentsRequest = new FilterPaymentsRequest();
          this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
          this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
          this.getData(this.filterPaymentsRequest);
        });
      });
    } else {
      this.toastr.errorToastr('Your are not Authorized to submit all payments');
    }
  }

  isValidEmailFormat(email: string): boolean {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

    if (email !== '' && (email.length > 5 && EMAIL_REGEXP.test(email))) {
      return true;
    }

    return false;
  }

  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.isDownload = "true";
    this.selectedreportFormat = event.value;
    if (event.value === 'EXCEL' || event.value === 'CSV') {
      this.isDownload = "false";
    }
  }

  selectedProductChanged(productTypeId: number) {
    this.selectedProductType = productTypeId;
    this.onFilterChanged();
  }
  public calculateTotalAmount() {
    return this.dataSource.data.reduce((accum, curr) => accum + curr.amount, 0);
  }

  disablePaymentSubmission(item: Payment) {
    let disableSubmit = true;
    if (this.hasSubmitPaymentPermission) {
      disableSubmit = item.createdBy === this.currentUserObject.email ? true : false;
    }
    return disableSubmit;
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }
}
