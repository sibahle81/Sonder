import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { BehaviorSubject } from 'rxjs';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
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
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { Router } from '@angular/router';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { TemplateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/template-type-enum';
import { ClaimPagedTravelAuthorisationDataSource } from './claim-paged-travel-authorisation.datasource';

@Component({
  selector: 'claim-paged-travel-authorisation',
  templateUrl: './claim-paged-travel-authorisation.component.html',
  styleUrls: ['./claim-paged-travel-authorisation.component.css']
})
export class ClaimPagedTravelAuthorisationComponent extends PermissionHelper implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() query: ClaimInvoiceTypeEnum;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: ClaimPagedTravelAuthorisationDataSource;

  menus: { title: string; url: string; disable: boolean }[];
  referralTypeLimitConfiguration: ReferralTypeLimitConfiguration[];

  user: User;
  claim: Claim;
  params = new PagedParams();
  slaItemType: SLAItemTypeEnum;
  count = 0;
  showPayMultiple = false;
  selectedInvoiceIds: number[] = [];
  UserReminders: UserReminder[] = [];
  claimManager: User[] = [];
  claimInvoice: ClaimInvoice;

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private readonly claimCareService: ClaimCareService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly userReminderService: UserReminderService,
    private readonly authService: AuthService,
    private readonly confirmService: ConfirmationDialogsService,
    private router: Router
  ) {
    super();
    this.user = this.authService.getCurrentUser();
    this.lookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedTravelAuthorisationDataSource(this.claimInvoiceService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.dataSource.personEventId = this.personEvent.personEventId;

    this.getData();
  }

  lookups() {
    this.getAuthorizationLimitsByReferralType();
    // this.contactDetails();
  }

  getData() {
    this.setParams();

    if (this.params.currentQuery == ClaimInvoiceTypeEnum[ClaimInvoiceTypeEnum.WidowLumpSumAward]) {
      this.params.currentQuery = 'WLSAward';
    }
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery)
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

  getClaimDetails(item: ClaimInvoice, type: string) {
    this.claimCareService.GetClaim(item.claimId).subscribe(claim => {
      this.claim = claim ? claim : null;
      let permissions = this.referralTypeLimitConfiguration.filter(p => p.amountLimit >= item.invoiceAmount).map(a => a.permissionName)

      this.openReferralDialog(permissions);
    })
  }

  getAuthorizationLimitsByReferralType() {
    this.claimCareService.getAuthorizationLimitsByReferralTypeLimitGroup(ClaimReferralTypeLimitGroupEnum.Payment).subscribe(result => {
      this.referralTypeLimitConfiguration = result ? result : [];
    })
  }

  hasAuthorityLimit(item: ClaimInvoice): boolean {
    let validPermissions = this.referralTypeLimitConfiguration.filter(a => a.amountLimit >= item.invoiceAmount).map(m => m.permissionName);
    return this.doesCurrentUserHavePayPermission(validPermissions);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'claimId';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.query ? this.query.toString() : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: true },
      { def: 'dateAuthorisedFrom', show: true },
      { def: 'dateAuthorisedTo', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  onMenuSelect(item: ClaimInvoice, menu: any) {
    this.isLoading$.next(true);
    switch (menu) {
      case 'pay':
        this.hasAuthorityLimit(item) ? this.payInvoice(item) : this.getClaimDetails(item, 'refer');
        break;
      case 'view':
        break;
    }
  }

  AddCheckedItems($event: any, item) {
    if ($event.checked === true) {
      this.selectedInvoiceIds.push(item.claimInvoiceId);
    }
    else if ($event.checked === false) {
      const index: number = this.selectedInvoiceIds.indexOf(item.claimInvoiceId);
      if (index !== -1) {
        this.selectedInvoiceIds.splice(index, 1);
      }
    }
  };

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

  doesCurrentUserHavePayPermission(validPermissions: string[]): boolean {
    let item = validPermissions.some(a => this.userHasPermission(a));
    console.log(this.count++);
    return item;
  }

  payInvoice(item: ClaimInvoice) {
    //TODO open dialog to confirm payment
  }

  showDetail($event: any, actionType: any) {
    // const dialogRef = this.dialog.open(ClaimInvoiceDialogComponent, {
    //   width: '80%',
    //   maxHeight: '700px',
    //   disableClose: true,
    //   data: {
    //     invoiceType: this.query,
    //     claimInvoice: $event,
    //     personEvent: this.personEvent,
    //     invoiceAction: actionType
    //   }
    // });
  }

  onNotificationSend($event: any) {
    this.confirmService.confirmWithoutContainer('Approve transaction', 'generate workflow to Claim Manager to approve transaction', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
        if (result) {
          this.sendReminerToCM();
        }
      })
  }

  createUserReminders(userId: number) {
    this.isLoading$.next(true);
    var claim = this.personEvent.claims[0];
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.text = `Please approve payment transaction for this claim number: ${claim.claimReferenceNumber}`;
    userReminder.assignedByUserId = this.authService.getCurrentUser().id;
    userReminder.assignedToUserId = userId;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();

    this.UserReminders.push(userReminder);

    this.userReminderService.createUserReminders(this.UserReminders).subscribe(result => {
      if (result) {
        this.isLoading$.next(false);
      }
    });
  }

  sendReminerToCM(): void {
    this.userService.getUsersByRoleName('Claims Manager').subscribe(
      data => {
        if (data) {
          this.claimManager = data;
          data.forEach(claimmanagerId => {
            this.createUserReminders(claimmanagerId.id)
          });
        }
      }
    );
  }
  refresh() {
    this.getData();
  }

  payMultiple() {
    if (this.selectedInvoiceIds.length > 0) {
      this.payMultipleDialog();
    }
  }

  payMultipleDialog() {
    this.confirmService.confirmWithoutContainer('Pay ', 'Do you want to pay multiple ?', 'Center', 'Center', 'Yes', 'No').subscribe(
      result => {
        if (result) {
          this.isLoading$.next(true);
          for (let i = 0; i < this.selectedInvoiceIds.length; i++) {
            this.claimInvoiceService.getClaimInvoiceByClaimInvoiceId(this.selectedInvoiceIds[i]).subscribe(results => {
              this.claimInvoice = results;
              this.payMultipleInvoices(this.claimInvoice);
            });
          }
          this.isLoading$.next(false);
        }
      });
  }

  payMultipleInvoices(item: ClaimInvoice) {
    this.claimInvoiceService.createInvoiceAllocation(item).subscribe(result => {
      if (result) {
      }
    })
  }

  delete(item: ClaimInvoice) {
    this.claimInvoiceService.deleteClaimInvoice(item.claimInvoiceId).subscribe(result => {
      if (result) {
        this.getData();
      }
    })
  }

  hideDelete(item: ClaimInvoice): boolean {
    if (!item || !item.claimInvoiceStatusId) { return false; };
    return item.claimInvoiceStatusId === (ClaimInvoiceStatusEnum.Allocated || ClaimInvoiceStatusEnum.PaymentRequested);
  }

}
