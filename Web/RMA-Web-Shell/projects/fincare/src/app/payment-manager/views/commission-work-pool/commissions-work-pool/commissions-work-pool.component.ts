import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommissionsWorkPoolDataSource } from './commissions-work-pool.datasource';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommissionPoolSearchParams } from '../../../models/commission-pool-search-params';
import { CommissionHeader } from '../../../models/commission-header';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { SharedFloatMessage } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-float-message';
import { CommissionStatusEnum } from 'projects/fincare/src/app/shared/enum/commission-status.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { CommissionService } from '../../../services/commission.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { Constants } from '../../../models/constants';
import { debounceTime } from 'rxjs/operators';
import { SharedErrorTypeEnum } from 'projects/shared-components-lib/src/lib/shared-message-float/shared-error-type-enum';
import { SharedDataService } from '../../../services/shared-data.service';
import { CommissionReleaseConfirmationComponent } from '../../commission-release-confirmation/commission-release-confirmation.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';

@Component({
  selector: 'commissions-work-pool',
  templateUrl: './commissions-work-pool.component.html',
  styleUrls: ['./commissions-work-pool.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class CommissionsWorkPoolComponent extends UnSubscribe implements OnChanges {

  @Input() userLoggedIn: User;
  @Input() selectedWorkPool: WorkPoolEnum;
  @Input() currentQuery = '';
  @Input() actions: any[] = [];
  @Input() workPoolUsers: User[];

  canAllocate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSubmitting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: CommissionsWorkPoolDataSource;
  menus: { title: string; action: string; disable: boolean }[];
  heading = String.Empty;
  poolParams = new CommissionPoolSearchParams();
  selectedCommissionsToAllocateApi: CommissionHeader[] = [];
  selectedCommissionsToAllocate: CommissionHeader[] = [];
  selectedCommissionsToAllocateOnly: CommissionHeader[] = [];
  selectedCommissionsToReallocate: CommissionHeader[] = [];
  cadPool = +WorkPoolEnum.CadPool;
  slaItemType = SLAItemTypeEnum.CommissionPool;
  canReAllocate = false;
  canAllocate = false;
  isSelectAllSelected = false;
  isReleaseAllSelected = false;
  showReleaseAll = true;
  isReleaseAllDisabled = true;
  isCcaPool : boolean = false;
  floatMessage: SharedFloatMessage;
  users: User[] = [];
  selectedCommissionStatus = CommissionStatusEnum.Pending;

  
  pending = CommissionStatusEnum.Pending;
  submitted = CommissionStatusEnum.Submitted;
  reSubmitted = CommissionStatusEnum.ReSubmitted;
  paid = CommissionStatusEnum.Paid;
  withheld = CommissionStatusEnum.WithHeld;
  rejected = CommissionStatusEnum.Rejected;
  partiallyPaid = CommissionStatusEnum.PartiallyPaid;
  partiallyRejected = CommissionStatusEnum.PartiallyRejected;
  selectedBatchReference = '';
  hasSubmitPaymentPermission: boolean;
  hasPermissionSubmitAllPayments: boolean;
  commissionStatuses: Lookup[];
  form: UntypedFormGroup;
  defaultDropdownValue = 0;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  selectedApprovedPayments: CommissionHeader[] = [];
  selectedWithHeldPayments: CommissionHeader[] = [];
  totalToBeReleased = 0;
  totalToWithHeld = 0;
  selectedApprovedPaymentIds: number[] = [];
  selectedWithHeldPaymentIds: number[] = [];
  showSubmit = false;
  headerStatusId: number;
  commissions: CommissionHeader[] = [];
  withHoldingReasons: Lookup[] = [];
  payColumnHeaderText = 'Release';
  isRedirectedFromCommissionPeriod = false;
  pageIndex = 0;
  pageSize = 5;

  countries: Lookup[];

  @Input() hideVisibility = false;

  constructor(
    private readonly commissionService: CommissionService,
    private readonly dialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly datePipe: DatePipe,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private sharedDataService: SharedDataService,
    //private location: Location,
    private readonly lookupService: LookupService,
    private readonly route: ActivatedRoute

  ) {
    super();
    this.createForm();
    if (this.sharedDataService.poolParams && this.route.snapshot.paramMap.get('isDataReload') != null && this.route.snapshot.paramMap.get('isDataReload') == 'true') {
      this.form.get('startDate').setValue(this.sharedDataService.commissionReleaseStartDate);
      this.form.get('endDate').setValue(this.sharedDataService.commissionReleaseEndDate);
      this.poolParams = this.sharedDataService.poolParams;
      this.pageIndex = this.poolParams.pageIndex - 1;
      this.pageSize = this.poolParams.pageSize;
      this.isRedirectedFromCommissionPeriod = true;
    } else {
      this.isRedirectedFromCommissionPeriod = false;
    }
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCommissionStatuses();
    this.setUser();
    this.loadLookUps();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new CommissionsWorkPoolDataSource(this.commissionService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.getData();
    this.checkIfDataIsLoaded();
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');
    if (this.isRedirectedFromCommissionPeriod === true) {
      this.getData();
    }
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      startDate: new UntypedFormControl(''),
      endDate: new UntypedFormControl(''),
      commissionStatus: new UntypedFormControl(''),
    });

    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      commissionStatus: this.defaultDropdownValue,
    })
  }

  getInitialData() {
    this.setParams();
    let start = new Date();
    this.poolParams.startDate = this.datePipe.transform(new Date(this.form.get('startDate').value), Constants.dateString);
    this.poolParams.endDate = this.datePipe.transform(new Date(this.form.get('endDate').value), Constants.dateString);
    this.poolParams.workPoolId = WorkPoolEnum.CommissionPool;
    this.poolParams.commissionStatusId = this.form.get('commissionStatus').value;
    this.poolParams.reAllocate = this.hasReAllocatePermission();
    this.poolParams.userLoggedIn = this.userLoggedIn.id;
    this.poolParams.currentQuery = this.form.get('searchTerm').value;
    this.dataSource.setData(this.poolParams);
    this.isRedirectedFromCommissionPeriod = false;
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
    } if (!this.currentQuery || this.currentQuery === '') {
      // this.reset();
      // this.getInitialData();
    }
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
    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < startDate) {
      this.form.get('endDate').setErrors({ 'min-date': true });
    } else {
      this.sharedDataService.commissionReleaseStartDate = this.form.get('startDate').value;
      this.sharedDataService.commissionReleaseEndDate = this.form.get('endDate').value;
      this.sharedDataService.poolParams = this.poolParams;
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

  getCommissionStatuses(): void {
    this.lookupService.getCommissionStatuses().subscribe(
      data => {
        this.commissionStatuses = data;
      });
  }

  getCommissionStatus(id: number) {
    if (!id) { return };
    return this.formatText(CommissionStatusEnum[id]);
  }

  checkIfDataIsLoaded() {
    this.dataSource.isLoaded$.subscribe(result => {
      if (result) {
        this.refreshLoading.emit(false);
        this.checkForReleaseAllEnability();
      }
    })
  }

  checkForReleaseAllEnability() {
    const tempSelectedApprovedPayments = [];
    this.dataSource.data.data.forEach(commissionHeader => {
      if (commissionHeader.isFitAndProper && commissionHeader.headerStatusId != CommissionStatusEnum.Submitted) {
        tempSelectedApprovedPayments.push(commissionHeader);
      }
    });
    if (tempSelectedApprovedPayments.length > 0) {
      this.isReleaseAllDisabled = false;
    } else {
      this.isReleaseAllDisabled = true;
    }
  }

  setPoolName() {
    if (this.selectedWorkPool > 0) {
      this.heading = this.formatText(WorkPoolEnum[this.selectedWorkPool]);
      this.dataSource.poolName = this.heading;
    }
  }

  formatText(text: string): string {
    if(text.length > 0){
     return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
    }
  }

  sendSLAEmailNotification($event: any) {

  }

  setParams() {
    if (!this.isRedirectedFromCommissionPeriod) {
      this.poolParams.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
      this.poolParams.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
      this.poolParams.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'HeaderId';
      this.poolParams.direction = this.sort.direction ? this.sort.direction : 'Desc';
      this.poolParams.currentQuery = this.currentQuery ? this.currentQuery : '';
    }
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

  commissionStatusChange($event: any) {
    this.selectedCommissionStatus = $event.value;
  }

  AddCheckedItems(item: CommissionHeader, sendAllocation: boolean) {
    let index = this.selectedCommissionsToAllocate.findIndex(a => a.headerId === item.headerId);
    if (index > -1) {
      this.selectedCommissionsToAllocate.splice(index, 1);
    } else {
      this.selectedCommissionsToAllocate.push(item);
    }
    this.canReAllocate = this.selectedCommissionsToAllocate.some(a => a.assignedTo !== null);
    this.canAllocate = this.selectedCommissionsToAllocate.some(a => a.assignedTo == null);
    this.isSelectAllSelected = (this.isSelectAllSelected && (this.selectedCommissionsToAllocate.length > 0 || this.selectedCommissionsToReallocate.length > 0));
    this.sendForAllocation(sendAllocation);
  };

  disableReAllocate($event: CommissionHeader): boolean {
    return $event.assignedTo && this.canAllocate;
  }

  disableAllocate($event: CommissionHeader): boolean {
    return !$event.assignedTo && this.canReAllocate;
  }

  sendForAllocation(sendAllocation: boolean, onlyAllocate = false) {
    if (sendAllocation) {
      let item;
      if (onlyAllocate) {
        item = (this.isSelectAllSelected) ? [...this.selectedCommissionsToAllocateOnly] : [...this.selectedCommissionsToAllocate];
      } else {
        item = (this.isSelectAllSelected) ? [...this.selectedCommissionsToReallocate] : [...this.selectedCommissionsToAllocate];
      }
      this.selectedCommissionsToAllocateApi = item;
      this.canAllocate$.next(true);

      if(item.length == 1){
        const index = this.workPoolUsers.findIndex(a => a.id == item[0].assignedTo);
        if(index > -1){
          this.workPoolUsers.splice(index, 1)
        }
      }
    }
  }

  refresh() {
    this.selectedCommissionsToAllocate = [];
    this.selectedCommissionsToAllocateOnly = [];
    this.selectedCommissionsToReallocate = [];
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

  openManageUsersPopup(): void {
    //TO-DO
  }

  openSceduleUsersPopup() {
    //TO-DO
  }

  approvePaymentChecked(event: any, commissionHeader: CommissionHeader) {
    if (event.checked) {
      commissionHeader.details = null;

      this.selectedApprovedPayments.push(commissionHeader);
      this.selectedApprovedPaymentIds.push(commissionHeader.headerId);
      this.untickIfWithHeld(commissionHeader);
    } else {
      this.untickIfPay(commissionHeader);
    }
    this.canShowSubmit();
  }

  withHoldPaymentChecked(event: any, commissionHeader: CommissionHeader) {
    if (event.checked) {
      commissionHeader.details = null;
      this.selectedWithHeldPayments.push(commissionHeader);
      this.selectedWithHeldPaymentIds.push(commissionHeader.headerId);
      this.untickIfPay(commissionHeader);
    } else {
      this.untickIfWithHeld(commissionHeader);
    }
    this.canShowSubmit();
  }

  canShowSubmit() {
    if (this.selectedApprovedPaymentIds.length > 0 || this.selectedWithHeldPaymentIds.length > 0) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  untickIfWithHeld(commissionHeader: CommissionHeader) {
    for (let i = 0; i < this.selectedWithHeldPaymentIds.length; i++) {
      if ((this.selectedWithHeldPaymentIds[i] === commissionHeader.headerId)) {
        this.selectedWithHeldPaymentIds.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.selectedWithHeldPayments.length; i++) {
      if ((this.selectedWithHeldPayments[i].headerId === commissionHeader.headerId)) {
        this.selectedWithHeldPayments[i].withholdingReasonId = null;
        this.selectedWithHeldPayments.splice(i, 1);
        break;
      }
    }
  }

  untickIfPay(commissionHeader: CommissionHeader) {
    for (let i = 0; i < this.selectedApprovedPaymentIds.length; i++) {
      if ((this.selectedApprovedPaymentIds[i] === commissionHeader.headerId)) {
        this.selectedApprovedPaymentIds.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.selectedApprovedPayments.length; i++) {
      if ((this.selectedApprovedPayments[i].headerId === commissionHeader.headerId)) {
        this.selectedApprovedPayments.splice(i, 1);
        break;
      }
    }
  }

  managePeriod(commissionHeader: CommissionHeader) {
    this.sharedDataService.commissionReleaseStartDate = this.form.get('startDate').value;
    this.sharedDataService.commissionReleaseEndDate = this.form.get('endDate').value;
    this.sharedDataService.poolParams = this.poolParams;
    this.sharedDataService.commissionHeader = commissionHeader;
    this.router.navigate(['/fincare/payment-manager/commission-period', commissionHeader.periodId]);
  }

  setSelectedApprovedPaymentIdsNull() {
    if (this.selectedApprovedPaymentIds && this.selectedApprovedPaymentIds.length > 0) {
      this.selectedApprovedPaymentIds.length = 0;
    }
    this.setSelectedWithHoldPaymentIdsNull();
    this.canShowSubmit();
  }

  setSelectedWithHoldPaymentIdsNull() {
    if (this.selectedWithHeldPaymentIds && this.selectedWithHeldPaymentIds.length > 0) {
      this.selectedWithHeldPaymentIds.length = 0;
      this.selectedWithHeldPaymentIds = [];
      this.selectedWithHeldPayments = [];
    }
  }

  releaseCommissions() {
    this.sharedDataService.lastReleaseStatus = this.selectedCommissionStatus;
    let postData: CommissionHeader[] = [];
    this.selectedApprovedPayments.forEach(commissionHeader => {
      switch (this.selectedCommissionStatus) {
        case 1:
        case 2: commissionHeader.headerStatusId = CommissionStatusEnum.Submitted;
                break;
        case 3: commissionHeader.headerStatusId = CommissionStatusEnum.ReSubmitted;
                break;
      }
    });
    if (this.selectedWithHeldPayments && this.selectedWithHeldPayments.length > 0) {
      this.selectedWithHeldPayments.forEach(commissionHeader => {
        commissionHeader.headerStatusId = CommissionStatusEnum.WithHeld;
      });
    }
    postData = postData.concat(this.selectedApprovedPayments).concat(this.selectedWithHeldPayments);
    const dialog = this.dialog.open(CommissionReleaseConfirmationComponent, this.getConfirmationDialogConfig(postData));
    dialog.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.refresh();
        this.setSelectedApprovedPaymentIdsNull();
        this.selectedApprovedPayments = [];
        this.isReleaseAllSelected = false;
      }else{
        this.selectedApprovedPayments.forEach(commissionHeader => {
          commissionHeader.headerStatusId = CommissionStatusEnum.Pending;
          });
        this.selectedWithHeldPayments.forEach(commissionHeader => {
          commissionHeader.headerStatusId = CommissionStatusEnum.Pending;
        });
      }

    });
  }

  getCommissionDetailByHeader(commissionHeader: CommissionHeader) {
    this.sharedDataService.data[0] = commissionHeader.recepientName;
    this.sharedDataService.data[1] = commissionHeader.recepientCode;
    this.sharedDataService.data[2] = commissionHeader.periodMonth.toString();
    this.sharedDataService.data[3] = commissionHeader.periodYear.toString();
    this.sharedDataService.data[4] = commissionHeader.totalHeaderAmount.toString();
    this.sharedDataService.lastReleaseStatus = this.selectedCommissionStatus;
    this.router.navigate(['/fincare/payment-manager/broker-commission-details-view', commissionHeader.headerId, commissionHeader.headerStatusId, {IsWorkPool: 'true'}]);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then(() => {
      this.refresh();
    });
  }

  getConfirmationDialogConfig(selectedHeaders: CommissionHeader[]): MatDialogConfig {
    const config = new MatDialogConfig();
    config.disableClose = true;
    config.height = '650px',
    config.width = '600px';
    config.data = {
      selectedHeaders
    };
    return config;
  }

  onReleaseSelectAll(event: any) {
    this.selectedApprovedPayments = [];
    this.selectedApprovedPaymentIds = [];
    this.isReleaseAllSelected = !this.isReleaseAllSelected;
    if (event.checked) {
      this.dataSource.data.data.forEach(commissionHeader => {
        if (commissionHeader.isFitAndProper && commissionHeader.headerStatusId != CommissionStatusEnum.Submitted) {
          this.selectedApprovedPayments.push(commissionHeader);
          this.selectedApprovedPaymentIds.push(commissionHeader.headerId);
          this.untickIfWithHeld(commissionHeader);
        }
      });
      if (this.selectedApprovedPayments.length > 0) {
        this.showSubmit = true;
        this.isReleaseAllDisabled = false;
      } else {
        this.showSubmit = false;
        this.isReleaseAllDisabled = true;
      }
    } else {
      this.dataSource.data.data.forEach(commissionHeader => {
        this.untickIfPay(commissionHeader);
      });
      this.showSubmit = false;
      this.isReleaseAllDisabled = this.isReleaseAllDisabled;
    }
  }

  onWithHoldingReasonSelect(commissionHeader: CommissionHeader, event: any) {
    this.dataSource.data.data.find(c => c.headerId === commissionHeader.headerId).withholdingReasonId = event.value;
  }

  loadLookUps() {
    this.lookupService.getWithHoldingReasons().subscribe(data => {
      this.withHoldingReasons = data;
    });
  }

  navigateBack() {
    this.sharedDataService.lastReleaseStatus = this.selectedCommissionStatus;
    //this.location.back();
  }

  goToProducts(commissionHeader: CommissionHeader) {
    this.sharedDataService.lastReleaseStatus = this.selectedCommissionStatus;
    this.router.navigate(['/fincare/payment-manager/commission-product-release', commissionHeader.headerId]);
  }

  filterMenu(item: CommissionHeader) {
    this.menus =  [
      { title: 'Manage Period', action: 'managePeriod', disable: false },
    ];
  }

  onMenuSelect(item: CommissionHeader, menu: any) {
    switch (menu.action) {
      case 'managePeriod':
        this.managePeriod(item);
        break;
    }
  }

  public calculateTotalAmount() {
    return this.commissions.reduce((accum, curr) => accum + curr.totalHeaderAmount, 0);
  }
  
  getDisplayedColumns(): string[] {
    const columnDefinitions = [
      { display: 'Select', def: 'select', show: true},
      { display: 'Recipient Name', def: 'recepientName', show: true },
      { display: 'Is Fit And Proper', def: 'isFitAndProper', show: true },
      { display: 'Assigned To', def: 'assignedTo', show: true },
      { display: 'Verification Date', def: 'fitAndProperCheckDate', show: true },
      { display: 'Amount', def: 'totalHeaderAmount', show: true },
      { display: 'Pay', def: 'pay', show: true },
      { display: 'WithHold', def: 'withHold', show: this.selectedCommissionStatus === CommissionStatusEnum.Pending},
      { display: 'Comment', def: 'comment', show: true },
      { display: 'Header Status', def: 'headerStatus', show: true },
      { display: 'Actions', def: 'actions', show: true }
    ];

    if(this.selectedCommissionStatus === CommissionStatusEnum.Rejected){
      this.payColumnHeaderText = 'Re-Submit';
    }

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  selectAll() {
    this.selectedCommissionsToAllocate = [];
    this.selectedCommissionsToAllocateOnly = [];
    this.selectedCommissionsToReallocate = [];
    this.canAllocate$.next(false);
    this.isSelectAllSelected = !this.isSelectAllSelected;
    if (this.isSelectAllSelected && (!this.selectedCommissionsToAllocate || +this.selectedCommissionsToAllocate.length <= 0)) {
      this.dataSource.data.data.forEach((item) => {
        this.selectedCommissionsToAllocate.push(item);
      });
    } else {
      this.selectedCommissionsToAllocate = [];
    }

    this.selectedCommissionsToReallocate = this.selectedCommissionsToAllocate.filter(x=>x.assignedTo != null);
    this.selectedCommissionsToAllocateOnly = this.selectedCommissionsToAllocate.filter(x=>x.assignedTo == null);
    this.canReAllocate = (this.selectedCommissionsToReallocate && this.selectedCommissionsToReallocate.length > 0);
    this.canAllocate = (this.selectedCommissionsToAllocateOnly && this.selectedCommissionsToAllocateOnly.length > 0);
  }

  isSelected($event): boolean {
    return !this.selectedCommissionsToAllocate
      ? false
      : this.selectedCommissionsToAllocate.some(
        (s) => s.headerId == $event.headerId
      );
  }

  isReleaseSelectAllSelected($event): boolean {
    return !this.selectedApprovedPayments
      ? false
      : this.selectedApprovedPayments.some(
        (s) => s.headerId == $event.headerId
      );
  }

  getWithholdingReason(withholdingReasonId: number) {
    return this.withHoldingReasons.find(el => el.id === withholdingReasonId).name;
  }

  getHeaderStatus(headerStatusId: number) {
    let headerStatus;
    if (headerStatusId && headerStatusId > 0) {
      headerStatus = CommissionStatusEnum[headerStatusId];
    } else {
      headerStatus = 'Invalid';
    }
    return headerStatus;
  }

}
