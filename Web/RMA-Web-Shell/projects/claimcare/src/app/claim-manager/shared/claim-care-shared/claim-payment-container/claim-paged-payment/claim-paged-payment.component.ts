import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimPagedPaymentDataSource } from './claim-paged-payment.datasource';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { CaptureNotesDialogComponent } from '../../claim-invoice-container/capture-notes-dialog/capture-notes-dialog.component';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { claimReferralLegal } from '../../../entities/claim-referral-legal';
import { Claim } from '../../../entities/funeral/claim.model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { PaymentService } from 'projects/fincare/src/app/payment-manager/services/payment.service';
import { PaymentReversalNotesComponent } from 'projects/shared-components-lib/src/lib/payment-reversal-notes/payment-reversal-notes.component';
import { Payment } from 'projects/fincare/src/app/shared/models/payment.model';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { ClaimReferralTypeLimitGroupEnum } from '../../claim-referral/claim-referral-type-limit-group-enum';
import { ReferralTypeLimitConfiguration } from '../../claim-referral/referral-type-limit-configuration';
import { ClaimAccidentCloseLetterTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-accident-close.lettertype.enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';

@Component({
  selector: 'claim-paged-payment',
  templateUrl: './claim-paged-payment.component.html',
  styleUrls: ['./claim-paged-payment.component.css']
})
export class ClaimPagedPaymentComponent extends PermissionHelper implements OnChanges {

  @Input() personEvent: PersonEventModel;  // required
  @Input() invoiceType: ClaimInvoiceTypeEnum;
  @Input() invoiceStatus: ClaimInvoiceStatusEnum;

  @Output() refreshLoading = new EventEmitter<boolean>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim payments...please wait');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: ClaimPagedPaymentDataSource;

  menus: { title: string; url: string; disable: boolean }[];
  params = new PagedParams();
  slaItemType = SLAItemTypeEnum.Claim;
  currentQuery = '';
  user: User;
  UserReminders: UserReminder[] = [];
  referralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];
  filteredReferralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];

  constructor(
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly claimCareService: ClaimCareService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    public userService: UserService,
    public dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly userReminderService: UserReminderService,
    private readonly paymentService: PaymentService,
    private readonly commonNotesService: CommonNotesService,
  ) {
    super();
    this.getAuthorizationLimitsByReferralType();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedPaymentDataSource(this.claimInvoiceService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.dataSource.personEventId = this.personEvent.personEventId;

    this.getData();
    this.getUser();
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery)
  }

  setParams() {
    this.dataSource.invoiceType = this.invoiceType;
    this.dataSource.invoiceStatus = this.invoiceStatus;
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'claimId';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.invoiceStatus ? this.invoiceStatus.toString() : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: true },
      { def: 'claimInvoiceType', show: true },
      { def: 'claimInvoiceStatus', show: true },
      { def: 'invoiceDate', show: true },
      { def: 'payee', show: true },
      { def: 'invoiceAmount', show: true },
      { def: 'sla', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu(item: ClaimInvoice) {
    this.menus = [];
    this.menus = [
      {
        title: 'Refer Payment', url: '', disable: item.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.Referred
          || item.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.RequestedForApproval
      },
      { title: 'Recall Payment', url: '', disable: this.disableRecall(item.claimInvoiceStatusId) },
      { title: 'Reverse Payment', url: '', disable: this.disableReverse(item.claimInvoiceStatusId) },
      { title: 'Reject Payment', url: '', disable: this.showApproval(item) },
      { title: 'Reject TTD', url: '', disable: item.claimInvoiceType !== +ClaimInvoiceTypeEnum.DaysOffInvoice },
      { title: 'Refer To Legal', url: '', disable: item.claimInvoiceTypeId !== +ClaimInvoiceStatusEnum.Referred },
      { title: 'Approve', url: '', disable: this.disableApproveAction(item) }
    ];
  }

  getClaimInvoiceType(id: number) {
    return this.formatText(ClaimInvoiceTypeEnum[id]);
  }

  getClaimInvoiceStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimInvoiceStatusEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  recallInvoicePayment(claimInvoice: ClaimInvoice) {
    this.confirmservice.confirmWithoutContainer(
      'Confirm Recall?',
      'Are you sure you want to recall this payment?',
      'Center',
      'Center',
      'Yes',
      'No'
    ).subscribe(confirmResult => {
      if (confirmResult) {
        const dialogRef = this.dialog.open(CaptureNotesDialogComponent, {
          width: '50%',
          maxHeight: '700px',
          disableClose: false,
          data: {
            personEvent: this.personEvent,
            noteType: 'Payment Recall',
            claimInvoice: claimInvoice
          }
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
          if (dialogResult && dialogResult.noteText) {
            this.isLoading$.next(true);
            this.loadingMessages$.next('processing payment recall...please wait');

            this.addNote(dialogResult.noteText);

            this.claimCareService.recallInvoicePayment(claimInvoice).subscribe({
              next: result => {
                if (result) {
                  this.getData();
                  this.alertService.success('Payment recall sent successfully');
                } else {
                  this.alertService.error('Failed to recall payment');
                }
              },
              error: err => {
                this.alertService.error('An error occurred during recall');
              },
              complete: () => {
                this.isLoading$.next(false);
              }
            });
          }
        });
      }
    });
  }

  reverseInvoicePayment(claimInvoice: ClaimInvoice, PersonEventId: number) {
    this.isLoading$.next(true);
    this.loadingMessages$.next('retrieving allocated claim invoice...please wait');
    this.paymentService.GetAllocationsByClaimInvoiceId(claimInvoice.claimInvoiceId).subscribe(allocation => {
      if (allocation?.payment) {
        this.confirmservice.confirmWithoutContainer('Confirm Payment Reversal?', 'Are you sure you want to reverse this payment?',
          'Center', 'Center', 'Yes', 'No').subscribe(result => {
            if (result) {
              const dialogRef = this.dialog.open(PaymentReversalNotesComponent, {
                width: '1024px',
                data: {
                  payment: allocation.payment,
                  personEventId: PersonEventId
                }
              });

              dialogRef.afterClosed().subscribe(note => {
                if (note) {
                  this.processPaymentReversal(claimInvoice, allocation.payment);
                } else {
                  this.isLoading$.next(false);
                }
              });
            } else {
              this.isLoading$.next(false);
            }
          });
      } else {
        this.alertService.error('Failed to retrieve the allocated claim invoice. Please try again.');
        this.isLoading$.next(false);
      }
    });
  }

  processPaymentReversal(claimInvoice: ClaimInvoice, payment: Payment) {
    this.isLoading$.next(true);
    this.loadingMessages$.next('reversing payment...please wait');
    this.paymentService.reversePayment(payment).subscribe(result => {
      if (result) {
        claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.PaymentReversed;
        this.claimInvoiceService.updateClaimInvoice(claimInvoice).subscribe(result => {
          if (result) {
            this.alertService.success('Payment reversed successfully.');
            this.getData();
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  onMenuSelect(item: ClaimInvoice, menu: any) {
    switch (menu.title) {
      case 'Refer Payment':
        break;
      case 'Recall Payment':
        this.recallInvoicePayment(item);
        break;
      case 'Reverse Payment':
        this.reverseInvoicePayment(item, this.personEvent.personEventId);
        break;
      case 'Reject TTD':
        this.captureNotes(item, 'reject');
        break;
      case 'Refer To Legal':
        this.referToLegal(item);
        break;
      case 'Approve':
        this.approveInvoicePayment(item);
        break;
      case 'Reject Payment':
        this.captureNotes(item, 'reject');
        break;
    }
  }

  captureNotes(item: ClaimInvoice, noteType: any) {
    if (item.claimInvoiceType === ClaimInvoiceTypeEnum.DaysOffInvoice
      || item.claimInvoiceType === ClaimInvoiceTypeEnum.WidowLumpSumAward
      || item.claimInvoiceType === ClaimInvoiceTypeEnum.FuneralExpenses) {
      const dialogRef = this.dialog.open(CaptureNotesDialogComponent, {
        width: '50%',
        maxHeight: '700px',
        disableClose: false,
        data: {
          personEvent: this.personEvent,
          noteType: noteType,
          claimInvoice: item
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.isLoading$.next(true);
        if (result) {
          this.addNote(result.noteText);

          if (result.noteType === 'reject') {
            this.rejectTTD(result.claimInvoice.claimInvoiceId);
            this.alertService.success('Invoice rejected successfully.');
            this.sendUserReminderNotification(item, 'Payment rejected for invoice');
          }
        }
        this.isLoading$.next(false);
      });
    }
  }

  rejectTTD(claimInvoiceId: number) {
    this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(claimInvoiceId).subscribe(result => {
      if (result) {
        result.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Rejected;
        this.claimInvoiceService.updateClaimInvoice(result).subscribe(result => {
          if (result) {
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

  disableRecall(claimInvoiceStaus: any) {
    if (claimInvoiceStaus === +ClaimInvoiceStatusEnum.PaymentRequested && claimInvoiceStaus !== +ClaimInvoiceStatusEnum.RequestedForApproval) {
      return false;
    }
    else {
      return true;
    }
  }

  disableReverse(claimInvoiceStaus: any) {
    return claimInvoiceStaus !== +ClaimInvoiceStatusEnum.Paid;
  }

  submitClaimInvoicePayment(item: ClaimInvoice) {
    this.claimCareService.submitInvoicePayment(item).subscribe(result => {
      if (result) {
        this.alertService.success("Payment has been approved and sent to FinCare for processing.");
        this.sendUserReminderNotification(item, 'Payment has been approved for this invoice.');
        this.autoCloseClaim(item); // auto close claim and send PD close letter when payment is approved.
      }
      this.isLoading$.next(false);
    });
  }

  AddCheckedItems($event: any) {
    if ($event > -1) {

    }
  };

  refresh() {
    this.getData();
  }

  referToLegal(item: ClaimInvoice) {
    let entity = this.personEvent.claims[0];
    if (item?.claimInvoiceStatusId == ClaimInvoiceStatusEnum.Paid
      && this.personEvent.personEventAccidentDetail.isRoadAccident) {
      this.sendClaimtoLegalcare(entity);
    }
    else {
      this.alertService.error('Claim should be MVA and Invoice should be on Paid status', 'Not Successful', true);
    }

  }

  sendClaimtoLegalcare(claim: Claim) {
    var referralDetail = new claimReferralLegal();
    referralDetail.claimId = claim.claimId;
    this.claimCareService.addLegalcareRecoveryDetails(referralDetail).subscribe(results => {
      if (results) {
        claim.claimStatusId = ClaimStatusEnum.LegalRecovery;
        this.claimCareService.updateClaim(claim).subscribe((result) => {
          if (result) {
            this.isLoading$.next(false);
            this.refresh();
          }
        });
      }
    });
  }

  getUser() {
    this.user = this.authService.getCurrentUser();
  }

  approveInvoicePayment(item: ClaimInvoice) {
    this.isLoading$.next(true);
    item.claimInvoiceStatusId = +ClaimInvoiceStatusEnum.PaymentRequested;

    this.claimInvoiceService.updateClaimInvoice(item).subscribe(result => {
      if (result) {
        this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(item.claimInvoiceId).subscribe(result => {
          if (result) {
            this.submitClaimInvoicePayment(item);
            this.updateClaimEstimates(result);
            this.getData();
          }
        });
      }
    });
  }

  sendUserReminderNotification(item: ClaimInvoice, message: string) {
    this.userService.getUserDetails(item.modifiedBy).subscribe(result => {
      if (result && result.id > 0) {
        let entity = this.personEvent.claims[0];
        const userReminder = new UserReminder();
        userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
        userReminder.text = `${message} - ${this.getClaimInvoiceType(item.claimInvoiceType)} - ${entity.claimReferenceNumber} - Amount: ${item.invoiceAmount}`;
        userReminder.assignedByUserId = this.user.id;
        userReminder.assignedToUserId = result.id;
        userReminder.alertDateTime = new Date().getCorrectUCTDate();

        this.UserReminders.push(userReminder);

        this.userReminderService.createUserReminders(this.UserReminders).subscribe(result => {
        });
      }
    });
  }

  showApproval(row: ClaimInvoice) {
    if (row.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.RequestedForApproval
      && row.createdBy !== this.user.email.toLowerCase()) {
      return false;
    }
    else {
      return true;
    }
  }

  disableApproveAction(row: ClaimInvoice) {
    if (row.claimInvoiceStatusId === +ClaimInvoiceStatusEnum.RequestedForApproval
      && row.createdBy !== this.user.email.toLowerCase()
      && this.userHasAuthorityLimit(row)) {
      return false;
    }
    else {
      return true;
    }
  }

  updateClaimEstimates(claimInvoice: ClaimInvoice) {
    switch (claimInvoice.claimInvoiceType) {
      case +ClaimInvoiceTypeEnum.FuneralExpenses:
        this.updateAllocatedAmount(EstimateTypeEnum.Funeral, claimInvoice);
        break;
      case +ClaimInvoiceTypeEnum.SundryInvoice:
        this.updateAllocatedAmount(EstimateTypeEnum.Sundry, claimInvoice);
        break;
      case +ClaimInvoiceTypeEnum.WidowLumpSumAward:
        this.updateAllocatedAmount(EstimateTypeEnum.WidowsLumpSum, claimInvoice);
        break;
      case +ClaimInvoiceTypeEnum.TravelAward:
        this.updateAllocatedAmount(EstimateTypeEnum.TravelExpenses, claimInvoice);
        break;
      case +ClaimInvoiceTypeEnum.DaysOffInvoice:
        this.updateAllocatedAmount(EstimateTypeEnum.DaysOff, claimInvoice);
        break;
    }
  }

  updateAllocatedAmount(estimateTypeEnum: EstimateTypeEnum, claimInvoice: ClaimInvoice) {
    this.claimInvoiceService.getClaimEstimateByPersonEventAndEstimateType(estimateTypeEnum, this.personEvent.personEventId).subscribe(result => {
      if (result?.length > 0) {
        result[0].allocatedValue += claimInvoice.invoiceAmount;
        result[0].outstandingValue = result[0].estimatedValue - result[0].allocatedValue;
        result[0].authorisedValue += claimInvoice.invoiceAmount;

        this.claimInvoiceService.updateClaimEstimate(result[0]).subscribe();
      }
    })
  }

  showReject(row: ClaimInvoice) {
    if (row.claimInvoiceStatusId !== +ClaimInvoiceStatusEnum.Referred
      && row.claimInvoiceStatusId !== +ClaimInvoiceStatusEnum.RequestedForApproval
      && row.createdBy !== this.user.email.toLowerCase()) {
      return false;
    }
    else {
      return true;
    }
  }

  setSLAType(invoiceTypeInput: number) {
    switch (invoiceTypeInput) {
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
    }
    return this.slaItemType;
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  addNote(message: string) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.personEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = NoteTypeEnum.SystemAdded;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => { });
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
          return config.amountLimit >= item.invoiceAmount
            && extractedDays >= item.totalDaysOff;
        });
      case ClaimInvoiceTypeEnum.PDAward:
      case ClaimInvoiceTypeEnum.WidowLumpSumAward:
      case ClaimInvoiceTypeEnum.SympathyAward:
      case ClaimInvoiceTypeEnum.PartialDependencyLumpsum:

        return this.filteredReferralTypeLimitConfiguration
          .some(config => config.referralTypeLimitGroupId === ClaimReferralTypeLimitGroupEnum.LumpSum &&
            config.amountLimit >= item.invoiceAmount);

      default:
        return this.filteredReferralTypeLimitConfiguration.some(a => a.amountLimit >= item.invoiceAmount);
    }
  }

  extractDays(input: string): number {
    const match = input.match(/(\d+)Days/);
    return match ? parseInt(match[1], 10) : 0;
  }

  autoCloseClaim(claimInvoice: ClaimInvoice) {
    this.personEvent.claimAccidentCloseLetterTypeEnum = ClaimAccidentCloseLetterTypeEnum.PdPaidCloseLetter;
    this.claimCareService.closeAccidentClaim(this.personEvent).subscribe({
      next: (result) => {
        if (result) {
          this.personEvent.personEventStatus = PersonEventStatusEnum.Closed;
          const index = this.personEvent.claims.findIndex(s => s.claimId == claimInvoice.claimId);
          if (index > -1) {
            this.personEvent.claims[index].claimStatus = ClaimStatusEnum.Closed;
            this.personEvent.claims[index].claimStatusId = +ClaimStatusEnum.Closed;
          }
          this.claimCareService.updatePersonEvent(this.personEvent).subscribe(result => {
            this.isLoading$.next(false);
          });
        } else {
          this.alertService.error('Failed sending PD paid close letter.');
          this.isLoading$.next(false);
        }
      },
      error: (error) => {
        this.alertService.error(`Error sending PD paid close letter - Primary contact for communication failed or unavailable: ${error.message}`);
        this.isLoading$.next(false);
      }
    });
  }
}
