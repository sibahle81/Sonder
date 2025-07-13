import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimCareService } from '../../../Services/claimcare.service';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { PagedParams } from '../../../shared/entities/personEvent/paged-parameters';
import { EmployerWorkPoolDataSource } from './employer-work-pool.datasource';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { Constants } from 'projects/claimcare/src/app/constants';
import { EventTypeEnum } from '../../../shared/enums/event-type-enum';
import { Router } from '@angular/router';
import { ErrorTypeEnum } from '../../../shared/claim-care-shared/message-float/message-float-model/error-type-enum';
import { FloatMessage } from '../../../shared/claim-care-shared/message-float/message-float-model/float-message';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { ManagePoolUsersComponent } from '../../../shared/claim-care-shared/manage-pool-users/manage-pool-users.component';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { ClaimPool } from '../../../shared/entities/funeral/ClaimPool';
import { PersonEventSmsAuditComponent } from '../../person-event-sms-audit/person-event-sms-audit.component';
import { CoidWorkPoolMoreInforDialogComponent } from './coid-work-pool-more-infor-dialog/coid-work-pool-more-infor-dialog.component';
import { MonthlyscheduleWorkPoolUserComponent } from '../claim-workpool/monthly-schedule-work-pool-user/monthly-schedule-work-pool-user.component';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ConfirmDeleteComponent } from 'projects/shared-components-lib/src/lib/wizard/views/confirm-delete/confirm-delete.component';
import { ExitReasonDialogComponent } from '../../exit-reason-dialog/exit-reason-dialog.component';
import { MemberVopdStatus } from 'projects/clientcare/src/app/policy-manager/shared/entities/member-vopd-status';
import { ClientVopdResponse } from 'projects/clientcare/src/app/policy-manager/shared/entities/vopd-response';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { VopdManualVerificationDialogComponent } from 'projects/clientcare/src/app/shared/vopd/vopd-manual-verification-dialog/vopd-manual-verification-dialog.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ClaimAuditViewComponent } from '../../../views/claim-audit-view/claim-audit-view.component';
import { PoolWorkFlowItemTypeEnum } from '../../../shared/enums/pool-work-flow-item-type.enum';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';

@Component({
  selector: 'employer-work-pool',
  templateUrl: './employer-work-pool.component.html',
  styleUrls: ['./employer-work-pool.component.css']
})
export class EmployerWorkPoolComponent extends UnSubscribe implements OnChanges {

  allocatePermission = 'Work Pool Allocate User';
  reAllocatePermission = 'Work Pool Re-Allocate User';
  manageUsersPermission = 'Work Pool Manage User';
  searchPermission = 'search work pool'

  @Input() userLoggedIn: User;
  @Input() selectedWorkPool: WorkPoolEnum;
  @Input() currentQuery = String.Empty;
  @Input() selectedUserId = String.Empty;
  @Input() action: any;
  @Input() workPoolUsers: User[];

  subscription = new Subscription();

  canAllocate$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');
  allocateLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();
  @Output() searchUserBox = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: EmployerWorkPoolDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  heading = String.Empty;
  params = new PagedParams();
  selectedClaimsToAllocate: ClaimPool[] = [];

  slaItemType: SLAItemTypeEnum;
  canReAllocate = false;
  canAllocate = false;
  isCcaPool: boolean = false;
  floatMessage: FloatMessage;
  users: User[] = [];

  selectedClaimPool: ClaimPool;

  submitted = ClaimStatusEnum.Submitted;
  autoAcknowledged = ClaimStatusEnum.AutoAcknowledged;
  manuallyAcknowledged = ClaimStatusEnum.ManuallyAcknowledged;
  waived = ClaimStatusEnum.Waived;
  closed = ClaimStatusEnum.Closed;
  pending = ClaimLiabilityStatusEnum.Pending;
  deleted = ClaimStatusEnum.Deleted;

  clientVopdResponse: ClientVopdResponse;
  memberVopdStatus: MemberVopdStatus;
  isLoadingVopd$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasEditVopdPermission = false;

  cadPool = WorkPoolEnum.CadPool;
  cmcPool = WorkPoolEnum.CmcPool;

  constructor(
    private readonly claimCareService: ClaimCareService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly poolService: PoolWorkFlowService,
    private readonly wizardService: WizardService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setUser();
    this.hasEditVopdPermission = userUtility.hasPermission('Override Verification Of Personal Details');
    this.resetPaginatorOnSortChage();
    this.checkCcaPool();
    this.setSearch(this.action)
    this.getData();
    this.checkIfDataIsLoaded();

    this.dataSource.hasClaimPool.subscribe(result => {
      if (result) {
        this.autoSelect();
      }
    })
  }

  getData() {
    this.selectedClaimPool = null;
    this.dataSource.loggedInUserId = this.userLoggedIn.id;
    this.dataSource.selectedWorkPool = this.selectedWorkPool;
    this.dataSource.selectedUserId = this.selectedUserId;
    this.setPoolName();
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
  }

  resetPaginatorOnSortChage() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new EmployerWorkPoolDataSource(this.claimCareService);
    this.dataSource.rowCount$.subscribe((count) => this.paginator.length = count);
    this.paginator.pageIndex = 0;
  }

  setUser() {
    if (this.users.length === 0) {
      this.users.push(this.userLoggedIn);
    }
  }

  setSearch(isIndividualBox: boolean) {
    this.dataSource.isUserBox = isIndividualBox ? isIndividualBox : false;
  }

  autoSelect() {
    if (!this.selectedClaimPool) {
      const claimPoolData = this.dataSource?.data?.data;
      this.selectedClaimPool = claimPoolData ? claimPoolData[0] : null;
    }
  }

  setSLAType(row: ClaimPool): SLAItemTypeEnum {
    switch (this.selectedWorkPool) {
      case WorkPoolEnum.CadPool:
        return SLAItemTypeEnum.CadPool;
      case WorkPoolEnum.CcaPool:
        return SLAItemTypeEnum.WorkPoolEstimateVerification;
      case WorkPoolEnum.ScaPool:
        if (row.underwriterId == +UnderwriterEnum.RMAMutualAssurance && !row.pdPercentage) {
          return SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID;
        } else if (row.underwriterId == +UnderwriterEnum.RMALifeAssurance && !row.pdPercentage) {
          return SLAItemTypeEnum.WorkPoolLiabilityDecisionNonCOID;
        } else if (row.pdPercentage && row.pdPercentage > 0) {
          return (row.liabilityStatus == ClaimLiabilityStatusEnum.Pending)
            ? SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID
            : SLAItemTypeEnum.WorkPoolNonZeroPD;
        } else if (row.pdPercentage && row.pdPercentage <= 0) {
          return SLAItemTypeEnum.WorkPoolZeroPD;
        }
        return SLAItemTypeEnum.ScaPool;
      case WorkPoolEnum.CmcPool:
        return SLAItemTypeEnum.CmcPool;
      case WorkPoolEnum.EarningsAssessorPool:
        return SLAItemTypeEnum.EarningsPool;
      case WorkPoolEnum.ClaimsAssessorPool:
        if (row.pdPercentage && row.pdPercentage > 0) {
          return SLAItemTypeEnum.WorkPoolNonZeroPD;
        } else if (row.pdPercentage && row.pdPercentage <= 0) {
          return SLAItemTypeEnum.WorkPoolZeroPD;
        }
        return SLAItemTypeEnum.ClaimsAssessorPool;
      case WorkPoolEnum.CcaTeamLeadPool:
        return SLAItemTypeEnum.WorkPoolEstimateVerification;
    }
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
      this.loadingMessage$.next(`loading ${this.heading?.toLowerCase()}...please wait`);
    }
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'IsTopEmployer';
    this.params.direction = this.sort.direction ? this.sort.direction : 'asc';
    this.params.currentQuery = this.currentQuery;
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: (this.dataSource && !this.dataSource.isUserBox) && this.userHasPermission(this.reAllocatePermission) },
      { def: 'isTopEmployer', show: true },
      { def: 'eventType', show: this.userHasPermission(this.reAllocatePermission) || this.action },
      { def: 'assignedTo', show: true },
      { def: 'diseaseDescription', show: this.selectedWorkPool == this.cadPool && this.userHasPermission(this.reAllocatePermission) || this.action },
      { def: 'dateCreated', show: true },
      { def: 'personEventReference', show: this.selectedWorkPool == this.cadPool || this.selectedWorkPool == this.cmcPool },
      { def: 'claimNumber', show: this.selectedWorkPool != this.cadPool && this.selectedWorkPool != this.cmcPool },
      { def: 'instruction', show: true },
      { def: 'sla', show: true },
      { def: 'actions', show: this.dataSource.isUserBox || this.userHasPermission(this.reAllocatePermission) },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu(item: ClaimPool) {
    this.menus = [];
    this.menus = [
      { title: 'More Info', url: '', disable: false },
      { title: 'View', url: Constants.holisticViewUrl, disable: false },
      { title: 'Email Audit', url: '', disable: false },
      { title: 'SMS Audit', url: '', disable: false },
      { title: 'Cancel Investigation', url: '', disable: !item.investigationRequired },
      { title: 'Delete Claim', url: '', disable: this.disableDeleteClaim(item) },
      { title: 'STP Exit Reason History', url: '', disable: this.disableExitReasonSearch(item) },
      { title: 'Override VOPD', url: '', disable: !this.hasEditVopdPermission || (item.identificationNumber.length !== Constants.saId) },
      { title: 'View Claim Status Audit', url: '', disable: false },

    ];
  }

  disableDeleteClaim(item: ClaimPool) {
    return item.claimStatus == ClaimStatusEnum.Deleted || !this.userHasPermission('Delete Claim') ? true : false;
  }

  disableExitReasonSearch(item: ClaimPool): boolean {
    if (item.stpExitReason === null) {
      return true;
    } else {
      return false;
    }
  }

  openExitReasonDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      itemType: 'PersonEvent',
      itemId: row.personEventId
    };
    this.dialog.open(ExitReasonDialogComponent,
      dialogConfig);
  }

  getClaimStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimStatusEnum[id]);
  }

  getEventType(id: number) {
    if (!id) { return };
    return this.formatText(EventTypeEnum[id]);
  }

  getLiabilityStatus(id: number) {
    return this.formatText(ClaimLiabilityStatusEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  onMenuSelect(item: ClaimPool, menu: any) {
    switch (menu.title) {
      case 'More Info':
        this.openCoidWorkPoolMoreInforPopup(item);
        break;
      case 'View': this.router.navigateByUrl(Constants.holisticViewUrl + item.eventId + '/' + item.personEventId)
        break;
      case 'Email Audit':
        this.openEmailAuditDialog(item);
        break;
      case 'SMS Audit':
        this.openSmsAuditDialog(item);
        break;
      case 'Cancel Investigation':
        this.openCancelInvestigationConfirmationDialog(item);
        break;
      case 'Delete Claim':
        this.onDeleteClaim(item);
        break;
      case 'STP Exit Reason History':
        this.openExitReasonDialog(item);
        break;
      case 'Override VOPD':
        this.openVopdEditDialog(item);
        break;
      case 'View Claim Status Audit':
        this.openClaimAuditDialog(item);
        break;
    }
  }

  openClaimAuditDialog(item: ClaimPool): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      serviceType: ServiceTypeEnum.ClaimManager,
      itemType: ClaimItemTypeEnum.Claim,
      itemId: item.claimId,
    };
    this.dialog.open(ClaimAuditViewComponent,
      dialogConfig);
  }

  openVopdEditDialog(item: ClaimPool): void {
    this.getRoleplayerVopdResults(item.personEventId);
    const canEditVopd = this.hasEditVopdPermission;
    let fileIdentifier = '';
    let isAlive = null;
    let dateOfDeath: Date = null;
    if (this.memberVopdStatus.vopdStatus && this.memberVopdStatus.vopdStatus.toUpperCase().includes('DECEASED')) {
      isAlive = false;
      if (this.memberVopdStatus.dateOfDeath) {
        dateOfDeath = this.memberVopdStatus.dateOfDeath;
      }
    }
    else if (this.memberVopdStatus.vopdStatus && this.memberVopdStatus.vopdStatus.toUpperCase().includes('ALIVE')) {
      isAlive = true;
    }
    const dialogRef = this.dialog.open(VopdManualVerificationDialogComponent, { width: '800px', height: '800px', data: { memberName: this.memberVopdStatus.memberName, idNumber: this.memberVopdStatus.idNumber, canEditVopd, isAlive, dateOfDeath, fileIdentifier } });
    dialogRef.afterClosed().subscribe(() => {
      this.alertService.success('VOPD overwrite successful');
    });
  }

  getRoleplayerVopdResults(personEventId: number) {
    this.isLoadingVopd$.next(true);
    this.claimCareService.getPersonEvent(personEventId).subscribe(personEvent => {
      if (personEvent) {
        this.rolePlayerService.getVOPDResponseResultByRoleplayerId(personEvent.insuredLifeId).subscribe(clientVopdResponse => {
          if (clientVopdResponse) {
            this.memberVopdStatus = new MemberVopdStatus();
            this.memberVopdStatus.memberName = clientVopdResponse.firstName;
            this.memberVopdStatus.idNumber = clientVopdResponse.idNumber;
            this.memberVopdStatus.vopdStatus = clientVopdResponse.deceasedStatus;
            this.memberVopdStatus.dateOfDeath = clientVopdResponse.dateOfBirth;
            this.isLoadingVopd$.next(false);
          } else {
            this.isLoadingVopd$.next(false);
          }
        });
      }
    })
  }

  getPersonEvent(personEventId: number, assignedToUserId: number) {
    this.claimCareService.getPersonEvent(personEventId).subscribe(result => {
      if (result) {
        const personEvent = result;
        personEvent.assignedToUserId = assignedToUserId;
        personEvent.assignedDate = new Date();

        this.claimCareService.updatePersonEvent(personEvent).subscribe(_ => {
          this.router.navigateByUrl(Constants.holisticViewUrl + result.eventId + '/' + result.personEventId);
        });
      }
    });
  }

  AddCheckedItems(item: ClaimPool, sendAllocation: boolean) {
    let index = this.selectedClaimsToAllocate.findIndex(a => a.personEventId === item.personEventId);
    if (index > -1) {
      this.selectedClaimsToAllocate.splice(index, 1);
    } else {
      this.selectedClaimsToAllocate.push(item);
    }
    this.canReAllocate = this.selectedClaimsToAllocate.some(a => !String.isNullOrEmpty(a.userName));
    this.canAllocate = this.selectedClaimsToAllocate.some(a => String.isNullOrEmpty(a.userName));

    this.sendForAllocation(sendAllocation);
  };

  disableReAllocate($event: ClaimPool): boolean {
    return $event.userName && this.canAllocate;
  }

  disableAllocate($event: ClaimPool): boolean {
    return !$event.userName && this.canReAllocate;
  }

  sendForAllocation(sendAllocation: boolean) {
    if (sendAllocation) {
      let item = [...this.selectedClaimsToAllocate]
      this.selectedClaimsToAllocate = [];
      this.selectedClaimsToAllocate = item;
      this.canAllocate$.next(true);

      if (item.length == 1) {
        const index = this.workPoolUsers.findIndex(a => a.id == item[0].assignedTo);
        if (index > -1) {
          this.workPoolUsers.splice(index, 1)
        }
      }
    }
  }

  openCancelInvestigationConfirmationDialog(claimPool: ClaimPool) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Cancel Investigation`,
        text: `Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelInvestigation(claimPool);
      }
    });
  }

  cancelInvestigation(claimPool: ClaimPool) {
    this.isLoading$.next(true);
    this.loadingMessage$.next(`loading investigation for cancellation...please wait`);

    this.wizardService.getWizardsInProgressByTypeAndLinkedItemId(claimPool.personEventId, 'claim-investigation-coid').subscribe(results => {
      if (results) {
        this.loadingMessage$.next(`processing cancellation...please wait`);
        this.wizardService.cancelWizard(results[0].id).subscribe(result => {
          this.alertService.success('Investigation cancelled...');
          this.getData();
          this.isLoading$.next(false);
        });
      } else {
        this.getData();
        this.isLoading$.next(false);
      }
    });
  }

  refresh($event: boolean) {
    this.selectedClaimsToAllocate = [];
    this.canAllocate = false;
    this.canReAllocate = false;
    this.canAllocate$.next(false);
    this.getData();
  }

  setMessage(message: string, errorType: ErrorTypeEnum) {
    this.floatMessage = new FloatMessage();
    this.floatMessage.message = message;
    this.floatMessage.errorType = errorType;
  }

  openEmailAuditDialog($event: ClaimPool) {
    if ($event) {
      const rolePlayerContactOptions = [
        { key: 'Employer Contacts', value: $event.employerRolePlayerId },
        { key: 'Employee Contacts', value: $event.employeeRolePlayerId }
      ];

      const dialogRef = this.dialog.open(ViewEmailAuditDialogComponent, {
        width: '80%',
        maxHeight: '750px',
        disableClose: true,
        data: {
          itemType: 'PersonEvent',
          itemId: $event.personEventId,
          rolePlayerContactOptions: rolePlayerContactOptions
        }
      });
    }
  }

  openSmsAuditDialog($event: ClaimPool): void {
    const rolePlayerContactOptions = [
      { key: 'Employer Contacts', value: $event.employerRolePlayerId },
      { key: 'Employee Contacts', value: $event.employeeRolePlayerId }
    ];

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.maxHeight = "750px";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      itemType: "PersonEvent",
      itemId: $event.personEventId,
      rolePlayerContactOptions: rolePlayerContactOptions
    };
    this.dialog.open(PersonEventSmsAuditComponent, dialogConfig);
  }

  openDialog(row: any, component: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: 'PersonEvent',
      itemId: row.personEventId
    };
    this.dialog.open(component,
      dialogConfig);
  }

  openManageUsersPopup(): void {
    const dialogRef = this.dialog.open(ManagePoolUsersComponent, {
      width: '800px',
      maxHeight: '600px',
      data: {
        selectedItems: this.selectedClaimsToAllocate,
        users: !this.userHasPermission(this.reAllocatePermission) ? this.users : this.workPoolUsers,
        workPool: this.selectedWorkPool,
      }
    });
  }

  openSceduleUsersPopup() {
    const dialogRef = this.dialog.open(MonthlyscheduleWorkPoolUserComponent, {
      width: '70%',
      maxHeight: '650px',
      data: {
        users: !this.userHasPermission(this.reAllocatePermission) ? this.users : this.workPoolUsers,
        workPool: this.selectedWorkPool,
        loggeduser: this.userLoggedIn,
      }
    });
  }

  openCoidWorkPoolMoreInforPopup(claimPool: ClaimPool) {
    const def: any[] = [];
    const dialogRef = this.dialog.open(CoidWorkPoolMoreInforDialogComponent, {
      width: '40%',
      maxHeight: '650px',
      disableClose: true,
      data: {
        personEventId: claimPool.personEventId,
      }
    });
  }

  checkCcaPool() {
    if (this.selectedWorkPool == WorkPoolEnum.CcaPool || this.selectedWorkPool == WorkPoolEnum.CcaTeamLeadPool) {
      this.isCcaPool = true;
    }
  }

  userBoxSelect() {
    this.dataSource.isUserBox = !this.dataSource.isUserBox;
    this.currentQuery = String.Empty;
    this.selectedClaimsToAllocate = [];
    this.canAllocate = false;
    this.canAllocate$.next(false);
    this.searchUserBox.emit(this.dataSource.isUserBox);
  }

  selectRow(row: ClaimPool) {
    if (row == this.selectedClaimPool) {
      let workPoolItem = new PoolWorkFlow();
      workPoolItem.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
      workPoolItem.itemId = row.personEventId;
      workPoolItem.workPool = this.selectedWorkPool;
      workPoolItem.assignedByUserId = this.userLoggedIn.id;
      workPoolItem.assignedToUserId = this.userLoggedIn.id;
      workPoolItem.effectiveFrom = new Date();
      workPoolItem.instruction = row.instruction;

      this.allocateLoading$.next(true);
      this.poolService.handlePoolWorkFlow(workPoolItem).subscribe(_ => {
        if (this.selectedWorkPool == WorkPoolEnum.ScaPool || this.selectedWorkPool == WorkPoolEnum.CmcPool ) {
          this.getPersonEvent(row.personEventId, workPoolItem.assignedToUserId);
        } else {
          this.router.navigateByUrl(Constants.holisticViewUrl + row.eventId + '/' + row.personEventId);
        }
        this.alertService.success('Workpool item allocated to your inbox successfully...');
      });
    }
  }

  onDeleteClaim(row: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      data: row
    });
    dialogRef.afterClosed().subscribe(() => {
      this.getData();
    });
  }
}
