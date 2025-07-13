import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ManagePoolUsersComponent } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/manage-pool-users/manage-pool-users.component';
import { ErrorTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/message-float/message-float-model/error-type-enum';
import { FloatMessage } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/message-float/message-float-model/float-message';
import { PagedParams } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/paged-parameters';
import { PoolWorkFlowItemTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/pool-work-flow-item-type.enum';
import { MonthlyscheduleWorkPoolUserComponent } from 'projects/claimcare/src/app/claim-manager/views/work-pools/claim-workpool/monthly-schedule-work-pool-user/monthly-schedule-work-pool-user.component';
import { CoidWorkPoolMoreInforDialogComponent } from 'projects/claimcare/src/app/claim-manager/views/work-pools/coid-work-pool/coid-work-pool-more-infor-dialog/coid-work-pool-more-infor-dialog.component';
import { MemberVopdStatus } from 'projects/clientcare/src/app/policy-manager/shared/entities/member-vopd-status';
import { ClientVopdResponse } from 'projects/clientcare/src/app/policy-manager/shared/entities/vopd-response';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ConfirmDeleteComponent } from 'projects/shared-components-lib/src/lib/wizard/views/confirm-delete/confirm-delete.component';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { MedicareWorkPool } from '../../../models/medicare-workpool';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { EmployeeWorkPoolMedicalDataSource } from './employee-work-pool-medical.datasource';

@Component({
  selector: 'app-employee-work-pool-medical',
  templateUrl: './employee-work-pool-medical.component.html',
  styleUrls: ['./employee-work-pool-medical.component.css']
})
export class EmployeeWorkPoolMedicalComponent extends UnSubscribe implements OnChanges {

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
  allocateLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Output() refreshLoading = new EventEmitter<boolean>();
  @Output() searchUserBox = new EventEmitter<boolean>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: EmployeeWorkPoolMedicalDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  heading = String.Empty;
  params = new PagedParams();
  selectedClaimsToAllocate: MedicareWorkPool[] = [];

  slaItemType: SLAItemTypeEnum;
  canReAllocate = false;
  canAllocate = false;
  isCcaPool: boolean = false;
  floatMessage: FloatMessage;
  users: User[] = [];
  alreadyAssigned = false;

  selectedMedicareWorkPool: MedicareWorkPool;

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

  miaPool = WorkPoolEnum.MIAMedicalPool;
  micPool = WorkPoolEnum.MICMedicalPool;
  maaPool = WorkPoolEnum.MAAMedicalPool;
  csaPool = WorkPoolEnum.CSAMedicalPool;

  hcpPoolType = +PoolWorkFlowItemTypeEnum.MedicalHcp;
  invoicePoolType = +PoolWorkFlowItemTypeEnum.MedicalInvoice;
  preAuthPoolType = +PoolWorkFlowItemTypeEnum.MedicalPreAuthorization;

  medicalInvoiceLink = '/medicare/view-medical-invoice/'
  preauthLink = '/medicare/view-search-results'

  constructor(
    private readonly medicalPreAuthService: MediCarePreAuthService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly alertService: AlertService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly poolService: PoolWorkFlowService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setUser();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new EmployeeWorkPoolMedicalDataSource(this.medicalPreAuthService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.setSearch(this.action)
    this.getData();
    this.checkIfDataIsLoaded();

    this.dataSource.hasMedicareWorkPool.subscribe(result => {
      if (result) {
        this.autoSelect();
      }
    })
  }

  getData() {
    this.selectedMedicareWorkPool = null;
    this.dataSource.loggedInUserId = this.userLoggedIn.id;
    this.dataSource.selectedWorkPool = this.selectedWorkPool;
    this.dataSource.selectedUserId = this.selectedUserId;
    this.setPoolName();
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
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
    if (!this.selectedMedicareWorkPool) {
      const MedicareWorkPoolData = this.dataSource?.data?.data;
      this.selectedMedicareWorkPool = MedicareWorkPoolData ? MedicareWorkPoolData[0] : null;
    }
  }

  setSLAType(row: MedicareWorkPool) {
    switch (row.poolWorkFlowItemType) {
      case PoolWorkFlowItemTypeEnum.MedicalHcp:
        case  PoolWorkFlowItemTypeEnum.MedicalInvoice:
        return SLAItemTypeEnum.MiaMedicalPool;
      case PoolWorkFlowItemTypeEnum.MedicalPreAuthorization:
        return +SLAItemTypeEnum.MaaMedicalPool;
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
    }
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'PreAuthId';
    this.params.direction = this.sort.direction ? this.sort.direction : 'asc';
    this.params.currentQuery = this.currentQuery;
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'select', show: true },
      { def: 'assignedTo', show: true },
      { def: 'dateCreated', show: true },
      { def: 'claimNumber', show: true },
      { def: 'instruction', show: true },
      { def: 'sla', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu(item: MedicareWorkPool) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false }
    ];
  }


  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  onMenuSelect(item: MedicareWorkPool, menu: any) {
    switch (menu.title) {
      case 'More Info':
        this.openCoidWorkPoolMoreInforPopup(item);
case 'View':
if (this.selectedWorkPool == WorkPoolEnum.MIAMedicalPool && item.invoiceId > 0) {
  this.router.navigateByUrl(`${this.medicalInvoiceLink}${item.invoiceId}`);
}
if (this.selectedWorkPool == WorkPoolEnum.MAAMedicalPool && item.preAuthId > 0) {
  this.router.navigateByUrl(`${this.preauthLink}/${item.personEventId}/${+item.preAuthType}/${item.preAuthId}`);
}

        break;
    }
  }

  AddCheckedItems(item: MedicareWorkPool, sendAllocation: boolean) {
    let index = this.selectedClaimsToAllocate.findIndex(a => a.personEventId === item.personEventId);
    if (index > -1) {
      this.selectedClaimsToAllocate.splice(index, 1);
    } else {
      this.selectedClaimsToAllocate.push(item);
    }
    if(item.assignedTo)
      this.alreadyAssigned =true;
 

    this.sendForAllocation(sendAllocation);
  };

  disableReAllocate($event: MedicareWorkPool): boolean {
    return $event.userName && this.canAllocate;
  }

  disableAllocate($event: MedicareWorkPool): boolean {
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

  openManageUsersPopup(): void {
    const dialogRef = this.dialog.open(ManagePoolUsersComponent, {
      width: '60%',
      maxHeight: '50%',
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

  openCoidWorkPoolMoreInforPopup(MedicareWorkPool: MedicareWorkPool) {
    const def: any[] = [];
    const dialogRef = this.dialog.open(CoidWorkPoolMoreInforDialogComponent, {
      width: '40%',
      maxHeight: '650px',
      disableClose: true,
      data: {
        personEventId: MedicareWorkPool.personEventId,
      }
    });
  }



  userBoxSelect() {
    this.dataSource.isUserBox = !this.dataSource.isUserBox;
    this.currentQuery = String.Empty;
    this.selectedClaimsToAllocate = [];
    this.canAllocate = false;
    this.canAllocate$.next(false);
    this.searchUserBox.emit(this.dataSource.isUserBox);
  }

  selectRow(row: MedicareWorkPool) {
      let workPoolItem = new PoolWorkFlow();
      if (row.poolWorkFlowItemType == PoolWorkFlowItemTypeEnum.MedicalInvoice) {
        workPoolItem.itemId = row.invoiceId;
      }
      else if (row.poolWorkFlowItemType == PoolWorkFlowItemTypeEnum.MedicalPreAuthorization) {
        workPoolItem.itemId = row.preAuthId;
      }
      else if (row.poolWorkFlowItemType == PoolWorkFlowItemTypeEnum.MedicalHcp) {
        workPoolItem.itemId = row.roleplayerId;
      }
      workPoolItem.poolWorkFlowItemType = +row.poolWorkFlowItemType;
      workPoolItem.workPool = this.selectedWorkPool;
      workPoolItem.assignedByUserId = this.userLoggedIn.id;
      workPoolItem.assignedToUserId = this.userLoggedIn.id;
      workPoolItem.effectiveFrom = new Date();
      workPoolItem.instruction = row.instruction;

      this.allocateLoading$.next(true);

      this.poolService.handlePoolWorkFlow(workPoolItem).subscribe(_ => {
        if (this.selectedWorkPool == WorkPoolEnum.MIAMedicalPool && row.invoiceId > 0) {
          this.router.navigateByUrl(`${this.medicalInvoiceLink}${row.invoiceId}`);
        }
        if (this.selectedWorkPool == WorkPoolEnum.MAAMedicalPool && row.preAuthId > 0) {
          this.router.navigateByUrl(`${this.preauthLink}/${row.personEventId}/${+row.preAuthType}/${row.preAuthId}`);
        }
        if(!this.dataSource.isUserBox){
          this.alertService.success('Workpool item allocated to your inbox successfully...');
        }
      });    
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
