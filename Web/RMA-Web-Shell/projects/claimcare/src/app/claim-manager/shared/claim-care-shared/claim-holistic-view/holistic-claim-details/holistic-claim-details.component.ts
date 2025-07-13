import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { BehaviorSubject } from 'rxjs';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { Claim } from '../../../entities/funeral/claim.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CloseAccidentClaimComponent } from '../../../../Views/close-accident-claim/close-accident-claim.component';
import { ClaimAccidentCloseLetterTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-accident-close.lettertype.enum';
import { RemittanceReportDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/remittance-report-dialog/remittance-report-dialog.component';

@Component({
  selector: 'holistic-claim-details',
  templateUrl: './holistic-claim-details.component.html',
  styleUrls: ['./holistic-claim-details.component.css']
})
export class HolisticClaimDetailsComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() showPDColumns = true;
  @Input() triggerRefresh: boolean;

  @Output() claimSelectedEmit: EventEmitter<Claim> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading claim details...please wait');

  selectedClaim: Claim;
  users: User[];

  requiredAddPermission = 'View Claim Details';
  ccaPermission = 'Cca Pool';
  caPermission = 'Claims Assessor Pool';
  scaPermission = 'Sca Pool';
  cmcPermission = 'Cmc Pool';
  viewAuditPermission = 'View Audits';

  dataSource = new MatTableDataSource<Claim>();

  submitted = ClaimStatusEnum.Submitted;
  pending = ClaimStatusEnum.PendingAcknowledgement | ClaimStatusEnum.PendingInvestigations | ClaimStatusEnum.PendingRequirements;
  waived = ClaimStatusEnum.Waived;
  closed = ClaimStatusEnum.Closed;
  open = ClaimStatusEnum.Open;
  autoAcknowledged = ClaimStatusEnum.AutoAcknowledged;
  manuallyAcknowledged = ClaimStatusEnum.ManuallyAcknowledged;

  currentUser: User;

  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private readonly claimService: ClaimCareService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly userReminderService: UserReminderService,
    private readonly dialog: MatDialog,
    private readonly alertService: ToastrManager) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.personEvent) {
      this.getClaims();
    }
  }

  getClaims() {
    this.isLoading$.next(true);
    this.claimService.getPersonEventClaims(this.personEvent.personEventId).pipe(takeUntil(this.unSubscribe$)).subscribe(result => {
      this.personEvent.claims = result;
      this.dataSource = new MatTableDataSource(this.personEvent.claims);
      this.isLoading$.next(false);
    });
  }

  getClaimStatus(id: number) {
    if (id <= 0) { return };
    const statusName = this.formatText(ClaimStatusEnum[id]);
    return statusName === 'Finalized' ? 'Closed' : statusName;
  }

  getLiabilityStatus(id: number) {
    return this.formatText(ClaimLiabilityStatusEnum[id]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  sendClaimClose($event: Claim) {
    this.createCaUserReminders($event);
  }

  createUserReminders(userReminders: UserReminder[]) {
    this.isLoading$.next(true);
    this.loadingMessages$.next('sending reminder notifications claim....please wait');

    this.userReminderService.createUserReminders(userReminders).subscribe(result => {
      this.isLoading$.next(false);
    });
  }

  createCaUserReminders(claim: Claim) {
    const userReminders: UserReminder[] = [];
    if (claim.assignedToUserId && claim.assignedToUserId > 0) {
      const userReminder = new UserReminder();

      userReminder.userReminderType = UserReminderTypeEnum.Reminder;
      userReminder.assignedByUserId = this.currentUser.id;
      userReminder.text = `${this.currentUser.displayName} requested claim number: ${claim.claimReferenceNumber} to be closed`;
      userReminder.assignedToUserId = claim.assignedToUserId;
      userReminder.alertDateTime = new Date().getCorrectUCTDate();
      userReminders.push(userReminder);
    } else {
      this.isLoading$.next(true);
      this.loadingMessages$.next('loading claim details...please wait');
      this.userService.getUsersByPermission(this.caPermission).subscribe(result => {
        if (result) {
          result.forEach(user => {
            const userReminder = new UserReminder();
            userReminder.userReminderType = UserReminderTypeEnum.Reminder;
            userReminder.assignedByUserId = this.currentUser.id;
            userReminder.text = `${this.currentUser.displayName} requested claim number: ${claim.claimReferenceNumber} to be closed`;
            userReminder.assignedToUserId = user.id;
            userReminder.alertDateTime = new Date().getCorrectUCTDate();
            userReminders.push(userReminder);
          });
          this.isLoading$.next(false);
        }
      });
    }

    if (userReminders.length > 0) {
      this.createUserReminders(userReminders);
    }
  }

  getDisplayedColumns(): any[] {

    let columnDefinitions = [
      { def: 'claimRefNumber', show: true },
      { def: 'claimStatus', show: true },
      { def: 'liabilityStatus', show: true },
      { def: 'pd', show: this.showPDColumns },
      { def: 'pdVerified', show: this.showPDColumns },
      { def: 'actions', show: !this.isReadOnly },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  setSelectedClaim($event: Claim) {
    this.selectedClaim = $event;
    this.claimSelectedEmit.emit(this.selectedClaim);
  }

  closeClaim(claim: Claim) {
    this.personEvent.personEventStatus = this.personEvent.claims.some(s => s.claimStatus != ClaimStatusEnum.Closed) ? this.personEvent.personEventStatus : PersonEventStatusEnum.Closed;
    const index = this.personEvent.claims.findIndex(s => s.claimId == claim.claimId);
    if (index > -1) {
      this.personEvent.claims[index].claimStatus = ClaimStatusEnum.Closed;
      this.personEvent.claims[index].claimStatusId = +ClaimStatusEnum.Closed;
    }

    this.updatePersonEvent();
  }

  openClaim(claim: Claim) {
    this.isLoading$.next(true);
    this.personEvent.personEventStatus = this.personEvent.personEventStatus == PersonEventStatusEnum.Closed ? PersonEventStatusEnum.Open : this.personEvent.personEventStatus;
    const index = this.personEvent.claims.findIndex(s => s.claimId == claim.claimId);
    if (index > -1) {
      this.personEvent.claims[index].claimStatus = ClaimStatusEnum.Open;
      this.personEvent.claims[index].claimStatusId = +ClaimStatusEnum.Open;
      this.personEvent.claims[index].claimLiabilityStatus = ClaimLiabilityStatusEnum.Pending;
    }

    this.updatePersonEvent();
  }

  updatePersonEvent() {
    this.claimService.updatePersonEvent(this.personEvent).subscribe(result => {
      this.alertService.successToastr('claim updated successfully...');
      this.isLoading$.next(false);
    });
  }

  isClaimStatusClosed(claim: Claim): boolean {
    return claim.claimStatus == ClaimStatusEnum.Closed;
  }

  isUserExternalHealthCareProvider(): boolean {
    return (!this.currentUser.isInternalUser && +this.currentUser.roleId === +RoleEnum.HealthCareProvider);
  }

  openAuditDialog($event: Claim) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '1024px',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.Claim,
        itemId: $event.claimId,
        heading: `Claim(${$event.claimReferenceNumber}) Audit`,
        propertiesToDisplay: ['ClaimReferenceNumber', 'ClaimStatus', 'ClaimLiabilityStatus', 'ClaimStatusChangeDate',
          'IsCancelled', 'ClaimCancellationReason', 'IsClosed', 'ClaimClosedReason', 'AssignedToUserId', 'IsRuleOverridden',
          'DisabilityPercentage', 'UnderwriterId', 'InvestigationRequired', 'PdVerified', 'Caa', 'FamilyAllowance']
      }
    });
  }

  openOptionsDialog(claim: Claim) {
    const dialogRef = this.dialog.open(CloseAccidentClaimComponent, {
      width: '40%',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.value in ClaimAccidentCloseLetterTypeEnum) {
        this.isLoading$.next(true);
        this.personEvent.claimAccidentCloseLetterTypeEnum = result.value;
        this.claimService.closeAccidentClaim(this.personEvent).subscribe({
          next: (r) => {
            if (r) {
              this.closeClaim(claim);
            } else {
              this.alertService.errorToastr('Failed sending close letter');
              this.isLoading$.next(false);
            }
          },
          error: (err) => {
            this.alertService.errorToastr('Error sending close letter:', err);
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  openRemittanceViewDialog($event: Claim) {
    const dialogRef = this.dialog.open(RemittanceReportDialogComponent, {
      width: '80%',
      disableClose: true,
      data: {
        title: `Remittance Report: ${$event.claimReferenceNumber}`,
        report: { key: 'Remittance', value: 'RMA.Reports.FinCare/Remittance/RMARemittanceMemberV2Report' },
        parameters: [
          { key: 'ClaimId', value: $event.claimId.toString() },
        ]
      }
    });
  }
}
