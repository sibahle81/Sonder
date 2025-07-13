import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommissionHeader } from 'projects/fincare/src/app/payment-manager/models/commission-header';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { CommissionService } from 'projects/fincare/src/app/payment-manager/services/commission.service';
import { Router } from '@angular/router';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { HeaderStatusEnum } from 'projects/fincare/src/app/shared/enum/header-status.enum';
import { SharedDataService } from 'projects/fincare/src/app/payment-manager/services/shared-data.service';
import { CommissionReleaseConfirmationComponent } from 'projects/fincare/src/app/payment-manager/views/commission-release-confirmation/commission-release-confirmation.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Location } from '@angular/common';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-commission-release',
  templateUrl: './commission-release.component.html',
  styleUrls: ['./commission-release.component.css']
})
export class CommissionReleaseComponent implements OnInit, AfterViewInit {
  isLoading = false;
  displayedColumns = ['recepientName', 'isFitAndProper', 'fitAndProperCheckDate', 'totalHeaderAmount', 'pay', 'withHold', 'comment'];
  currentQuery: string;
  datasource = new MatTableDataSource<CommissionHeader>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  rowCount: number;
  headerTotal = 0;
  hearderName: string;
  accountCode: string;
  accountName: string;
  headerId: number;
  selectedApprovedPayments: CommissionHeader[] = [];
  selectedWithHeldPayments: CommissionHeader[] = [];
  totalToBeReleased = 0;
  totalToWithHeld = 0;
  selectedApprovedPaymentIds: number[] = [];
  selectedWithHeldPaymentIds: number[] = [];
  payStatusTypes: Lookup[] = [];
  form: UntypedFormGroup;
  showSubmit = false;
  commissions: CommissionHeader[] = [];
  commissionType: string;
  isSumitting = false;
  showComment = false;
  showReasons = false;
  payColumnHeaderText = 'Release';
  withHoldingReasons: Lookup[] = [];
  selectedPayStatus: number;
  showReleaseAll = false;
  hasViewCommissionPermission = false;
  hasReleaseCommissionPermission = false;
  hasPrintCommissionPermission = false;
  isAuthorized = false;
  headerStatusId: number;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly commissionService: CommissionService,
    private router: Router,
    private sharedDataService: SharedDataService,
    private confirmationDialog: MatDialog,
    private readonly lookupService: LookupService,
    private location: Location) { }

  ngOnInit() {
    this.hasReleaseCommissionPermission = userUtility.hasPermission('Release Commission');
    this.hasPrintCommissionPermission = userUtility.hasPermission('Print Commission');

    if (this.hasReleaseCommissionPermission) {
      this.isAuthorized = true;
    }

    if (this.isAuthorized) {
      this.createForm();
      this.loadPayStatusTypes();
      this.loadLookUps();
      this.form.get('payStatusType').patchValue(1);
      if (this.sharedDataService.lastReleaseStatus === 0) {
        this.sharedDataService.lastReleaseStatus = 1;
        this.selectedPayStatus = 1;
      }
      this.initDatasource();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      payStatusType: [null],
      filterCommissions: ['']
    });
  }

  loadPayStatusTypes() {
    this.payStatusTypes.push(new Lookup(1, 'Current'));
    this.payStatusTypes.push(new Lookup(2, 'Withheld'));
    this.payStatusTypes.push(new Lookup(3, 'Bank Rejections'));
  }

  getCommissionsPendingRelease() {
    this.isLoading = true;
    this.commissionService.getCommissionsPendingRelease()
      .subscribe(data => {
        this.commissions = data;
        this.datasource.data = data;
        this.isLoading = false;
      });
  }

  getCommissionsCurrentlyWithheld() {
    this.isLoading = true;
    this.commissionService.getCommissionsCurrentlyWithheld()
      .subscribe(data => {
        this.commissions = data;
        this.datasource.data = data;
        this.isLoading = false;
      });
  }

  approvePaymentChecked(event: any, commissionHeader: CommissionHeader) {
    if (event.checked) {
      commissionHeader.details = null;
      switch (this.selectedPayStatus) {
        case 1:
        case 2: commissionHeader.headerStatusId = HeaderStatusEnum.Submitted;
                break;
        case 3: commissionHeader.headerStatusId = HeaderStatusEnum.Resubmitted;
                break;
      }

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
      commissionHeader.headerStatusId = HeaderStatusEnum.Withheld;
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

  onStatusTypeSelect(event: any) {
    const value = event.value;
    this.displayedColumns = [];
    this.onChangeReset();
    this.selectedPayStatus = value;
    switch (value) {
      case 1: this.getCommissionsPendingRelease();
              this.initPendingUiProperties();
              this.selectedPayStatus = 1;
              break;
      case 2: this.getCommissionsCurrentlyWithheld();
              this.initWithHeldUiProperties();
              this.selectedPayStatus = 2;
              break;
      case 3: this.getCommissionsRejected();
              this.initRejectedUiProperties();
              this.selectedPayStatus = 3;
              break;
    }
  }

  releaseCommissions() {
    this.sharedDataService.lastReleaseStatus = this.selectedPayStatus;
    let postData: CommissionHeader[] = [];
    postData = postData.concat(this.selectedApprovedPayments).concat(this.selectedWithHeldPayments);
    const dialog = this.confirmationDialog.open(CommissionReleaseConfirmationComponent, this.getConfirmationDialogConfig(postData));
    dialog.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.resetValues();
      }
    });
  }

  searchCommissions() {
    this.isLoading = true;
    const query = this.form.get('filterCommissions').value;
    if (query.length > 0) {
      const data = this.commissions.filter(c => c.recepientName.toLowerCase().indexOf(query.toLowerCase()) > -1);
      this.datasource.data = data;
    } else {
      this.datasource.data = this.commissions;
    }
    this.isLoading = false;
  }

  resetValues() {
    this.commissions = [];
    this.datasource.data = [];
    this.selectedApprovedPayments = [];
    this.selectedWithHeldPayments = [];
    this.selectedApprovedPaymentIds = [];
    this.selectedWithHeldPaymentIds = [];
    this.initDatasource();
    this.showSubmit = false;
  }

  getCommissionsRejected() {
    this.isLoading = true;
    this.commissionService.getCommissionsRejected()
      .subscribe(data => {
        this.commissions = data;
        this.datasource.data = data;
        this.isLoading = false;
      });
  }
  getCommissionDetailByHeader(commissionHeader: CommissionHeader) {
    this.sharedDataService.data[0] = commissionHeader.recepientName;
    this.sharedDataService.data[1] = commissionHeader.recepientCode;
    this.sharedDataService.data[2] = commissionHeader.periodMonth.toString();
    this.sharedDataService.data[3] = commissionHeader.periodYear.toString();
    this.sharedDataService.data[4] = commissionHeader.totalHeaderAmount.toString();
    this.sharedDataService.lastReleaseStatus = this.selectedPayStatus;
    this.router.navigate(['/fincare/payment-manager/broker-commission-details-view', commissionHeader.headerId, this.headerStatusId]);
  }

  async delay(ms: number) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), ms)).then(() => {
      this.resetValues();
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

  onChangeReset() {
    this.commissions = [];
    this.datasource.data = [];
    this.selectedApprovedPayments = [];
    this.selectedWithHeldPayments = [];
    this.selectedApprovedPaymentIds = [];
    this.selectedWithHeldPaymentIds = [];
  }

  onReleaseSelectAll(event: any) {
    if (event.checked) {
      this.commissions.forEach(commissionHeader => {
        if (commissionHeader.isFitAndProper) {
          commissionHeader.details = null;
          commissionHeader.headerStatusId = HeaderStatusEnum.Submitted;
          this.selectedApprovedPayments.push(commissionHeader);
          this.selectedApprovedPaymentIds.push(commissionHeader.headerId);
          this.untickIfWithHeld(commissionHeader);
        }
      });
      if (this.selectedApprovedPayments.length > 0) {
        this.showSubmit = true;
      }
    } else {
      this.commissions.forEach(commissionHeader => {
        this.untickIfPay(commissionHeader);
      });
      this.showSubmit = false;
    }
  }

  onWithHoldingReasonSelect(commissionHeader: CommissionHeader, event: any) {
    this.datasource.data.find(c => c.headerId === commissionHeader.headerId).withholdingReasonId = event.value;
  }

  initDatasource() {
    switch (this.sharedDataService.lastReleaseStatus) {
      case 1: this.getCommissionsPendingRelease();
              this.initPendingUiProperties();
              this.form.get('payStatusType').patchValue(1);
              this.selectedPayStatus = 1;
              break;
      case 2: this.getCommissionsCurrentlyWithheld();
              this.initWithHeldUiProperties();
              this.form.get('payStatusType').patchValue(2);
              this.selectedPayStatus = 2;
              break;
        case 3: this.getCommissionsRejected();
                this.initRejectedUiProperties();
                this.form.get('payStatusType').patchValue(3);
                this.selectedPayStatus = 3;
                break;
    }
  }

  loadLookUps() {
    this.lookupService.getWithHoldingReasons().subscribe(data => {
      this.withHoldingReasons = data;
    });
  }

  navigateBack() {
    this.sharedDataService.lastReleaseStatus = this.selectedPayStatus;
    this.location.back();
  }

  goToProducts(commissionHeader: CommissionHeader) {
    this.sharedDataService.lastReleaseStatus = this.selectedPayStatus;
    this.router.navigate(['/fincare/payment-manager/commission-product-release', commissionHeader.headerId]);
  }

  ngAfterViewInit(): void {
    this.datasource.sort = this.sort;
    this.datasource.paginator = this.paginator;
  }

  initPendingUiProperties() {
    this.displayedColumns = ['recepientName', 'isFitAndProper', 'fitAndProperCheckDate', 'totalHeaderAmount', 'pay', 'withHold', 'comment'];
    this.commissionType = 'Current';
    this.payColumnHeaderText = 'Release';
    this.showReasons = false;
    this.showReleaseAll = true;
    this.headerStatusId = 1;
  }

  initWithHeldUiProperties() {
    this.displayedColumns = ['recepientName', 'isFitAndProper', 'fitAndProperCheckDate', 'totalHeaderAmount', 'pay', 'comment'];
    this.commissionType = 'Withheld';
    this.payColumnHeaderText = 'Release';
    this.showReasons = true;
    this.showReleaseAll = false;
    this.headerStatusId = 4;
  }

  initRejectedUiProperties() {
    this.displayedColumns = ['recepientName', 'isFitAndProper', 'fitAndProperCheckDate', 'totalHeaderAmount', 'pay', 'comment'];
    this.commissionType = 'Bank Rejections';
    this.payColumnHeaderText = 'Re-Submit';
    this.showComment = true;
    this.showReasons = false;
    this.showReleaseAll = false;
    this.headerStatusId = 5;
  }

  public calculateTotalAmount() {
    return this.commissions.reduce((accum, curr) => accum + curr.totalHeaderAmount, 0);
  }
}
