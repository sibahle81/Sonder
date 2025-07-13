import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { BehaviorSubject } from 'rxjs';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { ClaimPagedInvoiceDataSource } from './claim-paged-invoice.datasource';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ClaimReferralTypeLimitGroupEnum } from '../../claim-referral/claim-referral-type-limit-group-enum';
import { ClaimReferralComponent } from '../../claim-referral/claim-referral.component';
import { MatDialog } from '@angular/material/dialog';
import { Claim } from '../../../entities/funeral/claim.model';
import { ReferralTypeLimitConfiguration } from '../../claim-referral/referral-type-limit-configuration';
import { ClaimInvoiceDialogComponent } from '../claim-invoice-dialog/claim-invoice-dialog.component';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ClaimReferralQueryType } from '../../../entities/claim-referral-query-type';
import { ClaimEstimate } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/claimEstimate';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { BeneficiaryBankAccountDialogComponent } from './beneficiary-bank-account-dialog/beneficiary-bank-account-dialog.component';
import { RolePlayerBankingDetail } from 'projects/shared-components-lib/src/lib/models/banking-details.model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RefreshService } from '../../../refresh-service/refresh-service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'claim-paged-invoice',
  templateUrl: './claim-paged-invoice.component.html',
  styleUrls: ['./claim-paged-invoice.component.css']
})
export class ClaimPagedInvoiceComponent extends PermissionHelper implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() claimInvoiceType: ClaimInvoiceTypeEnum;
  @Input() claim: Claim;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading claim invoices...please wait');

  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: ClaimPagedInvoiceDataSource;

  menus: { title: string; url: string; disable: boolean }[];
  referralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];
  filteredReferralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];

  user: User;
  params = new PagedParams();
  slaItemType: SLAItemTypeEnum;

  count = 0;
  showPayMultiple = false;
  showNotes = false;

  selectedInvoiceIds: number[] = [];
  userReminders: UserReminder[] = [];
  claimManager: User[] = [];
  claimInvoice: ClaimInvoice;
  claimInvoices: ClaimInvoice[] = [];
  claimsReferralQueryType: ClaimReferralQueryType[] = [];

  paymentRequest = +ClaimInvoiceStatusEnum.PaymentRequested;
  deleted = +ClaimInvoiceStatusEnum.Deleted;

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private readonly claimCareService: ClaimCareService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly authorizationService: AuthService,
    private readonly userReminderService: UserReminderService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly confirmService: ConfirmationDialogsService,
    private readonly wizardService: WizardService,
    private readonly refreshService: RefreshService
  ) {
    super();
    this.user = this.authService.getCurrentUser();
    this.lookups();
  }

  ngOnChanges(): void {
    this.setPaginatorOnSortChange();
    this.dataSource.personEventId = this.personEvent.personEventId;
    this.setAllowPayMultiple();
    this.setSLAType();
    this.getData();
  }

  lookups() {
    this.getAuthorizationLimitsByReferralType();
  }

  setPaginatorOnSortChange() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedInvoiceDataSource(this.claimInvoiceService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }

  setAllowPayMultiple() {
    let selectedInvoiceType = +ClaimInvoiceTypeEnum[this.claimInvoiceType];
    this.showPayMultiple = selectedInvoiceType === ClaimInvoiceTypeEnum.DaysOffInvoice;
  }

  setSLAType() {
    let selectedInvoiceType = +ClaimInvoiceTypeEnum[this.claimInvoiceType];

    switch (selectedInvoiceType) {
      case ClaimInvoiceTypeEnum.FuneralExpenses:
        this.slaItemType = SLAItemTypeEnum.FuneralExpenseInvoice
        break;
      case ClaimInvoiceTypeEnum.SundryInvoice:
        this.slaItemType = SLAItemTypeEnum.SundryInvoice
        break;
      case ClaimInvoiceTypeEnum.WidowLumpSumAward:
        this.slaItemType = SLAItemTypeEnum.WidowLumpSumInvoice
        break;
      case ClaimInvoiceTypeEnum.TravelAward:
        this.slaItemType = SLAItemTypeEnum.TravelExpenseInvoice
        break;
      case ClaimInvoiceTypeEnum.DaysOffInvoice:
        this.slaItemType = SLAItemTypeEnum.TotalTemporaryDisability
        break;
      case ClaimInvoiceTypeEnum.PartialDependencyLumpsum:
        this.slaItemType = SLAItemTypeEnum.PartialDependencyLumpsum
        break;
      case ClaimInvoiceTypeEnum.PDAward:
        this.slaItemType = SLAItemTypeEnum.PDAward
        break;
      default: this.slaItemType = null;
        break;
    }
  }

  getData() {
    this.setParams();
    if (this.params.currentQuery == ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.WidowLumpSumAward]) {
      this.params.currentQuery = 'WLSAward';
    }
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery)
  }

  disablePay(claimInvoiceStatusId: number): boolean {
    const disallowedClaimInvoiceStatuses = [
      +ClaimInvoiceStatusEnum.PaymentRequested,
      +ClaimInvoiceStatusEnum.Referred,
      +ClaimInvoiceStatusEnum.Allocated,
      +ClaimInvoiceStatusEnum.RequestedForApproval,
      +ClaimInvoiceStatusEnum.PendingAuthorization,
    ];

    if (disallowedClaimInvoiceStatuses.includes(claimInvoiceStatusId)) {
      return false;
    }

    const isClaimStatusValid = this.claim.claimStatus !== ClaimStatusEnum.PendingAcknowledgement &&
      this.claim.claimStatus !== ClaimStatusEnum.PendingInvestigations;
    const isLiabilityStatusValid = this.claim.claimLiabilityStatus !== ClaimLiabilityStatusEnum.LiabilityNotAccepted &&
      this.claim.claimLiabilityStatus !== ClaimLiabilityStatusEnum.Pending;

    return isClaimStatusValid && isLiabilityStatusValid;
  }


  shouldShowRepay(invoiceType: any): boolean {
    if (!this.dataSource || !this.dataSource.data || !this.dataSource.data.data) {
      return false;
    }

    const invoicesOfType = this.dataSource.data.data.filter(invoice => invoice.claimInvoiceType === invoiceType);

    return invoicesOfType.length > 0 && invoicesOfType.every(invoice =>
      invoice.claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentRejected ||
      invoice.claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentReversed
    );
  }


  disableApproval(claimInvoiceStatusId: number): boolean {
    const canSendForApproval = [
      +ClaimInvoiceStatusEnum.RequestedForApproval,
      +ClaimInvoiceStatusEnum.Rejected,
      +ClaimInvoiceStatusEnum.PaymentRequested
    ].includes(claimInvoiceStatusId);

    if (canSendForApproval || userUtility.hasPermission('Disable Send Invoice Approval')) {
      return false;
    }

    return true;
  }


  showApproval(row: ClaimInvoice): boolean {
    return row.claimInvoiceStatusId == +ClaimInvoiceStatusEnum.RequestedForApproval;
  }


  disableAllocated(claimInvoiceStatusId: number): boolean {
    const editableStatuses = [
      +ClaimInvoiceStatusEnum.RequestedForApproval,
      +ClaimInvoiceStatusEnum.Allocated,
      +ClaimInvoiceStatusEnum.Rejected,
      +ClaimInvoiceStatusEnum.PaymentReversed,
      +ClaimInvoiceStatusEnum.PaymentRequested,
      +ClaimInvoiceStatusEnum.PendingAuthorization
    ];
    return !editableStatuses.includes(claimInvoiceStatusId);
  }

  disableView(row: ClaimInvoice): boolean {
    const invoiceTypes = [
      ClaimInvoiceTypeEnum.PDAward,
      ClaimInvoiceTypeEnum.OtherBenefitAwd,
    ];

    return !invoiceTypes.includes(row.claimInvoiceType);
  }

  disableEdit(row: ClaimInvoice): boolean {
    const invoiceTypes = [
      ClaimInvoiceTypeEnum.PDAward,
      ClaimInvoiceTypeEnum.OtherBenefitAwd,
    ];

    return !invoiceTypes.includes(row.claimInvoiceType);
  }

  disableReject(row: ClaimInvoice): boolean {
    const { claimInvoiceStatusId, createdBy } = row;
    const isRelevantStatus =
      claimInvoiceStatusId == +ClaimInvoiceStatusEnum.Captured ||
      (claimInvoiceStatusId == +ClaimInvoiceStatusEnum.RequestedForApproval &&
        this.userHasRelevantPoolPermission());

    if (isRelevantStatus) {
      return createdBy === this.user.email.toLowerCase();
    }

    return false;
  }

  private userHasRelevantPoolPermission(): boolean {
    return ['Sca Pool', 'Claims Assessor Pool', 'Cmc Pool'].some(role => this.userHasPermission(role));
  }


  getClaimInvoiceType(id: number) {
    return this.formatText(ClaimInvoiceTypeEnum[id]);
  }

  getClaimInvoiceStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimInvoiceStatusEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  getClaimDetails(item: ClaimInvoice) {
    this.claimCareService.checkBankingDetailsInvoicePayment(item).subscribe(result => {
      if (!result.result) {
        this.getData();
        this.isLoading$.next(false);
        this.alertService.error(result.message[0]);
      }
      else {
        if (this.checkClaimStatusBeforePay()) {
          this.claimCareService.GetClaim(item.claimId).subscribe(claim => {
            this.claim = claim ? claim : null;
            let permissions = this.referralTypeLimitConfiguration.filter(p => p.amountLimit >= item.invoiceAmount).map(a => a.permissionName)

            if (item.claimInvoiceType == ClaimInvoiceTypeEnum.WidowLumpSumAward ||
              item.claimInvoiceType == ClaimInvoiceTypeEnum.SundryInvoice ||
              item.claimInvoiceType == ClaimInvoiceTypeEnum.FuneralExpenses ||
              item.claimInvoiceType == ClaimInvoiceTypeEnum.PartialDependencyLumpsum ||
              item.claimInvoiceType == ClaimInvoiceTypeEnum.TravelAward) {
              this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(item.claimInvoiceId).subscribe((result) => {
                if (result) {
                  result.claimInvoiceStatusId = ClaimInvoiceStatusEnum.RequestedForApproval;
                  this.loadingMessage$.next('Update Claim Invoice...');
                  this.claimInvoiceService.updateClaimInvoice(result).subscribe((data) => {
                    if (data) {
                      this.personEvent.claimInvoiceId = item.claimInvoiceId;
                      this.createInvoicePaymentApprovalWizard(item.claimInvoiceId);
                      this.getData();
                      this.isLoading$.next(false);
                    } else {
                      this.isLoading$.next(false);
                    }
                  });
                }
              });
            }
            else {
              this.openReferralDialog(permissions);
            }
          });
          this.sendCommunication(this.personEvent.personEventId);
        }
        else {
          this.isLoading$.next(false);
        }
      }
    });
  }

  createInvoicePaymentApprovalWizard(claimInvoiceId: number) {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'invoice-payment-approval';
    startWizardRequest.linkedItemId = claimInvoiceId;
    startWizardRequest.data = JSON.stringify(this.personEvent);
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      if (result) {
        this.alertService.success('Workflow notification created to CMC for approval', 'Success', true);
        this.getData();
        this.isLoading$.next(false);
      }
      else {
        this.isLoading$.next(false);
      }
    });
  }

  getAuthorizationLimitsByReferralType() {
    this.claimCareService.GetReferralTypeLimitConfiguration().subscribe(results => {
      if (results) {
        this.referralTypeLimitConfiguration = results;
        this.filterReferralTypeLimitConfigPermission();
      }
    });
  }

  filterReferralTypeLimitConfigPermission() {
    this.referralTypeLimitConfiguration.forEach(permission => {
      if (this.userHasPermission(permission.permissionName)) {
        this.filteredReferralTypeLimitConfiguration.push(permission);
      }
    });
  }

  userHasAuthorityLimit(item: ClaimInvoice): boolean {
    if (!this.filteredReferralTypeLimitConfiguration) {
      return false;
    }

    switch (item.claimInvoiceType) {
      case ClaimInvoiceTypeEnum.DaysOffInvoice:
        const filteredLimitConfigurations = this.filteredReferralTypeLimitConfiguration
          .filter(config => config.permissionName.toLowerCase().includes('days') &&
            config.referralTypeLimitGroupId === ClaimReferralTypeLimitGroupEnum.TemporaryTotalDisablement);

        return filteredLimitConfigurations.some(config => {
          const extractedDays = this.extractDays(config.permissionName);

          return config.amountLimit >= item.invoiceAmount && extractedDays >= item.totalDaysOff;
        });

      case ClaimInvoiceTypeEnum.PDAward
        || ClaimInvoiceTypeEnum.WidowLumpSumAward
        || ClaimInvoiceTypeEnum.SympathyAward
        || ClaimInvoiceTypeEnum.PartialDependencyLumpsum:

        return this.filteredReferralTypeLimitConfiguration
          .some(config => config.referralTypeLimitGroupId === ClaimReferralTypeLimitGroupEnum.LumpSum &&
            config.amountLimit >= item.invoiceAmount);

      case ClaimInvoiceTypeEnum.SundryInvoice:
        return this.filteredReferralTypeLimitConfiguration
          .some(config => config.referralTypeLimitGroupId === ClaimReferralTypeLimitGroupEnum.Investigation &&
            config.amountLimit >= item.invoiceAmount);
      
      default:
        // handle all default cases
        return this.filteredReferralTypeLimitConfiguration.some(a => a.amountLimit >= item.invoiceAmount);
    }
  }

  extractDays(input: string): number {
    const match = input.match(/(\d+)Days/);
    return match ? parseInt(match[1], 10) : 0;
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'claimId';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.claimInvoiceType ? this.claimInvoiceType.toString() : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: this.showPayMultiple },
      { def: 'payee', show: true },
      { def: 'claimInvoiceType', show: true },
      { def: 'claimInvoiceStatus', show: true },
      { def: 'invoiceDate', show: true },
      { def: 'invoiceAmount', show: true },
      { def: 'createdBy', show: true },
      { def: 'daysOffFrom', show: (this.claimInvoiceType.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.DaysOffInvoice]) },
      { def: 'daysOffTo', show: (this.claimInvoiceType.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.DaysOffInvoice]) },
      { def: 'totalDays', show: (this.claimInvoiceType.toString() === ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.DaysOffInvoice]) },
      { def: 'sla', show: this.slaItemType },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  onMenuSelect(claimInvoice: ClaimInvoice, menu: any) {
    this.isLoading$.next(true);
    switch (menu) {
      case 'pay':
        this.openSendPaymentConfirmationDialog(claimInvoice)
        break;
      case 'repay':
        this.showDetail(claimInvoice, menu);
        break;
    }
  }

  openSendPaymentConfirmationDialog(claimInvoice: ClaimInvoice) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Request Payment?',
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (claimInvoice.claimInvoiceType == ClaimInvoiceTypeEnum.OtherBenefitAwd) {
          claimInvoice.claimInvoiceStatusId = +ClaimInvoiceStatusEnum.PaymentRequested;
          this.claimInvoiceService.updateClaimInvoiceV2(claimInvoice).subscribe(result => {
            if (result) {
              if (result.claimStatusId == +ClaimInvoiceStatusEnum.PaymentRequested) {
                this.alertService.success('payment requested successfully...');
              } else if (result.claimStatusId == +ClaimInvoiceStatusEnum.PendingAuthorization) {
                this.alertService.success('payment authorisation requested successfully...');
              }
              this.getData();
              this.isLoading$.next(false);
            }
          });
        } else {
          this.reinstateClaimInvoice(claimInvoice);
          if (this.personEvent.isFatal) {
            this.getClaimDetails(claimInvoice);
          } else {
            this.userHasAuthorityLimit(claimInvoice) ? this.payClaimInvoice(claimInvoice) : this.getClaimDetails(claimInvoice);
          }
        }
      }
    });
  }

  addCheckedItems($event: any, item) {
    if ($event.checked === true) {
      this.selectedInvoiceIds.push(item.claimInvoiceId);
    }
    else if ($event.checked === false) {
      const index: number = this.selectedInvoiceIds.indexOf(item.claimInvoiceId);
      if (index !== -1) {
        this.selectedInvoiceIds.splice(index, 1);
      }
    }
  }

  openReferralDialog(permissions: string[]) {
    const dialogRef = this.dialog.open(ClaimReferralComponent, {
      width: '1300px',
      maxHeight: '700px',
      disableClose: true,
      data: {
        claim: this.claim,
        permissions: permissions,
        referralType: ClaimReferralTypeLimitGroupEnum.Payment,
        insuredLife: this.personEvent.rolePlayer
      }
    });
    this.isLoading$.next(false);
    dialogRef.afterClosed().subscribe(result => {
      if (result) { }
    })
  }

  checkClaimStatusBeforePay() {
    if (this.claim.claimStatus !== ClaimStatusEnum.PendingAcknowledgement
      && this.claim.claimLiabilityStatus !== ClaimLiabilityStatusEnum.Pending) {
      return true;
    }
    else {
      this.alertService.error('Cannot allocate because claim status is Pending Acknowledgement or liability status is Pending');
      return false;
    }
  }

  payClaimInvoice(item: ClaimInvoice) {
    let allocatedAmount: number = 0;
    let claimEstimate: ClaimEstimate[] = [];
    if (item.claimInvoiceType === +ClaimInvoiceTypeEnum.WidowLumpSumAward) {
      this.claimInvoiceService.getWidowLumpsumInvoiceByClaimId(item.claimId).subscribe(invoices => {
        for (let i = 0; i < invoices.length; i++) {
          if (invoices[i].claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentRequested) {
            allocatedAmount += invoices[i].invoiceAmount;
          }
        }
        this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.WidowsLumpSum, this.personEvent.personEventId)
          .subscribe(result => {
            if (this.personEvent.claims[0].claimStatus !== ClaimStatusEnum.PendingAcknowledgement
              || this.personEvent.claims[0].claimLiabilityStatus !== ClaimLiabilityStatusEnum.Pending) {
              this.checkEstimate(result, allocatedAmount, item);
            }
            else {
              this.alertService.error('Cannot allocate because claim status is Pending Acknowledgement or liability status is Pending');
              this.isLoading$.next(false);
            }
          });
      });
    }
    else if (item.claimInvoiceType === +ClaimInvoiceTypeEnum.FuneralExpenses) {
      this.claimInvoiceService.getFuneralExpenseInvoiceByClaimId(item.claimId).subscribe(invoices => {
        for (let i = 0; i < invoices.length; i++) {
          if (invoices[i].claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentRequested) {
            allocatedAmount += invoices[i].invoiceAmount;
          }
        }
        this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.Funeral, this.personEvent.personEventId)
          .subscribe(result => {
            this.checkEstimate(result, allocatedAmount, item);
          });
      });
    }
    else if (item.claimInvoiceType === +ClaimInvoiceTypeEnum.SundryInvoice) {
      this.claimInvoiceService.getSundryInvoiceByClaimId(item.claimId).subscribe(invoices => {
        for (let i = 0; i < invoices.length; i++) {
          if (invoices[i].claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentRequested) {
            allocatedAmount += invoices[i].invoiceAmount;
          }
        }
        this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.Sundry, this.personEvent.personEventId)
          .subscribe(result => {
            if (this.personEvent.claims[0].claimStatus !== ClaimStatusEnum.PendingAcknowledgement
              || this.personEvent.claims[0].claimLiabilityStatus !== ClaimLiabilityStatusEnum.Pending) {
              this.checkEstimate(result, allocatedAmount, item);
            }
            else {
              this.alertService.error('Cannot allocate because claim status is Pending Acknowledgement or liability status is Pending');
              this.isLoading$.next(false);
            }
          });
      });
    }
    else if (item.claimInvoiceType === +ClaimInvoiceTypeEnum.DaysOffInvoice) {
      this.claimInvoiceService.getDaysOffInvoiceByClaimId(item.claimId).subscribe(invoices => {
        for (let i = 0; i < invoices.length; i++) {
          if (invoices[i].claimInvoiceStatusId === ClaimInvoiceStatusEnum.PaymentRequested) {
            allocatedAmount += invoices[i].invoiceAmount;
          }
        }
        this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(+EstimateTypeEnum.DaysOff, this.personEvent.personEventId)
          .subscribe(result => {
            this.checkEstimate(result, allocatedAmount, item);
          })
      })
    } else {
      this.checkEstimate(claimEstimate, allocatedAmount, item);
    }
  }

  checkEstimate(result: ClaimEstimate[], allocatedAmount: number, item: ClaimInvoice) {
    let maxAmountAllowed: number = 0;
    if (result && result.length > 0) {
      result.forEach(a => maxAmountAllowed += a.estimatedValue);
      let currentAmount: number = allocatedAmount + item.invoiceAmount;
      if (currentAmount > maxAmountAllowed) {
        this.alertService.error('Cannot allocate more than estimated amount');
        this.isLoading$.next(false);
      }
      else {
        this.allocateInvoice(item);
      }
    }
    else {
      this.allocateInvoice(item);
    }
  }

  allocateInvoice(item: ClaimInvoice) {
    this.claimCareService.submitInvoicePayment(item).subscribe(result => {
      if (!result.result) {
        this.getData();
        this.isLoading$.next(false);
        this.alertService.error(result.message[0]);
      }
      else {
        this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(item.claimInvoiceId).subscribe(result => {
          if (result) {
            this.getData();
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  showDetail($event: any, actionType: any) {
    const dialogRef = this.dialog.open(ClaimInvoiceDialogComponent, {
      width: '80%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        invoiceType: this.claimInvoiceType,
        claimInvoice: $event,
        personEvent: this.personEvent,
        invoiceAction: actionType,
        claimInvoiceType: ClaimInvoiceTypeEnum[this.claimInvoiceType],
        claim: this.claim
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getData();
      this.isLoading$.next(false);
    });
  }

  onNotificationSend($event: any) {
    const isLiabilityStatusPending = this.checkClaimStatusBeforePay();
    if (isLiabilityStatusPending) {
      this.confirmService.confirmWithoutContainer('Approve transaction', 'Generate workflow to team leader to approve transaction', 'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result) {
            this.sendReminderToCM($event);
          }
        });
    }
  }

  createUserReminders(userId: number, $event: any) {
    this.isLoading$.next(true);
    var claim = this.personEvent.claims[0];
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.text = `Please approve payment transaction for - ${this.getClaimInvoiceType($event.claimInvoiceType)} - claim number: ${claim.claimReferenceNumber}`;
    userReminder.assignedByUserId = this.authorizationService.getCurrentUser().id;
    userReminder.assignedToUserId = userId;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();

    this.userReminders.push(userReminder);

    this.userReminderService.createUserReminders(this.userReminders).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      }
    });
  }

  sendReminderToCM($event: any): void {
    this.personEvent.claimInvoiceId = $event.claimInvoiceId;
    this.startClaimEarningsValidate();
  }

  startClaimEarningsValidate() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'cad-request-invoice-payment';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      if (result) {
        this.alertService.success('Workflow notification created to team leader for approval', 'Success', true);
        this.getData();
        this.isLoading$.next(false);
      }
      else {
        this.isLoading$.next(false);
      }
    });
  }

  refresh() {
    this.selectedInvoiceIds = null;
    this.getData();
  }

  payMultiple() {
    if (this.selectedInvoiceIds && this.selectedInvoiceIds.length > 0) {
      this.openBeneficiaryBankingDialog();
    }
    else {
      this.alertService.error('Invoice/s not selected');
    }
  }

  openPayMultipleInvoiceConfirmationDialog(payeeRolePlayer: RolePlayer, payeeRolePlayerBankingDetail: RolePlayerBankingDetail) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Payment',
        text: `Would you like to pay the selected invoice(s)?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('sending invoice(s)...please wait');

        this.claimInvoiceService.getClaimInvoicesByClaimId(this.claim.claimId).subscribe(results => {
          if (results?.length) {
            // Filter invoices based on selected IDs
            this.claimInvoices = results.filter(result =>
              this.selectedInvoiceIds.includes(result.claimInvoiceId)
            );

            // Update each filtered invoice with the provided details
            this.claimInvoices.forEach(invoice => {
              invoice.payeeRolePlayerBankAccountId = payeeRolePlayerBankingDetail.id;
              invoice.payeeRolePlayerId = payeeRolePlayer.rolePlayerId;
            });

            // Process the updated invoices
            this.processMultipleInvoices(this.claimInvoices);
          }
        });
      }
    });
  }

  processMultipleInvoices(claimInvoices: ClaimInvoice[]) {
    this.claimCareService.submitMultipleInvoicePayments(claimInvoices).subscribe(() => {
      this.refresh();
      this.isLoading$.next(false);
    });
  }

  openDeleteConfirmationDialog(claimInvoice: ClaimInvoice) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Delete Claim Invoice?',
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateOrDeleteClaimInvoice(claimInvoice);
      }
    });
  }

  updateOrDeleteClaimInvoice(item: ClaimInvoice) {
    this.isLoading$.next(true);
    const isDeleted = item.claimInvoiceStatusId == +ClaimInvoiceStatusEnum.Deleted;

    if (!isDeleted) {
      item.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Deleted;

      if (item.claimInvoiceType == ClaimInvoiceTypeEnum.OtherBenefitAwd) {
        this.claimInvoiceService.updateClaimInvoiceV2(item).subscribe(result => {
          if (result) {
            this.refreshService.triggerRefresh();
            this.getData();
            this.isLoading$.next(false);
          }
        });
      } else {
        this.claimInvoiceService.updateClaimInvoice(item).subscribe(result => {
          if (result) {
            this.deleteClaimInvoice(item);
          }
        });
      }
    }
  }

  deleteClaimInvoice(item: ClaimInvoice) {
    this.claimInvoiceService.deleteClaimInvoice(item.claimInvoiceId).subscribe(result => {
      if (result) {
        this.getData();
        this.isLoading$.next(false);
      }
    });
  }

  openReinstateConfirmationDialog(claimInvoice: ClaimInvoice) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Reinstate Claim Invoice?',
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reinstateClaimInvoice(claimInvoice);
      }
    });
  }

  reinstateClaimInvoice(claimInvoice: ClaimInvoice) {
    this.isLoading$.next(true);
    if (claimInvoice.claimInvoiceType == ClaimInvoiceTypeEnum.OtherBenefitAwd) {
      claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.ReInstated;
      this.claimInvoiceService.updateClaimInvoiceV2(claimInvoice).subscribe({
        next: result => {
          if (result) {
            this.refreshService.triggerRefresh();
            this.getData();
          }
          this.isLoading$.next(false);
        },
        error: err => {
          this.getData();
          this.isLoading$.next(false);
        }
      });
    } else {
      this.claimInvoiceService.reinstateClaimInvoice(claimInvoice.claimInvoiceId).subscribe(result => {
        if (result) {
          this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(claimInvoice.claimInvoiceId).subscribe(data => {
            if (data) {
              data.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Pending;
              this.claimInvoiceService.updateClaimInvoice(data).subscribe(output => {
                if (output) {
                  this.getData();
                  this.isLoading$.next(false);
                }
              });
            }
          });
        }
      });
    }
  }

  rejectTTD(claimInvoiceId: number) {
    this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(claimInvoiceId).subscribe(data => {
      if (data) {
        data.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Rejected;
        this.claimInvoiceService.updateClaimInvoice(data).subscribe(output => {
          if (output) {
            this.claimInvoiceService.daysOffInvoiceRejectCommunication(this.personEvent.personEventId, claimInvoiceId).subscribe(result => {
            });
            this.getData();
          }
        });
      }
    });
  }

  excludeRow(claimInvoiceStaus: any) {
    if (claimInvoiceStaus === +ClaimInvoiceStatusEnum.Rejected) {
      return true;
    }
    else {
      return false;
    }
  }

  sendCommunication(personEventId: number) {
    this.claimInvoiceService.sendPdPaidCloseletter(personEventId).subscribe(result => {
      if (result) {
      }
    })
  }

  canReInstate($event: ClaimInvoice): boolean {
    const status = this.claim.claimLiabilityStatus;
    const isStatusAllowed =
      status != ClaimLiabilityStatusEnum.LiabilityNotAccepted &&
      status != ClaimLiabilityStatusEnum.Repudiated &&
      status != ClaimLiabilityStatusEnum.UnderInvestigation;

    const isInvoiceDeleted = $event.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.Deleted;

    return isStatusAllowed && isInvoiceDeleted;
  }


  openBeneficiaryBankingDialog() {
    const dialogRef = this.dialog.open(BeneficiaryBankAccountDialogComponent, {
      width: '70%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        personEvent: this.personEvent
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openPayMultipleInvoiceConfirmationDialog(result.payeeRolePlayer, result.payeeRolePlayerBankingDetail);
      }
    })
  }

  hideActionsBasedOnStatus(claimInvoiceStatusId: number): boolean {
    return [+ClaimInvoiceStatusEnum.Paid, +ClaimInvoiceStatusEnum.PendingAuthorization].includes(claimInvoiceStatusId);
  }

  isRejectedOrReversed(claimInvoiceStatusId: number): boolean {
    return [+ClaimInvoiceStatusEnum.Rejected, +ClaimInvoiceStatusEnum.PaymentRejected, +ClaimInvoiceStatusEnum.PaymentReversed].includes(claimInvoiceStatusId);
  }

  isDuplicateInvoicePresent(invoice: ClaimInvoice) {
    const matchingInvoice = this.dataSource.data.data.find((inv: ClaimInvoice) => {
      return (invoice.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.PaymentRejected || invoice.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.PaymentReversed) &&
        inv.claimInvoiceStatusId !== +ClaimInvoiceStatusEnum.Deleted &&
        inv.claimInvoiceStatusId !== invoice.claimInvoiceStatusId &&
        inv.payeeRolePlayerId === invoice.payeeRolePlayerId &&
        inv.payee === invoice.payee &&
        inv.claimInvoiceType === invoice.claimInvoiceType &&
        inv.invoiceAmount === invoice.invoiceAmount &&
        new Date(inv.daysOffFrom).getTime() === new Date(invoice.daysOffFrom).getTime() &&
        new Date(inv.daysOffTo).getTime() === new Date(invoice.daysOffTo).getTime() &&
        inv.claimId === invoice.claimId &&
        inv.claimBenefitId === invoice.claimBenefitId
    });
    return matchingInvoice ? true : false;
  }
}
