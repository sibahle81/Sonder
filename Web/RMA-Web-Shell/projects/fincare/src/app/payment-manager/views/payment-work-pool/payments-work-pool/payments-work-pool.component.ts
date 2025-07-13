
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PaymentStatusEnum } from 'projects/fincare/src/app/shared/enum/payment-status-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { BehaviorSubject } from 'rxjs';
import { PaymentService } from '../../../services/payment.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SharedFloatMessage } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-float-message';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { PaymentsWorkPoolDataSource } from './payments-work-pool.datasource';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';
import { PaymentWorkPoolInfoComponent } from './payment-work-pool-info/payment-work-pool-info.component';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { SharedErrorTypeEnum } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-error-type-enum';
import { PaymentAuditComponent } from '../../payment-audit/payment-audit.component';
import { PaymentSmsAuditComponent } from '../../payment-sms-audit/payment-sms-audit.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { PaymentDialogComponent } from '../../payment-dialog/payment-dialog.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { DatePipe } from '@angular/common';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { debounceTime } from 'rxjs/operators';
import { PaymentPoolSearchParams } from '../../../models/payment-pool-search-params';
import { Constants } from '../../../models/constants';
import { ManualPaymentDialogComponent } from '../../manual-payment-dialogue/manual-payment-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { PaymentReversalNotesComponent } from 'projects/shared-components-lib/src/lib/payment-reversal-notes/payment-reversal-notes.component';
import { MatRadioChange } from '@angular/material/radio';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'payments-work-pool',
  templateUrl: './payments-work-pool.component.html',
  styleUrls: ['./payments-work-pool.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'isExpanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class PaymentsWorkPoolComponent extends UnSubscribe implements OnChanges {

  @Input() userLoggedIn: User;
  @Input() selectedWorkPool: WorkPoolEnum;
  @Input() currentQuery = '';
  @Input() actions: any[] = [];
  @Input() workPoolUsers: User[];

  canAllocate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  disable_coid_vaps_e2e_fincare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_FinCare');
  submit_all_pending_payments_133770 = FeatureflagUtility.isFeatureFlagEnabled('submit_all_pending_payments_133770');

  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PaymentsWorkPoolDataSource;
  menus: { title: string; action: string; disable: boolean }[];
  heading = String.Empty;
  typeOfDiseases: any[];
  poolParams = new PaymentPoolSearchParams();
  selectedPaymentsToAllocateApi: Payment[] = [];
  selectedPaymentsToAllocate: Payment[] = [];
  selectedPaymentsToSubmit: Payment[] = [];
  selectedPaymentsToAllocateOnly: Payment[] = [];
  selectedPaymentsToReallocate: Payment[] = [];
  cadPool = +WorkPoolEnum.CadPool;
  slaItemType = SLAItemTypeEnum.PaymentPool;
  canReAllocate = false;
  canAllocate = false;
  isCcaPool: boolean = false;
  floatMessage: SharedFloatMessage;
  users: User[] = [];
  selectedPaymentStatus = PaymentStatusEnum.Pending;
  selectedTaxPayments: Payment[] = [];
  pending = PaymentStatusEnum.Pending;
  submitted = PaymentStatusEnum.Submitted;
  paid = PaymentStatusEnum.Paid;
  rejected = PaymentStatusEnum.Rejected;
  reconciled = PaymentStatusEnum.Reconciled;
  notReconciled = PaymentStatusEnum.NotReconciled;
  queued = PaymentStatusEnum.Queued;
  claimPayment = +PaymentTypeEnum.Claim;
  pensionPayment = +PaymentTypeEnum.Pension;
  coidClaimsPayment = +ClaimTypeEnum.IODCOID;
  funeralClaimsPayment = +ClaimTypeEnum.Funeral;
  selectedBatchReference = '';
  hasSubmitPaymentPermission: boolean;
  hasPermissionSubmitAllPayments: boolean;
  paymentTypes: Lookup[];
  paymentStatuses: Lookup[];
  form: UntypedFormGroup;
  defaultDropdownValue = 0;
  selection = new SelectionModel<Payment>(true, []);
  payeeDetail = 'Payee Details';
  pensionPaymentTypes: Lookup[];
  claimsPaymentTypes: Lookup[];
  isShowClaimTypes = false;
  claimTransactions: any[];
  showSubmitAllButton: boolean = false;
  claimTypes = [
    { key: 'All', value: 0 },
    { key: 'Funeral', value: ClaimTypeEnum.Funeral },
    { key: 'COID', value: ClaimTypeEnum.IODCOID },
    { key: 'NON-COID', value: ClaimTypeEnum.Other },
  ];

  coidPaymentTypes = [
    { key: 'All', value: 0 },
    { key: 'Single/Individual', value: 1 },
    { key: 'Scheduled', value: 2 },
    { key: 'Medical', value: 3 },
    { key: 'VAT', value: 4 },
    { key: 'SSP', value: 5 },
  ];

  pensionTransactionTypes = [
    { key: 'All', value: 0 },
    { key: 'Capital Value', value: 1 },
    { key: 'EFT', value: 2 },
    { key: 'Tax', value: 3 },
    { key: 'Month End', value: 4 },
  ];

  countries: Lookup[];

  @Input() hideVisibility = false;

  showReport = false;
  isDownloading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  ssrsBaseUrl: string;
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
  isSelectAllSelected = false;
  selectedProductType = 0;

  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(
    private readonly paymentService: PaymentService,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private readonly lookupService: LookupService,

  ) {
    super();
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getPaymentStatuses();
    this.getPaymentTypes();
    this.getClaimInvoiceTypes();
    this.setUser();
    this.claimTransactions = this.claimTypes;
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new PaymentsWorkPoolDataSource(this.paymentService, this.lookupService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.getData();
    this.checkIfDataIsLoaded();
    this.hasSubmitPaymentPermission = userUtility.hasPermission('Submit Payment');
    this.hasPermissionSubmitAllPayments = userUtility.hasPermission('Submit All Payments');
    this.isDownload = 'true';
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
      (value: any) => {
        this.ssrsBaseUrl = value;
      },
      (error) => {
        this.toastr.errorToastr(error.message);
      }
    );
  }

  disableCoidVaps() {
    if (this.disable_coid_vaps_e2e_fincare) {
      if (this.claimTypes.length > 0) {
        this.claimTypes = this.claimTypes.filter(s => s.value === ClaimTypeEnum.Funeral);
      }
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      paymentStatus: new UntypedFormControl(''),
      paymentType: new UntypedFormControl(''),
      pensionPaymentType: new UntypedFormControl(''),
      claimTypes: new UntypedFormControl(''),
      selectedreportFormat: new UntypedFormControl(''),
      coidPaymentType: new UntypedFormControl(''),
    });

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    this.form.patchValue({
      endDate: endDate,
      startDate: startDate,
      paymentStatus: this.defaultDropdownValue,
      paymentType: this.defaultDropdownValue,
      claimTypes: this.defaultDropdownValue,
      pensionPaymentType: this.defaultDropdownValue,
    })
  }

   getInitialData() {
    this.setParams();
    this.poolParams.startDate = this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString);
    this.poolParams.endDate = this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString);
    this.poolParams.paymentTypeId = this.form.get('paymentType').value;
    this.poolParams.claimTypeId = this.form.get('claimTypes').value;
    this.poolParams.paymentStatusId = this.form.get('paymentStatus').value;
    this.poolParams.query = this.currentQuery ? this.currentQuery : this.form.get('searchTerm').value;
    this.poolParams.reAllocate = this.hasReAllocatePermission();
    this.poolParams.userLoggedIn = this.userLoggedIn.id;
    this.poolParams.workPoolId = this.selectedWorkPool ? this.selectedWorkPool : WorkPoolEnum.PaymentPool;
    if (this.form.get('claimTypes').value === this.coidClaimsPayment) {
      this.poolParams.coidPaymentTypeId = this.form.get('coidPaymentType').value;
    }
    if (this.form.get('paymentType').value === this.pensionPayment) {
      this.poolParams.pensionPaymentTypeId = this.form.get('pensionPaymentType').value;
    }
    this.dataSource.setData(this.poolParams)
    if (this.poolParams.paymentStatusId === PaymentStatusEnum.Pending) {
      this.showSubmitAllButton = this.dataSource.data.rowCount > 0;
    } else {
      this.showSubmitAllButton = false;
    }
    this.disableCoidVaps();
  }


  configureSearch() {
    this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
      this.search(response as string);
    });
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;

    if (this.currentQuery.length >= 3) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      this.currentQuery = this.currentQuery.trim();
      this.paginator.pageIndex = 0;
      this.getData();
    } 
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.poolParams.pageSize;
    return numSelected === numRows;
  }

  clearRecords() {
    this.selection.clear();
    this.selectedPaymentsToAllocate = [];
    this.selectedPaymentsToSubmit = [];
  }

  masterToggle() {
    this.isAllSelected() ?
      this.clearRecords() :
      this.dataSource.data.data.forEach(row =>
        this.selection.select(row)
      );

    this.selection.selected.forEach(item => {
      this.selectedPaymentsToAllocate.push(item);
    });

    this.canReAllocate = this.selectedPaymentsToAllocate.some(a => !String.isNullOrEmpty(a.userName));
    this.canAllocate = this.selectedPaymentsToAllocate.some(a => String.isNullOrEmpty(a.userName));

    this.sendForAllocation(false);
  }

  getData() {
    this.dataSource.canReAllocate = this.hasReAllocatePermission();
    this.dataSource.loggedInUserId = this.userLoggedIn.id;
    this.setPoolName();
    this.setParams();
    this.getInitialData();
  }

  ClearData() {
  }

  applyData() {
    if (this.form.get('paymentType').value == PaymentTypeEnum.MedicalInvoice) {
      this.payeeDetail = 'MSP Detail';
    } else {
      this.payeeDetail = 'Payee Details';
    }
    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < startDate) {
      this.form.get('endDate').setErrors({ 'min-date': true });
    } else {
      this.form.get('endDate').setErrors(null);
      this.paginator.firstPage();
      this.getData();
    }
  }

  showDetail() {
    this.hideVisibility = !this.hideVisibility;
  }

  setUser() {
    if (this.users.length === 0) {
      this.users.push(this.userLoggedIn);
    }
  }

  getPaymentStatuses(): void {
    this.lookupService.getPaymentStatuses().subscribe(
      data => {
        data.forEach(element => {
          element.name = element.name.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim()
        });
        this.paymentStatuses = data;
      });

  }

  getClaimInvoiceTypes(): void {
    this.lookupService.getClaimInvoiceTypes().subscribe(
      data => {
        this.claimsPaymentTypes = data;
      });
  }

  productTypeChanged($event: any) {
    if ($event.value === 0)
      this.selectedProductType = 0;
    else
      this.selectedProductType = $event.value;
  }

  getPaymentTypes(): void {
    this.lookupService.getPaymentTypes().subscribe(
      data => {
        const selectedPool = this.selectedWorkPool as WorkPoolEnum;
        if (selectedPool === WorkPoolEnum.PremiumCashBack) {
          this.paymentTypes = data.filter(s => s.id === PaymentTypeEnum.PremiumPayback);
        } else {
          const allTypes = new Lookup();
          allTypes.id = 0;
          allTypes.name = 'All';
          // Premium paybacks should not be visible in regular payment pool
          this.paymentTypes = data.filter(s => s.id !== PaymentTypeEnum.PremiumPayback);
          this.paymentTypes = data.filter(s => s.id !== PaymentTypeEnum.MedicalInvoice);
          this.paymentTypes.unshift(allTypes);
        }
        this.form.patchValue({ paymentType: this.paymentTypes[0].id });
        this.getPensionSubTypes(this.paymentTypes);

        if (selectedPool !== WorkPoolEnum.PremiumCashBack) {
          if (this.paymentTypes.length > 0 && this.disable_coid_vaps_e2e_fincare) {
            this.paymentTypes = this.paymentTypes.filter(
              s => s.id === PaymentTypeEnum.Claim
                || s.id === PaymentTypeEnum.Refund
                || s.id === PaymentTypeEnum.InterBankTransfer
                || s.id === PaymentTypeEnum.PRMA
            );
            this.form.patchValue({ paymentType: 0 });
          }
        }
      });
  }

  getPensionSubTypes(data: Lookup[]) {
    if (data.length > 0) {
      this.pensionPaymentTypes = new Array();
      data.forEach(type => {
        if (type.id > +PaymentTypeEnum.Tribunal && type.id < +PaymentTypeEnum.Tax) {
          this.pensionPaymentTypes.push(type);
        }
      });
    }

    this.pensionPaymentTypes.forEach(item => {
      this.paymentTypes.splice(this.paymentTypes.indexOf(item), 1);
    })
  }

  checkIfDataIsLoaded() {
    this.dataSource.isLoaded$.subscribe(result => {
      if (result) {
        this.refreshLoading.emit(false);
      }
    })
  }

  setPoolName() {
    if (this.selectedWorkPool > 0) {
      this.heading = this.formatText(WorkPoolEnum[this.selectedWorkPool]);
      this.dataSource.poolName = this.heading;
    }
  }

  sendSLAEmailNotification($event: any) {
  }

  setParams() {
    this.poolParams.page = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.poolParams.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.poolParams.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'PaymentId';
    this.poolParams.isAscending = this.sort.direction == 'asc' ? true : false;
    this.poolParams.query = this.currentQuery ? this.currentQuery : '';
  }

  hasAllocationPermission(): boolean {
    return this.userHasPermission('Work Pool Allocate User')
      || this.userHasPermission('Work Pool Re-Allocate User')
      || this.userHasPermission('Work Pool Manage User')
  }

  hasSearchPermission(): boolean {
    return this.userHasPermission('search work pool')
  }

  hasReAllocatePermission(): boolean {
    return this.userHasPermission('Work Pool Re-Allocate User');
  }

  paymentStatusChange($event: any) {
    this.selectedPaymentStatus = $event.value;
  }

  paymentTypeChange($event: any) {
    let paymentTypeId = $event.value;
    if (paymentTypeId == PaymentTypeEnum.Claim || paymentTypeId == PaymentTypeEnum.Pension) {
      this.isShowClaimTypes = true;
    } else {
      this.isShowClaimTypes = false;
    }

    if (paymentTypeId == PaymentTypeEnum.Pension) {
      this.claimTypes = this.claimTypes.filter(s => s.value !== ClaimTypeEnum.Funeral);
    } else {
      this.claimTypes = this.claimTransactions;
    }

    this.disableCoidVaps();

  }

  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Select', def: 'select', show: this.selectedPaymentStatus === PaymentStatusEnum.Pending || this.hasAllocationPermission() },
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
      { display: 'Sender Account Number', def: 'senderAccountNo', show: true },
      {
        display: 'Authorised Date', def: 'createdDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Pending
          || this.selectedPaymentStatus === PaymentStatusEnum.Queued || this.selectedPaymentStatus === PaymentStatusEnum.Paid)
      },
      { display: 'Submission Date', def: 'submissionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Submitted) },
      { display: 'Rejection Date', def: 'rejectionDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected) },
      { display: 'Payment Date', def: 'paymentConfirmationDate', show: (this.selectedPaymentStatus === PaymentStatusEnum.Paid) },
      {
        display: 'Client Notification Date', def: 'clientNotificationDate',

        show: (this.selectedPaymentStatus === PaymentStatusEnum.Rejected)
      },
      { display: 'Policy No', def: 'policyReference', show: true },
      { display: 'Pension Ref', def: 'pensionRef', show: (this.form.get('paymentType').value === PaymentTypeEnum.Pension) },
      { display: 'Benefit Code', def: 'benefitCode', show: (this.form.get('paymentType').value === PaymentTypeEnum.Pension) },
      { display: 'Claim No', def: 'claimId', show: (this.form.get('paymentType').value !== PaymentTypeEnum.Commission) },
      {
        display: 'Reconciliation Date', def: 'reconciliationDate',
        show: (this.selectedPaymentStatus === PaymentStatusEnum.Reconciled || this.selectedPaymentStatus === PaymentStatusEnum.NotReconciled)
      },
      { display: 'Product', def: 'product', show: true },
      { display: 'Payment Type', def: 'paymentType', show: true },
      { display: 'Payment Status', def: 'paymentStatus', show: true },
      { display: 'Reversed', def: 'isReversed', show: true },
      { display: 'Assigned To', def: 'assignedTo', show: this.hasReAllocatePermission() },
      { display: 'Payee Details', def: 'payee', show: true },
      { display: 'Account Details', def: 'accountNo', show: true },
      { display: 'SLA', def: 'sla', show: true },
      { display: 'Amount', def: 'amount', show: true },
      { display: 'Error Description', def: 'errorDescription', show: false },
      { display: 'Actions', def: 'actions', show: true }
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu(item: Payment) {
    this.menus = null;

    switch (item.paymentStatus) {
      case PaymentStatusEnum.Pending:
        if (this.userLoggedIn.roleName === "Claims Assessor") {
          this.menus =
            [
              { title: 'More Info', action: 'moreinfo', disable: false },
              { title: 'Payment Audit', action: 'audit', disable: false },
              { title: 'Email Audit', action: 'emailaudit', disable: false },
              { title: 'Sms Audit', action: 'smsaudit', disable: false },
              { title: 'Edit', action: 'edit', disable: false },
              { title: 'Notify', action: 'sendpaymentnotification', disable: true },
              { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
            ]
        }
        else {
          this.menus =
            [
              { title: 'More Info', action: 'moreinfo', disable: false },
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
            { title: 'More Info', action: 'moreinfo', disable: false },
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
      case PaymentStatusEnum.Rejected:
        this.menus =
          [
            { title: 'More Info', action: 'moreinfo', disable: false },
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: false },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: false },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: false },
          ];
        break;
      case PaymentStatusEnum.Paid:
      case PaymentStatusEnum.Reconciled:
      case PaymentStatusEnum.NotReconciled:
      case PaymentStatusEnum.Queued:
        this.menus =
          [
            { title: 'More Info', action: 'moreinfo', disable: false },
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
      case PaymentStatusEnum.Recalled:
      case PaymentStatusEnum.Reversed:
        this.menus =
          [
            { title: 'More Info', action: 'moreinfo', disable: false },
            { title: 'Payment Audit', action: 'audit', disable: false },
            { title: 'Email Audit', action: 'emailaudit', disable: false },
            { title: 'Sms Audit', action: 'smsaudit', disable: false },
            { title: 'Edit', action: 'edit', disable: true },
            { title: 'Notify', action: 'sendpaymentnotification', disable: true },
            { title: 'Submit', action: 'submit', disable: true },
            { title: 'Resubmit', action: 'resubmit', disable: true },
            { title: 'Reverse Payment', action: 'reverse', disable: true },
            { title: 'Policy Financial History', action: 'viewPolicyFinancialHistory', disable: true },
          ];
        break;
    }
  }

  disablePaymentSubmission(item: Payment) {
    let disableSubmit = true;
    if (this.hasSubmitPaymentPermission) {
      disableSubmit = item.createdBy === this.userLoggedIn.email;
    }
    if ((item.paymentStatus === PaymentStatusEnum.Rejected || item.paymentStatus === PaymentStatusEnum.Pending) && !disableSubmit) {
      disableSubmit = false;
    }
    return disableSubmit;
  }

  disableBatchPaymentSubmission(item: Payment) {
    let disableSubmit = true;
    if (this.hasPermissionSubmitAllPayments) {
      if ((item.createdBy != this.userLoggedIn.email) && (item.batchReference != null))
        disableSubmit = false;
    }
    return disableSubmit;
  }

  disablePaymentReverse(item: Payment) {
    return item.paymentStatus != PaymentStatusEnum.Reconciled;
  }

  getPaymentType(id: number) {
    if (!id) { return };
    return this.formatText(PaymentTypeEnum[id]);
  }

  getPaymentStatus(id: number, isReversed: boolean) {
    if (!id) { return };
    if (!isReversed) {
      return this.formatText(PaymentStatusEnum[id]);
    } else {
      return this.formatText(PaymentStatusEnum[9]);
    }
  }

  getBenefitType(id: number): string {
    return this.formatText(BenefitTypeEnum[id]);
  }

  getCountryName(id: number): string {
    if (this.countries && this.countries.length > 0 && id !== null) {
      let country = this.countries.find(s => s.id === id);
      return country.name;
    }
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  paymentTypeChanged(filterValue) {
    this.currentQuery = filterValue.value;
    this.getData();
  }

  paymentStatusChanged(filterValue) {
    this.currentQuery = filterValue.value;
    this.getData();
  }

  onMenuSelect(item: Payment, menu: any) {
    switch (menu.action) {
      case 'moreinfo':
        this.openPaymentWorkPoolInfoPopup(item);
        break;
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
      case 'viewPolicyFinancialHistory':
        this.router.navigateByUrl('/fincare/billing-manager/view-transactional');
        break;
    }
  }

  AddCheckedItems(item: Payment, sendAllocation: boolean) {
    let index = this.selectedPaymentsToAllocate.findIndex(a => a.paymentId === item.paymentId);
    if (index > -1) {
      this.selectedPaymentsToAllocate.splice(index, 1);
    } else {
      this.selectedPaymentsToAllocate.push(item);
    }
    this.canReAllocate = this.selectedPaymentsToAllocate.some(a => !String.isNullOrEmpty(a.userName));
    this.canAllocate = this.selectedPaymentsToAllocate.some(a => String.isNullOrEmpty(a.userName));

    this.selectedPaymentsToSubmit = this.selectedPaymentsToAllocate.filter(x => x.paymentStatus == PaymentStatusEnum.Pending);

    this.isSelectAllSelected = (this.isSelectAllSelected && (this.selectedPaymentsToAllocate.length > 0 || this.selectedPaymentsToReallocate.length > 0));

    this.sendForAllocation(sendAllocation);
  };

  disableReAllocate($event: Payment): boolean {
    return $event.userName && this.canAllocate;
  }

  disableAllocate($event: Payment): boolean {
    return !$event.userName && this.canReAllocate;
  }

  sendForAllocation(sendAllocation: boolean, onlyAllocate = false) {
    if (sendAllocation) {
      let item;
      if (onlyAllocate) {
        item = (this.isSelectAllSelected) ? [...this.selectedPaymentsToAllocateOnly] : [...this.selectedPaymentsToAllocate];
      } else {
        item = (this.isSelectAllSelected) ? [...this.selectedPaymentsToReallocate] : [...this.selectedPaymentsToAllocate];
      }
      this.selectedPaymentsToAllocateApi = item;
      this.canAllocate$.next(true);

      if (item.length == 1) {
        const index = this.workPoolUsers.findIndex(a => a.id == item[0].assignedTo);
        if (index > -1) {
          this.workPoolUsers.splice(index, 1)
        }
      }
    }
  }

  refresh() {
    this.selectedPaymentsToAllocate = [];
    this.selectedPaymentsToReallocate = [];
    this.selectedPaymentsToSubmit = [];
    this.canAllocate = false;
    this.canReAllocate = false;
    this.isSelectAllSelected = false;
    this.canAllocate$.next(false);
    this.getData();
  }

  setMessage(message: string, errorType: SharedErrorTypeEnum) {
    this.floatMessage = new SharedFloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  openDialog(row: any, component: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: 'Payment',
      itemId: row.paymentId
    };
    this.dialog.open(component,
      dialogConfig);
  }

  openManageUsersPopup(): void {
    //TO-DO
  }

  openSceduleUsersPopup() {
    //TO-DO
  }

  openPaymentWorkPoolInfoPopup(item: Payment) {
    const def: any[] = [];
    const dialogRef = this.dialog.open(PaymentWorkPoolInfoComponent, {
      width: '800px',
      maxHeight: '600px',
      data: {
        payment: item,
      }
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
        data: { payment: row }
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

  openPaymentEditDialog(row: Payment): void {
    row.dialogView = 'edit';
    row.dialogQuestion = 'Are you sure you want to edit this payment (Reference:' + row.reference + ') ?';
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { payment: row }
    });

    dialogRef.afterClosed().subscribe(payment => {
      if (payment == null) {
        return;
      }

      this.paymentService.updateEmailAddress(payment.payment.paymentId, payment.payment.emailAddress).subscribe(
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

  done(statusMassage: string) {
    this.toastr.successToastr(statusMassage);
  }

  error(statusMassage: string) {
    this.toastr.errorToastr(statusMassage);
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

      this.paymentService.submitPayment(payment.payment.paymentId).subscribe(
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

  openPaymentNotificationDialog(row: Payment): void {
    row.dialogQuestion = 'Are you sure you want to send a payment notification for this payment (Reference:' + row.reference + ') ?';
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

      if (!this.isValidEmail(row.emailAddress)) {
        this.error('Email address specified for the given beneficiary is not valid.');
        return;
      }

      this.paymentService.sendPaymentNotification(payment.payment.paymentId).subscribe(
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

        this.paymentService.submitPayments(payments).subscribe(() => {
          this.done('Payments queued.');
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit batch payments");
    }
  }

  generatePaymentList(isBatchPayment: boolean): Payment[] {
    let paymentList: Payment[] = [];

    if (isBatchPayment) {
      for (let entry of this.dataSource.data.data) {
        if ((entry.batchReference === this.selectedBatchReference) && (entry.paymentStatus === PaymentStatusEnum.Pending)
          && entry.disableSelection === false) {
          paymentList.push(entry);
        }

      }
    }
    else
      paymentList = this.selectedPaymentsToSubmit;

    return paymentList;
  }

  startPaymentReversalWizard(item: Payment) {
    const request = new StartWizardRequest();

    request.type = 'payment-reversal-wizard';
    request.linkedItemId = item.id;
    request.data = JSON.stringify(item);

    this.wizardService.startWizard(request).subscribe(result => {
      this.alertService.success('Payment Reversal Wizard Started');
    });
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
        } else {
          this.isSubmitting$.next(true);
        }

        this.paymentService.submitAll().subscribe(() => {
          this.done('Payments queued.');
          this.isSubmitting$.next(false);
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr('Your are not Authorized to submit all payments');
    }
  }

  getClaimInvoiceTypeById(id: number) {
    return this.format(ClaimInvoiceTypeEnum[id]);
  }

  format(text: string) {
    if (text && text.length > 0) {
      const status = text
        .replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, '$1')
        .trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(' ');
    }
  }

  submitSelected(): void {

    if (this.hasPermissionSubmitAllPayments) {
      let payments: Payment[] = this.generatePaymentList(false).filter(x => x.paymentType !== PaymentTypeEnum.Tax);

      if (payments.length === 0) {
        this.toastr.errorToastr("You did not select any payments to submit");
        return;
      }
      const numberOfPayments = payments.length;
      const question = (numberOfPayments > 1) ? `all ${numberOfPayments} selected payments` : `${numberOfPayments} selected payment`
      const row = new Payment();
      row.dialogQuestion = `Are you sure you want to submit ${question}?`;

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '450px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        } else {
          this.isSubmitting$.next(true);
        }

        this.paymentService.submitPayments(payments).subscribe(() => {
          this.done(`${question} queued.`);
          this.isSubmitting$.next(false);
          this.selectedPaymentsToSubmit = [];
          payments = [];
          this.selectedPaymentsToAllocate = [];
          this.selectedPaymentsToAllocateOnly = [];
          this.selectedPaymentsToReallocate = [];
          this.isSelectAllSelected = false;
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit multiple payments");
    }
  }

  submitSelectedTaxPayments(): void {

    if (this.hasPermissionSubmitAllPayments) {
      this.selectedTaxPayments = this.generatePaymentList(false).filter(x => x.paymentType === PaymentTypeEnum.Tax);

      if (this.selectedTaxPayments.length === 0) {
        this.toastr.errorToastr("You did not select any tax payments to submit");
        return;
      }

      const row = new Payment();
      row.dialogQuestion = 'Are you sure you want to process the selected tax payments?';

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '300px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        } else {
          this.isSubmitting$.next(true);
        }

        this.paymentService.processTaxPayments(this.selectedTaxPayments).subscribe(() => {
          this.done('Payments queued.');
          this.isSubmitting$.next(false);
          this.selectedTaxPayments = [];
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit multiple payments");
    }
  }

  openManualPaymentDialogue(): void {
    let enterAnimationDuration: string = "2000ms";
    let exitAnimationDuration: string = "2000ms";

    const dialogRef = this.dialog.open(ManualPaymentDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '600px',
      width: '900px',
      panelClass: 'full-screen-modal',
      data: { userName: this.userLoggedIn.username },
    })

    dialogRef.afterClosed().subscribe(result => {
      return;
    });
  }

  reportFormatChange(event: MatRadioChange) {
    this.selectedreportFormat = event.value;
    this.form.get('selectedreportFormat').setValue(event.value);
  }

  downloadReport(): void {
    this.errors = [];
    this.showReport = false;
    this.isDownloading$.next(true);
    this.showReport = false;

    this.parametersAudit = {
      DateFrom: this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString),
      DateTo: this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString),
      PaymentTypeId: this.form.get('paymentType').value,
      PaymentStatusId: this.form.get('paymentStatus').value,
      ClaimTypeId: this.form.get('claimTypes').value,
      Query: this.currentQuery ? this.currentQuery : this.form.get('searchTerm').value ? this.form.get('searchTerm').value : ' '
      // ReAllocate: this.hasReAllocatePermission(),
      // UserLoggedIn: this.userLoggedIn.id,
      // WorkPoolId: this.selectedWorkPool ? this.selectedWorkPool : WorkPoolEnum.PaymentPool,
      // PensionPaymentTypeId: (this.form.get('paymentType').value === this.pensionPayment)?this.form.get('pensionPaymentType').value:0,
      // CoidPaymentTypeId: (this.form.get('claimTypes').value === this.coidClaimsPayment)?this.form.get('coidPaymentType').value:0
    }

    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMAPaymentList';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 10;
    this.heightAudit = 10;
    this.toolbarAudit = 'false';
    this.showReport = false;
    this.isDownloading$.next(false);
  }

  selectAll() {
    this.selectedPaymentsToAllocate = [];
    this.selectedPaymentsToAllocateOnly = [];
    this.selectedPaymentsToReallocate = [];
    this.selectedPaymentsToSubmit = [];
    this.canAllocate$.next(false);
    this.isSelectAllSelected = !this.isSelectAllSelected;
    if (this.isSelectAllSelected && (!this.selectedPaymentsToAllocate || +this.selectedPaymentsToAllocate.length <= 0)) {
      this.dataSource.data.data.forEach((item) => {
        if (!item.disableSelection) {
          this.selectedPaymentsToAllocate.push(item);
        }
      });
    } else {
      this.selectedPaymentsToAllocate = [];
    }

    this.selectedPaymentsToSubmit = this.selectedPaymentsToAllocate.filter(x => x.paymentStatus == PaymentStatusEnum.Pending);
    this.selectedPaymentsToReallocate = this.selectedPaymentsToAllocate.filter(x => x.userName != null);
    this.selectedPaymentsToAllocateOnly = this.selectedPaymentsToAllocate.filter(x => x.userName == null);
    this.canReAllocate = (this.selectedPaymentsToReallocate && this.selectedPaymentsToReallocate.length > 0);
    this.canAllocate = (this.selectedPaymentsToAllocateOnly && this.selectedPaymentsToAllocateOnly.length > 0);
  }

  isSelected($event): boolean {
    return !this.selectedPaymentsToAllocate
      ? false
      : this.selectedPaymentsToAllocate.some(
        (s) => s.paymentId == $event.paymentId
      );
  }

  calculateTotalAmount(dataSource) {
    let totalAmount = 0;
    if (dataSource && dataSource.data && dataSource.data.data) {
      dataSource.data.data.forEach(element => {
        totalAmount += element.amount;
      });
    }
    return totalAmount;
  }

  isValidEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  submitAllPayments(): void {

    if (this.hasPermissionSubmitAllPayments) {
      const numberOfPayments = this.dataSource.data.rowCount;
      const question = (numberOfPayments > 1) ? `all ${numberOfPayments} payments` : `${numberOfPayments} payment`

      const row = new Payment();
      row.dialogQuestion = `Are you sure you want to submit ${question}?`;

      const dialogRef = this.dialog.open(PaymentDialogComponent, {
        width: '400px',
        data: { payment: row }
      });

      dialogRef.afterClosed().subscribe(payment => {
        if (payment == null) {
          return;
        } else {
          this.isSubmitting$.next(true);
        }

        this.paymentService.submitAllPayments(this.poolParams).subscribe(() => {
          this.done(`${question} queued.`);
          this.isSubmitting$.next(false);
          this.isSelectAllSelected = false;
          this.getData();
        });
      });
    } else {
      this.toastr.errorToastr("Your are not Authorized to submit multiple payments");
    }
  }
}
