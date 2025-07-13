import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { Subscription } from 'rxjs';
import { Case } from 'projects/clientcare/src/app/policy-manager/shared/entities/case';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import 'src/app/shared/extensions/string.extensions';
import { PreAuthWorkpoolDataSource } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-workpool/preauth-workpool.datasource';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AllocateMedicalUserComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-workpool/allocate-medical-user.component';
import { ReAllocateMedicalUserComponent } from 'projects/medicare/src/app/medi-manager/views/shared/preauth-workpool/re-allocate-medical-user.component';
import { MedicalRoles } from 'projects/medicare/src/app/medi-manager/constants/medical-users';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-preauth-workpool',
  templateUrl: './preauth-workpool.component.html',
  styleUrls: ['./preauth-workpool.component.css']
})
export class PreAuthWorkpoolComponent implements OnInit, AfterViewInit, OnDestroy {

  menus: { title: string, disable: boolean }[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { read: ElementRef, static: true }) filter: ElementRef;

  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    readonly commonService: CommonService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly claimCareService: ClaimCareService,
    private readonly roleService: RoleService) {
      this.CheckAllocateReallocatePermission();
  }

  dataSource: PreAuthWorkpoolDataSource;

  disableRowIndex = 0;
  wizardId: number;
  selectedUserEmail: string;
  selectedAssignedType: string;
  loggedInUserId: number;
  selectedFilterUser = 0;
  selectedFilterAssignedType = 0;
  selectedFilterTypeId = 1;
  selectedWorkPool: string;

  currentUser: string;
  loggedInUserRole: string;
  loggedInUserEmail: string;
  form: UntypedFormGroup;
  currentQuery: string = '';

  WorkPoolsAndUsersModel: any;
  checkedItemsToAllocate: any[];

  disableUsers: boolean = false;
  disableRoles: boolean = false;
  disableReOpen: boolean;
  disableReverse: boolean;
  disableRecovery: boolean;
  buttonAccessToUser = true;
  canAllocateReallocate = false;
  disableWorkPoolSelect: boolean;

  searchText;
  currentUserObject: User;
  statusEnum = StatusType;
  usersForWorkpool: WorkPoolsAndUsersModel[];
  rolesForWorkPool: Role[];
  workPoolsForUser: WorkPoolsAndUsersModel[];
  UsersForWorkPool: WorkPoolsAndUsersModel[];
  case = new Case();

  userWorkpoolSubscription: Subscription;
  placeHolder = 'Search by PreAuth Number';

  columnDefinitions: any[] = [
    { display: 'RowIndex', def: 'rowIndex', show: false },
    { display: 'Select', def: 'select', show: true },
    { display: 'Description', def: 'description', show: true },
    { display: 'Reference Number', def: 'referenceNumber', show: true },
    { display: 'Claim Number', def: 'claimReferenceNumber', show: true },
    { display: 'Date', def: 'dateCreated', show: true },
    { display: 'Created By', def: 'createdBy', show: true },
    { display: 'User SLA', def: 'userSLAHours', show: false },
    { display: 'Overall SLA', def: 'overAllSLAHours', show: true },
    { display: 'Assigned To User', def: 'assignedToUser', show: true },
    { display: 'Locked To User', def: 'lockedToUser', show: true },
    { display: 'Work Pool Id', def: 'workPoolId', show: false },
    { display: 'User Id', def: 'userID', show: false },
    { display: 'Start DateAndTime', def: 'startDateTime', show: false },
    { display: 'End DateAndTime', def: 'endDateTime', show: false },
    { display: 'Wizard URL', def: 'wizardURL', show: false },
    { display: 'User SLA', def: 'userSLA', show: false },
    { display: 'Overall SLA', def: 'overAllSLA', show: false },
    { display: 'Action', def: 'actions', show: true }
  ];

  ngOnInit() {
    this.createForm();
    this.dataSource = new PreAuthWorkpoolDataSource(this.mediCarePreAuthService);
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.loggedInUserEmail = this.currentUserObject.email;
    this.loggedInUserRole = this.currentUserObject.roleName;

    this.dataSource.clearData();
    this.loadWorkPoolUsers();
    this.loadMedicalRoles();
    this.CheckWorkpoolIdGetData();

    this.checkedItemsToAllocate = new Array();
  }

  CheckAllocateReallocatePermission() {
    this.canAllocateReallocate = userUtility.hasPermission('Allocate Reallocate PreAuthorisation');
  }

  CheckWorkpoolIdGetData() {
    this.dataSource.getMedicalWorkPoolData(10, this.currentUserObject.id, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.currentQuery);
  }

  AddCheckedItems(event, item) {
    if (event.checked === true) {
      let valueExist = false;
      for (const value of this.checkedItemsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === false) {
        this.checkedItemsToAllocate.push(item.id, item);
        if (item.lastWorkedOnUserId === 0 || item.lastWorkedOnUserId === undefined) {
          this.buttonAccessToUser = false;
        }
      }
    } else if (event.checked === false) {
      let valueExist = false;
      this.buttonAccessToUser = true;
      for (const value of this.checkedItemsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === true) {
        const index: number = this.checkedItemsToAllocate.indexOf(item.id);
        if (index !== -1) {
          this.checkedItemsToAllocate.splice(index, 2);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  
      fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => {
            this.currentQuery = this.filter.nativeElement.value;
            if (this.currentQuery.length >= 5) {
              this.dataSource.isSearching = true;
              this.paginator.pageIndex = 0;
              this.loadData();
            }
            if (this.currentQuery.length == 0) {
              this.reset();
            }
          })
        )
        .subscribe();
  
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => this.loadData())
        )
        .subscribe();
    }, 1)
  }

  loadData(): void {
    let filterValue = this.filter.nativeElement.value as string;
    if (filterValue.length > 0) {
      this.currentQuery = filterValue;
    }
    this.CheckWorkpoolIdGetData();
  }

  reset() {
    this.filter.nativeElement.value = '';
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.userWorkpoolSubscription) {
      this.userWorkpoolSubscription.unsubscribe();
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(),
      filterUser: new UntypedFormControl(),
      filterAssignedType: new UntypedFormControl()
    });
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getWorkPoolsForUser(query: any) {
    this.workPoolsForUser = new Array();
  }

  loadMedicalRoles(): void {
    let query = "Medical";
    let medicalRoleArray = [MedicalRoles.clinicalClaimsAdjudicator, MedicalRoles.clinicalClaimsAdjudicatorManager, MedicalRoles.managedCareAndDisabilityManager, MedicalRoles.rehabilitationManager, MedicalRoles.rehabilitationPractitioner, MedicalRoles.socialWorker, MedicalRoles.teamLeaderCaseManager, MedicalRoles.teamLeaderPMCA];
    this.roleService.searchRoles(query).subscribe(roles => {
      this.rolesForWorkPool = roles;
    },
      () => { },
      () => {
        let additionalMedicalRoles = [];
        for (var singleRole of medicalRoleArray) {
          this.roleService.searchRoles(singleRole).subscribe(rolesAdditionalMedical => {
            additionalMedicalRoles = rolesAdditionalMedical;
          },
            () => { },
            () => {
              if (additionalMedicalRoles.length > 0) {
                additionalMedicalRoles.forEach(x => {
                  var index = this.rolesForWorkPool.findIndex(roleItem => roleItem.name == x.name);
                  if (index === -1) {
                    this.rolesForWorkPool.push(x);
                  }
                });
              }
            });
        }
      });
  }

  loadWorkPoolUsers(): void {
    let roleForMedical = "Medical Case Manager";
    if (this.selectedAssignedType !== '') {
      roleForMedical = this.selectedAssignedType;
    }
    this.claimCareService.getUsersForWorkPool(WorkPoolEnum.MedicalPool, roleForMedical, this.loggedInUserId).subscribe(result => {
      this.UsersForWorkPool = result;
    });
  }

  selectedWorkPoolChanged($event: any) {
    this.paginator.pageIndex = 0;
    this.searchText = '';
    this.selectedFilterUser = 0;
    this.selectedFilterAssignedType = 0;
    this.selectedWorkPool = $event.value as string;
    this.currentQuery = this.selectedWorkPool;
    this.dataSource.getMedicalWorkPoolData(WorkPoolEnum.MedicalPool, this.currentUserObject.id, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.currentQuery);
  }

  selectedAssignedTypeChanged($event: any) {
    this.paginator.pageIndex = 0;
    this.dataSource.data.data = [];
    this.searchText = '';
    this.selectedAssignedType = $event.value as string;
    if (this.selectedAssignedType !== '') {
      this.currentQuery = this.selectedAssignedType;
      this.dataSource.getMedicalWorkPoolData(WorkPoolEnum.MedicalPool, this.currentUserObject.id, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.currentQuery);
    }
    this.loadWorkPoolUsers();
  }

  selectedUserChanged($event: any) {
    this.paginator.pageIndex = 0;
    this.dataSource.data.data = [];
    this.searchText = '';
    this.selectedUserEmail = $event.value as string;
    if (this.selectedUserEmail !== '') {
      this.currentQuery = this.selectedUserEmail;
      this.dataSource.getMedicalWorkPoolData(WorkPoolEnum.MedicalPool, this.currentUserObject.id, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.currentQuery);
    }
  }

  setdisableRowIndex(){
    for (let index = 0; index <= this.dataSource.data.data.length-1; index++)
    {
      if (this.dataSource.data.data[index].lockedToUserId <= 0)
      {
        this.disableRowIndex = index;
        return;
      }
    }
  }

  filterMenu(item: any) {
    this.setdisableRowIndex();

    if (item.wizardURL !== '')
    {
      const index = item.wizardURL.lastIndexOf('/');
      this.wizardId = item.wizardURL.substring(index + 1);
    }
    else
    {
      this.wizardId = item.wizardId;
    }
    this.menus = null;
    this.disableReOpen = true;
    if(item.referenceType == "PreAuthorisation") {
      this.menus =
      [
        { title: 'View', disable: (this.loggedInUserRole == 'Medical Admin Assistant' || 
                                    (item.lockedToUserId > 0 && item.lockedToUserId != this.loggedInUserId) ||
                                    (item.rowIndex > this.disableRowIndex)) },
        { title: 'Lock', disable: item.lockedToUserId > 0 },
        { title: 'Unlock', disable: item.lockedToUserId == 0 }
      ];
    }
  }

  openAllocateToUsersPopup(): void {
    if (this.checkedItemsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Allocate', true);
      return;
    }

    // ===Check if it already allocated to a user : if so then cant allocate again
    let valueExist = false;
    if (this.checkedItemsToAllocate.length > 0) {
      for (const value of this.checkedItemsToAllocate) {
        const index: number = this.checkedItemsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const assignedToUserId = value.assignedToUserId;
          if (assignedToUserId !== 0 && assignedToUserId !== null) {
            valueExist = true;
          }
        }
      }

      if (valueExist === true) {
        this.alertService.error(`Already allocated. Cannot allocate again. Use Re-Allocate`, 'Allocate', true);
        return;
      }
    }

    // ===Check if it Claim exist
    let claimExist = true;
    if (this.checkedItemsToAllocate.length > 0) {
      for (const value of this.checkedItemsToAllocate) {
        const index: number = this.checkedItemsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const existingClaimId = value.claimId;
          if (existingClaimId === 0 || existingClaimId === null) {
            claimExist = false;
          }
        }
      }
    }

    const dialogRef = this.dialog.open(AllocateMedicalUserComponent, {
      data: this.checkedItemsToAllocate
    });
    let assignResult = "";
    dialogRef.afterClosed().subscribe(result => {
      assignResult = result;
    },
      () => { },
      () => {
        if (assignResult === 'Allocated') {
          this.alertService.success(`Item allocated`, 'Allocate', true);
          this.loadData();
          this.checkedItemsToAllocate = new Array();
        }
        else {
          this.alertService.error(`Failed to allocate item`, 'Reallocate', true);
        }
      }
    );
  }

  openReAllocateToUsersPopup(): void {
    // ====Check how many items selected. if more than one than dont open popup for users to re allocate
    if (this.checkedItemsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Reallocate', true);
      return;
    }
    if (this.checkedItemsToAllocate.length <= 2) {
      if ((this.checkedItemsToAllocate[1].userId === 0 || this.checkedItemsToAllocate[1].userId === null) && this.checkedItemsToAllocate[1].userName === null) {
        this.alertService.error(`You can only reallocate if the item is already allocated to a user`, 'Reallocate', true);
        return;
      } else {
        const dialogRef = this.dialog.open(ReAllocateMedicalUserComponent, {
          data: this.checkedItemsToAllocate
        });
        let assignResult = "";
        dialogRef.afterClosed().subscribe(result => {
          assignResult = result;
        },
          () => { },
          () => {
            if (assignResult === 'Reallocated') {
              this.alertService.success(`Item re-allocated`, 'Reallocate', true);
              this.loadData();
              this.checkedItemsToAllocate = new Array();
            }
            else {
              this.alertService.error(`Failed to re-allocate item`, 'Reallocate', true);
            }
          }
        );
      }
    } else {
      this.alertService.error(`More than one item selected`, 'Re-Allocate', true);
      return;
    }
  }

  onMenuSelect(item: any, title: any) {
    switch (title) {
      case 'View':
        this.assignWorkItemToUser(item);
        this.lockOrUnlockWorkflow(item, this.loggedInUserId);
        this.router.navigate(['/medicare/view-search-results', item.personEventId, item.preAuthType, item.referenceId]);
        break;
      case 'Lock':
        this.lockOrUnlockWorkflow(item, this.loggedInUserId);
        break;
      case 'Unlock':
        this.lockOrUnlockWorkflow(item, 0);
        break;
    }
  }

  assignWorkItemToUser(item: any): void {
    let workpool = new MedicalWorkPoolModel();
    workpool.wizardId = item.wizardId;
    workpool.workPoolId = item.workPoolId;
    workpool.referenceId = item.referenceId;
    workpool.referenceNumber = item.referenceNumber;
    workpool.assignedToUserId = this.loggedInUserId;
    workpool.assignedToUser = this.loggedInUserEmail;
    let result = 0;
    this.mediCarePreAuthService.assignWorkflow(workpool).subscribe(
      res => {
        result = res;        
        },
        () => { }
      );
  }

  lockOrUnlockWorkflow(item: any, lockedToUserId: number): void {
    let workpool = new MedicalWorkPoolModel();
    workpool.wizardId = item.wizardId;
    workpool.lockedToUserId = lockedToUserId;
    this.mediCarePreAuthService.lockOrUnlockWorkflow(workpool).subscribe(
      result => {
        if (lockedToUserId > 0) {
          this.alertService.success(`Work Item locked`);          
        }
        else {
          this.alertService.success(`Work Item unlocked`);
        }
        if (result > 0) {
          this.reset();
        }
      },
      () => { }
    );
  }
}
