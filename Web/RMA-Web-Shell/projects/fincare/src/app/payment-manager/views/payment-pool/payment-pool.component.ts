import { Component, OnInit, ViewChild, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BaseSearchComponent } from 'projects/shared-components-lib/src/lib/base-search/base-search.component';
import { PaymentPoolDataSource } from './payment-pool.datasource';
import { BehaviorSubject } from 'rxjs';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { PaymentFilterTypeEnum } from 'projects/fincare/src/app/shared/enum/payment-filter-type-enum';
import { FilterPaymentsRequest } from 'projects/fincare/src/app/payment-manager/models/filter-payments-request';
import { PaymentSubmissionRequest } from 'projects/fincare/src/app/payment-manager/models/payment-submission-request';
import { DatePipe } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { PaymentDialogComponent } from 'projects/fincare/src/app/payment-manager/views/payment-dialog/payment-dialog.component';
import { PaymentAuditComponent } from 'projects/fincare/src/app/payment-manager/views/payment-audit/payment-audit.component';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PaymentDataSource } from 'projects/fincare/src/app/payment-manager/services/payment-list.datasource';
import { MatDialogConfig } from '@angular/material/dialog';
import { PaymentSmsAuditComponent } from 'projects/fincare/src/app/payment-manager/views/payment-sms-audit/payment-sms-audit.component';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { MatRadioChange } from '@angular/material/radio';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PaymentPoolViewTypeEnum } from 'projects/fincare/src/app/shared/enum/payment-pool-view-type-enum';
import { PaymentReversalNotesComponent } from 'projects/shared-components-lib/src/lib/payment-reversal-notes/payment-reversal-notes.component';
import { Payment } from '../../../shared/models/payment.model';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';

@Component({
  selector: 'payment-pool',
  templateUrl: './payment-pool.component.html',
  styleUrls: ['./payment-pool.component.css']
})


export class PaymentPoolComponent extends BaseSearchComponent implements OnInit, OnChanges, OnDestroy {
  @Input() loggedInUserRole: string;
  @Input() hasPermissionSubmitAllPayments: boolean;
  @Input() hasSubmitPaymentPermission: boolean;
  @Input() currentUserEmail: string;
  @Input() paymentPoolView: PaymentPoolViewTypeEnum;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  paymentPoolDataSource: PaymentPoolDataSource;
  paymentDataSource: PaymentDataSource;
  startDate: Date;
  endDate: Date;
  start: any;
  end: any;
  filterPaymentsRequest: FilterPaymentsRequest;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  selectedPaymentType: PaymentTypeEnum;
  selectedPaymentStatus: PaymentStatusEnum;
  selectedClaimType: ClaimTypeEnum;
  selectedProductType: number;
  selectedFilterType: PaymentFilterTypeEnum;
  policyColumnName: string;
  currentQuery: string;
  form: any;
  router: Router;
  selectedPaymentsList: Payment[];
  selectedPayment: Payment;
  selectedBatchReference: string;
  paymentIsSelected: boolean;
  isVisible: boolean;

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
  formatAudit: string;
  isDownload: string;
  errors: string[] = []

  reportFormats: string[] = ['PDF', 'EXCEL', 'CSV'];
  selectedreportFormat: string;
  @Input() selectreportFormat: string;


  menus: { title: string, action: string, disable: boolean }[];

  paymentSubmissionRequest: PaymentSubmissionRequest;
  currentUserObject: User;

  paymentTypes = [
    { key: 'All', value: 0 },
    { key: 'Claim', value: PaymentTypeEnum.Claim },
    { key: 'Pension', value: PaymentTypeEnum.Pension },
    { key: 'Commission', value: PaymentTypeEnum.Commission },
    { key: 'Medical Invoice', value: PaymentTypeEnum.MedicalInvoice },
    { key: 'Tracing Fee', value: PaymentTypeEnum.TracingFee },
    { key: 'Tribunal', value: PaymentTypeEnum.Tribunal },
  ];

  paymentStatuses = [
    { key: 'All', value: 0 },
    { key: 'Pending', value: PaymentStatusEnum.Pending },
    { key: 'Submitted', value: PaymentStatusEnum.Submitted },
    { key: 'Paid', value: PaymentStatusEnum.Paid },
    { key: 'Rejected', value: PaymentStatusEnum.Rejected },
    { key: 'Reconciled', value: PaymentStatusEnum.Reconciled },
    { key: 'Not Reconciled', value: PaymentStatusEnum.NotReconciled },
    { key: 'Queued', value: PaymentStatusEnum.Queued },
  ];

  claimTypes = [
    { key: 'All', value: 0 },
    { key: 'Funeral', value: ClaimTypeEnum.Funeral },
  ];

  PaymentFilterTypes = this.ToArray(PaymentFilterTypeEnum);

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  countries: Lookup[];


  constructor(
    paymentPoolDataSource: PaymentDataSource,
    formBuilder: UntypedFormBuilder,
    router: Router,
    private readonly alertService: AlertService,
    private readonly lookupService: LookupService,
    public datePipe: DatePipe,
    public dialog: MatDialog,
    private readonly toastr: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly paymentService: PaymentService
  ) {
    super(paymentPoolDataSource, formBuilder, router,
      '', // Redirect URL
      []); // Display Columns

    this.paymentPoolDataSource = new PaymentPoolDataSource(this.paymentService);
    this.isDownload = 'true';
    this.createForm();

    this.selectedPaymentType = this.paymentTypes[0].value;
    this.selectedPaymentStatus = PaymentStatusEnum.Pending;
    this.selectedClaimType = null;
    this.selectedProductType = 0;
    this.selectedFilterType = null;
    this.currentQuery = "";
    this.policyColumnName = 'Policy Number';

    this.startDate = new Date();
    this.startDt = new UntypedFormControl(this.startDate);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');


    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');

    this.selectedBatchReference = "";
    this.selectedPaymentsList = [];
    this.paymentIsSelected = false;

  }

  ngOnInit() {

    if (this.loggedInUserRole === "Claims Assessor") {
      this.isVisible = false;
    }
    else
      this.isVisible = true;
    this.getData();

    this.getCountries();
  }

  ngOnChanges(): void {
    if (this.loggedInUserRole === "Claims Assessor") {
      this.isVisible = false;
    }
    else
      this.isVisible = true;

  }

  getData() {
    this.refreshFilter();
    this.paymentPoolDataSource.doGetData(this.filterPaymentsRequest.paymentType, this.filterPaymentsRequest.paymentStatus,
      this.filterPaymentsRequest.startDate, this.filterPaymentsRequest.endDate, this.filterPaymentsRequest.productType,
      this.selectedFilterType, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  getCountries(): void {
    this.lookupService.getCountries().subscribe(results => {
      this.countries = results;
    });
  }

  updateSelectedPaymentsList(row: Payment, checked: boolean): void {

    if (checked)
      this.selectedPaymentsList.push(row);
    else {
      let index = this.selectedPaymentsList.findIndex(x => x.paymentId === row.paymentId);
      this.selectedPaymentsList.splice(index, 1);
    }
  }

  generatePaymentList(isBatchPayment: boolean): Payment[] {
    let paymentList: Payment[] = [];

    if (isBatchPayment) {
      for (var entry of this.paymentPoolDataSource.data.data) {
        if ((entry.batchReference === this.selectedBatchReference) && (entry.paymentStatus === PaymentStatusEnum.Pending))
          paymentList.push(entry);

      }
    }
    else
      paymentList = this.selectedPaymentsList;

    return paymentList;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.getData();
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate() + 1);
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    this.getData();
  }

  paymentTypeChanged($event: any) {

    if ($event.value === 0)
      this.selectedPaymentType = null;
    else
      this.selectedPaymentType = $event.value;

    if (this.selectedPaymentType === PaymentTypeEnum.Claim)
      this.policyColumnName = 'MSP Number';
    else if (this.selectedPaymentType === PaymentTypeEnum.Pension)
      this.policyColumnName = 'Pension Reference Number';
    else
      this.policyColumnName = 'Policy Number';

    this.getData();
  }

  paymentStatusChanged($event: any) {

    if ($event.value === 0)
      this.selectedPaymentStatus = null;
    else
      this.selectedPaymentStatus = $event.value;

    this.getData();
  }

  claimTypeChanged($event: any) {

    if ($event.value === 0)
      this.selectedClaimType = null;
    else
      this.selectedClaimType = $event.value;
    this.getData();
  }

  productTypeChanged($event: any) {

    if ($event.value === 0)
      this.selectedProductType = null;
    else
      this.selectedProductType = $event.value;
    this.getData();
  }

  refreshFilter(): void {
    this.filterPaymentsRequest = new FilterPaymentsRequest();
    this.filterPaymentsRequest.paymentType = this.selectedPaymentType;
    this.filterPaymentsRequest.paymentStatus = this.selectedPaymentStatus;
    this.filterPaymentsRequest.productType = this.selectedProductType;
    this.filterPaymentsRequest.startDate = this.start;
    this.filterPaymentsRequest.endDate = this.end;
  }

  onFilterFocusOut() {
    if (this.form.get('filter').value == '') {
      this.form.get('filter').reset();
    }
  }

  search(): void {

    if (this.form.valid) {
      this.currentQuery = this.readForm();
      if ((this.currentQuery !== null && this.currentQuery.length !== 0)) {
        this.getData();
      }
      else
        this.error("Filter type to search on not selected.");
    }
  }

  onSearchFocusOut(event: any) {
    if (event.target.value.length == 0) {
      this.form.get('query').reset();
    }
  }

  selectedFilterChanged($event: any) {
    if ($event.value === 0)
      this.selectedFilterType = null;
    else
      this.selectedFilterType = $event.value as number;
  }

  getPaymentTypeDescription(pmt: Payment) {

    let desc = this.getPaymentTypeDesc(pmt.paymentType);

    if (desc === 'Commission') {
      if (pmt.policyReference && pmt.policyReference.startsWith('COMPMT')) {
        desc = 'Broker Commission';
      }

      if (pmt.policyReference && pmt.policyReference.startsWith('ISFPMT')) {
        desc = 'Intermediary Service Fee';
      }
    }
    return desc;
  }

  getPaymentTypeDesc(id: number): string {

    return this.format(PaymentTypeEnum[id]);
  }

  getPaymentStatusDesc(id: number): string {

    return this.format(PaymentStatusEnum[id]);
  }


  getBenefitTypeDesc(id: number): string {
    if (id === null)
      return "";
    else
      return this.format(BenefitTypeEnum[id]);
  }

  format(text: string): string {
    if (text && text.length > 0) {
      const status = text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1').trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
    else
      return "";
  }

  public calculateTotalAmount() {
    return this.paymentPoolDataSource.data.data.reduce((accum, curr) => accum + curr.amount, 0);
  }


  getPaymentStatus(paymentStatus: PaymentStatusEnum): string {
    return this.formatLookup(PaymentStatusEnum[+paymentStatus]);
  }

  getCountryName(id: number): string {
    if (this.countries && this.countries.length > 0 && id !== null) {
      let country = this.countries.find(s => s.id === id);
      return country.name;
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, '$1 $2') : 'N/A';
  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Select', def: 'select', show: this.selectedPaymentStatus === PaymentStatusEnum.Pending },
      {
        display: 'Payment Reference', def: 'reference',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Submitted || this.selectedPaymentStatus === PaymentStatusEnum.Reconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Paid || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      {
        display: 'Batch No', def: 'batchReference',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Submitted || this.selectedPaymentStatus === PaymentStatusEnum.Reconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Paid || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      {
        display: 'Bank Statement Reference', def: 'bankStatementReference',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Reconciled || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      {
        display: 'Authorised Date', def: 'createdDate', show: (this.selectedPaymentStatus !== PaymentStatusEnum.Rejected)
      },
      { display: 'Submission Date', def: 'submissionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Submitted) },
      { display: 'Rejection Date', def: 'rejectionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected) },
      { display: 'Payment Date', def: 'paymentConfirmationDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Paid) },
      {
        display: 'Client Notification Date', def: 'clientNotificationDate',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      {
        display: 'Reconciliation Date', def: 'reconciliationDate',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Reconciled || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled)
      },
      {
        display: 'Company', def: 'company',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.selectedPaymentStatus === PaymentStatusEnum.Reconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Paid || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled ||
          this.selectedPaymentStatus === PaymentStatusEnum.Rejected || this.selectedPaymentStatus === PaymentStatusEnum.Queued)
      },
      {
        display: 'Branch', def: 'branch',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.selectedPaymentStatus === PaymentStatusEnum.Submitted ||
          this.selectedPaymentStatus === PaymentStatusEnum.Reconciled || this.selectedPaymentStatus === PaymentStatusEnum.Paid
          || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled || this.selectedPaymentStatus === PaymentStatusEnum.Rejected
          || this.selectedPaymentStatus === PaymentStatusEnum.Queued)
      },
      { display: 'Product', def: 'product', show: true },
      { display: 'Payment Type', def: 'paymentType', show: true },
      {
        display: 'Benefit Type', def: 'benefitType',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.selectedPaymentStatus === PaymentStatusEnum.Submitted
          || this.selectedPaymentStatus === PaymentStatusEnum.Queued || this.selectedPaymentStatus === PaymentStatusEnum.Reconciled
          || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled || this.selectedPaymentStatus === PaymentStatusEnum.Paid)
      },
      { display: 'Payment Status', def: 'paymentStatus', show: true },
      { display: 'Payee Details', def: 'payee', show: true },
      { display: 'Account Details', def: 'accountNo', show: true },
      { display: 'Policy No', def: 'policyReference', show: true },
      { display: 'Claim Number', def: 'claimId', show: true },
      { display: 'Member Name', def: 'memberName', show: true },
      { display: 'Member No', def: 'memberNumber', show: true },
      {
        display: 'Transaction No', def: 'paymentId',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.selectedPaymentStatus === PaymentStatusEnum.Paid
          || this.selectedPaymentStatus === PaymentStatusEnum.Queued)
      },
      { display: 'Amount', def: 'amount', show: true },
      { display: 'Broker Details', def: 'broker', show: true },
      { display: 'Strike Date', def: 'strikeDate', show: this.selectedPaymentType === PaymentTypeEnum.Pension },
      { display: 'Destination', def: 'destinationCountry', show: this.selectedPaymentType === PaymentTypeEnum.Pension },
      { display: 'Scheme', def: 'scheme', show: this.selectedPaymentType === PaymentTypeEnum.Claim },
      { display: 'Error Description', def: 'errorDescription', show: false },
      { display: 'Actions', def: 'actions', show: true }
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
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
      case 'emailaudit':
        this.openEmailAuditDialog(item);
        break;
      case 'smsaudit':
        this.openSmsAuditDialog(item);
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
      case 'submitBatch':
        this.openBatchPaymentSubmissionDialog(item);
        break;
      case 'resubmit':
        this.openPaymentSubmissionDialog(item);
        break;
      case 'reverse':
        this.openPaymentReverseDialog(item);
        break;
      case 'viewPolicyFinancialHistory':
        this.router.navigateByUrl('/fincare/billing-manager/view-transactional');
    }
  }


  filterMenu(item: Payment) {
    this.menus = null;

    switch (item.paymentStatus) {
      case 0:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: this.disablePaymentSubmission(item) },
            { title: 'Reverse Payment', action: 'reverse', disable: this.disablePaymentReverse(item) },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Pending:
        if (this.loggedInUserRole === "Claims Assessor") {
          this.menus =
            [
              { title: 'Payment Audit', action: 'audit', disable: false },
              { title: 'Email Audit', action: 'emailaudit', disable: false },
              { title: 'Sms Audit', action: 'smsaudit', disable: false },
              { title: 'Edit', action: 'edit', disable: false },
              { title: 'Notify', action: 'sendpaymentnotification', disable: true },
              { title: 'Resubmit', action: 'resubmit', disable: true },
              { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
            ]
        }
        else {
          this.menus =
            [
              { title: 'Payment Audit', action: 'audit', disable: false },
              { title: 'Email Audit', action: 'emailaudit', disable: false },
              { title: 'Sms Audit', action: 'smsaudit', disable: false },
              { title: 'Edit', action: 'edit', disable: false },
              { title: 'Notify', action: 'sendpaymentnotification', disable: true },
              { title: 'Submit', action: 'submit', disable: this.disablePaymentSubmission(item) },
              { title: 'Submit Batch', action: 'submitBatch', disable: this.disableBatchPaymentSubmission(item) },
              { title: 'Resubmit', action: 'resubmit', disable: true },
              { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
            ]
        }
        ;
        break;
      case PaymentStatusEnum.Submitted:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Paid:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Rejected:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Reconciled:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Reverse Payment', action: 'reverse', disable: this.disablePaymentReverse(item) },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.NotReconciled:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: false },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Queued:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Recalled:
        this.menus =
          [
            { title: 'Payment Audit', action: 'audit', disable: true },
            { title: 'Email Audit', action: 'emailaudit', disable: true },
            { title: 'Sms Audit', action: 'smsaudit', disable: true },
            { title: 'Edit', action: 'edit', disable: true },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Reverse Payment', action: 'reverse', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: true },
            { title: 'Payment Reversal', action: 'paymentReversal', disable: true },
          ];
        break;
    }
  }

  openPaymentNotificationDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to send a payment notification for this payment (Reference:' + row.claimReference + ') ?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
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

      const paymentDataSource = (this.paymentDataSource as PaymentDataSource);
      paymentDataSource.sendPaymentNotification(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        notificationSent => {
          if (notificationSent) {
            this.done('Request to send payment notification sent!');
          } else {
            this.error('An error occured while trying to submit the payment notification request.');
          }
          this.getData();
        },
        error => this.error(error));
    });
  }

  openPaymentEditDialog(row: Payment): void {
    row.dialogView = 'edit';
    row.dialogQuestion = 'Are you sure you want to edit this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
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

      const paymentDataSource = (this.paymentDataSource as PaymentDataSource);
      paymentDataSource.editPayment(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        edited => {
          if (edited) {
            this.done('Payment edited!');
          } else {
            this.error('An error occured while trying to edit the payment.');
          }
          this.getData();
        },
        error => this.error(error));
    });
  }

  openPaymentSubmissionDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to submit this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '300px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      const paymentDataSource = (this.paymentDataSource as PaymentDataSource);
      paymentDataSource.submitPayment(payment).subscribe(
        // tslint:disable-next-line:no-shadowed-variable
        payment => {
          if (payment.paymentStatus === PaymentStatusEnum.Queued || payment.paymentStatus === PaymentStatusEnum.Submitted) {
            this.done('Payment has been queued for submission !');
          } else {
            this.error('An error occured while trying to submit the payment.');
          }
          this.getData();
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
    this.dialog.open(PaymentAuditComponent,
      dialogConfig);
  }

  openEmailAuditDialog($event: Payment) {
    if ($event) {
      const dialogRef = this.dialog.open(ViewEmailAuditDialogComponent, {
        width: '80%',
        maxHeight: '750px',
        disableClose: true,
        data: {
          itemType: 'Payment',
          itemId: $event.paymentId
        }
      });
    }
  }

  openSmsAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: 'Payment',
      itemId: row.paymentId
    };
    this.dialog.open(PaymentSmsAuditComponent,
      dialogConfig);
  }

  openPaymentReverseDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to reverse this payment (Policy Number : ' + row.policyReference + ') ?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      const noteDialogRef = this.dialog.open(PaymentReversalNotesComponent, {
        width: '1024px',
        data: { payment: payment }
      });

      noteDialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }

        this.paymentService.reversePayment(row).subscribe(() => {
          this.toastr.successToastr('Payment reversal successfully.');
          this.getData();
        });
      });
    });
  }



  openBatchPaymentSubmissionDialog(row: Payment): void {

    if (this.hasPermissionSubmitAllPayments) {

      row.dialogQuestion = 'Are you sure you want to submit this Batch (Batch Reference:' + row.batchReference + ') ?';
      this.selectedBatchReference = row.batchReference;

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '300px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }

        let payments: Payment[] = this.generatePaymentList(true);

        (this.paymentDataSource as PaymentDataSource).submitPayments(payments).subscribe(() => {
          this.done('Payments queued.');
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit batch payments");
    }
  }




  error(statusMassage: string) {
    this.toastr.errorToastr(statusMassage);
  }

  done(statusMassage: string) {
    this.toastr.successToastr(statusMassage);
  }

  paymentStatusIsPending(paymentStatus: number): boolean {
    if (paymentStatus === PaymentStatusEnum.Pending)
      return true;
    else
      return false;

  }

  submitAll(): void {
    if (this.hasPermissionSubmitAllPayments) {
      const row = new Payment();
      row.dialogQuestion = 'Are you sure you want to submit all pending payments?';
      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '300px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }

        this.paymentService.submitAll().subscribe(() => {
          this.done('Payments queued.');
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr('Your are not Authorized to submit all payments');
    }
  }

  submitSelected(): void {

    if (this.hasPermissionSubmitAllPayments) {

      let payments: Payment[] = this.generatePaymentList(false);

      if (payments.length === 0) {
        this.toastr.errorToastr("You did not select any payments to submit");
        return;
      }

      const row = new Payment();
      row.dialogQuestion = 'Are you sure you want to submit the selected payments?';

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '300px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        }

        this.paymentService.submitPayments(payments).subscribe(() => {
          this.done('Payments queued.');
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit multiple payments");
    }

    this.selectedPaymentsList = [];
  }

  disablePaymentSubmission(item: Payment) {
    let disableSubmit = true;
    if (this.hasSubmitPaymentPermission) {
      disableSubmit = item.createdBy === this.currentUserEmail ? true : false;
    }
    return disableSubmit;
  }

  disableBatchPaymentSubmission(item: Payment) {
    let disableSubmit = true;
    if (this.hasPermissionSubmitAllPayments) {
      let b: boolean = item.createdBy == this.currentUserEmail;
      if ((item.createdBy != this.currentUserEmail) && (item.batchReference != null))
        disableSubmit = false;
    }
    return disableSubmit;
  }

  disablePaymentReverse(item: Payment) {
    return item.paymentStatus != PaymentStatusEnum.Reconciled ? true : false;
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
          Product: this.selectedProductType ? this.selectedProductType : 0
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
      }
    );
  }


  reportFormatChange(event: MatRadioChange) {
    this.reportUrlAudit = null;
    this.selectedreportFormat = event.value;
  }


  isClaimsView(): boolean {
    if (this.paymentPoolView === PaymentPoolViewTypeEnum.ClaimsList)
      return true;
    else
      return false;
  }

  isPaymentsView(): boolean {
    if (this.paymentPoolView === PaymentPoolViewTypeEnum.PaymentList)
      return true;
    else
      return false;
  }

  isPensionView(): boolean {
    if (this.paymentPoolView === PaymentPoolViewTypeEnum.PensionsList)
      return true;
    else
      return false;
  }

  ngOnDestroy(): void {
    this.isLoading$.unsubscribe();
    this.loadingMessage$.unsubscribe();
  }
}
