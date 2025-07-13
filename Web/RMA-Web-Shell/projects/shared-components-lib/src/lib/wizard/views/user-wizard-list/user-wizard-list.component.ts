import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { UserWizardListDatasource } from 'projects/shared-components-lib/src/lib/wizard/views/user-wizard-list/user-wizard-list.datasource';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardService } from '../../shared/services/wizard.service';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardConfiguration } from '../../shared/models/wizard-configuration';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Constants } from 'projects/clientcare/src/app/constants';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { MemberConstants } from 'projects/clientcare/src/app/member-manager/member-constants'
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { UserSearchDialogComponent } from '../../../dialogs/user-search-dialog/user-search-dialog.component';
import { WizardPermissionTypeEnum } from '../../shared/models/wizard-permission-type-enum';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RoleSearchDialogComponent } from '../../../dialogs/role-search-dialog/role-search-dialog.component';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { WizardRolesAssignmentDialogComponent } from '../../../dialogs/wizard-roles-assignment-dialog/wizard-roles-assignment-dialog.component';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { ToastrManager } from 'ng6-toastr-notifications';
import { WizardLockStatusEnum } from '../../shared/models/wizard-lock-status.enum';

@Component({
  templateUrl: './user-wizard-list.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'user-wizard-list',
  styleUrls: ['./user-wizard-list.component.css']
})
export class UserWizardListComponent extends PermissionHelper implements OnInit, AfterViewInit {

  unlockAndReassignPermission = 'Unlock And Reassign Task';
  wizardRoleReassingPermission = 'Wizard Role Reassign';

  @Input() wizardConfigIds: string; // show only wizards with these specific wizard config ids
  @Input() title: string; // overrride the title of the component
  @Input() filterOnLinkedItemId: number; // show only if linked item id is equal to the input
  @Input() mineOnly: boolean; // show only if assigned to my user
  @Input() orderOverride: string = ''; // user specified string that appears in the name/label of the wizard to be ordered as priority, This is a string so that wizards with the same wizard config id can be prioritised at the top.
  @Input() lockStatus: string = '0'; // use this to influence how the landing should initial filter
  @Input() showItemsLockedToOtherUsers: boolean = true; //override if module doesn't want default behaviour of seeing everything
  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  searchText: string;
  currentQuery: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  dataSource: UserWizardListDatasource;
  wizardConfiguration: WizardConfiguration[];

  currentUser: string;
  showIfReallocate = true;
  selectedWizards: Wizard[];
  wizardType: string;
  wizardStatus: string;
  wizardStatuses: Lookup[] = [];

  form: UntypedFormGroup;
  currentUserObject: User;
  isMember = false;
  showIfAllocate = false;
  hasRoleReassignPermission: boolean;

  disable_coid_vaps_e2e_clientcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClientCare');
  disable_coid_vaps_e2e_claimcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClaimCare');
  hiddenWizardConfigurations: string[] = [];

  public lockStatuses = [
    { name: WizardLockStatusEnum[WizardLockStatusEnum.All], value: '0' },
    { name: WizardLockStatusEnum[WizardLockStatusEnum.Locked], value: WizardLockStatusEnum[WizardLockStatusEnum.Locked] },
    { name: WizardLockStatusEnum[WizardLockStatusEnum.Unlocked], value: WizardLockStatusEnum[WizardLockStatusEnum.Unlocked] }
  ];

  public roleUserOptions = [
    { name: 'All', value: '0' },
    { name: 'User', value: 'User' },
    { name: 'Role', value: 'Role' }
  ];
  selectedRoleUser;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    public lookupService: LookupService,
    public wizardService: WizardService,
    private formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private roleService: RoleService, private readonly alertService: ToastrManager) {
    super();
  }

  ngOnInit() {
    this.currentUserObject = this.authService.getCurrentUser();
    if (this.currentUserObject.roleName.toUpperCase() === MemberConstants.memberRole.toUpperCase()) {
      this.isMember = true;
    }
    this.intializeControls();
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: this.userHasPermission(this.unlockAndReassignPermission) },
      { def: 'name', show: true },
      { def: 'type', show: true },
      { def: 'createdBy', show: true },
      { def: 'lockedStatus', show: true },
      { def: 'wizardStatusText', show: true },
      { def: 'overAllSLAHours', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  intializeControls() {
    this.title = !this.title ? 'My Tasks' : this.title;
    this.currentUser = this.authService.getCurrentUser().username;
    this.dataSource = new UserWizardListDatasource(this.wizardService);


    if (!this.showItemsLockedToOtherUsers
      && !(userUtility.hasPermission(Constants.assignTask))
    ) {
      this.lockStatus = WizardLockStatusEnum[WizardLockStatusEnum.UserOnly];
    }

    this.handleWizardConfigsFeatureFlag();

    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '', this.wizardConfigIds, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus, this.orderOverride);

    this.wizardConfigurationService.getWizardConfigurationByIds(this.wizardConfigIds).subscribe(result => {
      this.wizardConfiguration = [];
      this.wizardConfiguration = result;
      this.wizardConfiguration.forEach(x => {
        x.name = x.name.replace(/-/gi, ' ');
        x.name = this.convertToTitleCase(x.name);
      });
      if (this.wizardConfiguration.length > 0) {
        if (this.wizardConfiguration.findIndex(wc => wc.name === 'All') === -1) {
          this.wizardConfiguration.unshift({ id: 0, name: 'All' } as WizardConfiguration);
        }
      }
    });

    this.showIfReallocate = this.hasPermission(Constants.unlockAndReassignTask);
    if (userUtility.hasPermission(Constants.assignTask)) {
      this.showIfAllocate = true;
    }
    this.getWizardStatuses();
    this.createForm();
  }

  handleWizardConfigsFeatureFlag() {
    const hiddenConfigs = [];

    if (this.disable_coid_vaps_e2e_clientcare) {
      hiddenConfigs.push('69', '103', '110', '119', '120', '121', '134', '135', '139');
    }

    if (this.disable_coid_vaps_e2e_claimcare) {
      hiddenConfigs.push('77', '78');
    }

    if (hiddenConfigs.length > 0) {
      const hiddenSet = new Set(hiddenConfigs);
      this.wizardConfigIds = this.wizardConfigIds.split(',').filter(s => !hiddenSet.has(s)).join(",");
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      type: [0],
      wizardStatus: [0],
      lockStatus: [this.lockStatus],
      myInboxOnly: [this.mineOnly],
      roleUserOptions: ['0']
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          } else if (this.currentQuery.length === 0) {
            this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.wizardConfigIds, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus, this.orderOverride);
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  apply() {
    this.loadData();
  }

  loadData(): void {
    if (this.filter.nativeElement.value && this.filter.nativeElement.value.length > 0) {
      this.currentQuery = this.filter.nativeElement.value;
    }

    if (this.mineOnly) {
      this.lockStatus = '0';
      this.currentQuery = this.authService.getCurrentUser().email;
    }

    if (this.wizardType === '0' || this.wizardType === undefined) {
      this.wizardType = this.wizardConfigIds;
    }

    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.wizardType, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus, this.orderOverride);
  }

  typeChanged($event: any) {
    this.resetQuery();
    this.wizardType = $event.value;
  }

  wizardStatusChanged($event: any) {
    this.resetQuery();
    this.wizardStatus = $event.value;
  }

  lockStatusChanged($event: any) {
    this.resetQuery();
    this.lockStatus = $event.value;
  }

  private getWizardStatuses(): void {
    this.lookupService.getWizardStatuses().subscribe(
      data => {
        this.wizardStatuses = data.sort();
        if (this.wizardStatuses.length > 0 && this.wizardStatuses.findIndex(wc => wc.name === 'All') === -1) {
          this.wizardStatuses.unshift({ id: 0, name: 'All' } as Lookup);
        }
      });
  }

  formatWizardType(type: string) {
    const temp = type.replace('-', ' ');
    return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
  }


  onSelect(item: Wizard): void {
    let itemType = item.type;
    if (item.type === 'inter-debtor-transfer' || item.type === 'claims-interbank-transfer') {
      itemType = 'inter-bank-transfer';
    }
    Wizard.redirect(this.router, itemType, item.id);
  }

  clearInput() {
    this.filter.nativeElement.value = String.Empty;
    this.loadData();
  }

  reset() {
    this.enableFilterControls();
    this.mineOnly = false;
    this.form.get('myInboxOnly').setValue(this.mineOnly);
    this.clearFilters();
    this.resetInbox();
  }

  getUserTaskList() {
    if (this.hasPermission(Constants.unlockAndReassignTask)) {
      this.showIfReallocate = true;
      this.selectedWizards = [];

      this.dataSource.getData(+this.wizardConfigIds, this.filterOnLinkedItemId, '1');
    }
    else {
      this.dataSource.getData(+this.wizardConfigIds, this.filterOnLinkedItemId);
    }
    this.clearInput();
  }

  private hasPermission(permission: string): boolean {
    const permissions = this.authService.getCurrentUserPermissions();
    return permissions.filter(x => x.name === permission).length > 0
  }

  handleChecked(wizard: Wizard) {
    this.selectedWizards = this.selectedWizards ? this.selectedWizards : [];

    let index = this.selectedWizards.findIndex(a => a.id === wizard.id);
    if (index > -1) {
      this.selectedWizards.splice(index, 1);
    } else {
      this.selectedWizards.push(wizard);
    }
  }

  canSelect(wizard: Wizard): boolean {
    const selectionContainsWizardWithOverridePermissions = this.selectedWizards?.some(s => s.wizardPermissionOverrides?.length > 0) && this.selectedWizards[0].id != wizard.id;

    const isAlreadySelected = this.selectedWizards?.some(selected =>
      selected.wizardConfigurationId === wizard.wizardConfigurationId &&
      selected.wizardStatusId === wizard.wizardStatusId
    );

    const isCompleted = [
      WizardStatus.Completed,
      WizardStatus.Cancelled,
      WizardStatus.Rejected
    ].includes(wizard.wizardStatusId);

    const noSelection = !this.selectedWizards || this.selectedWizards.length === 0;

    return (noSelection || isAlreadySelected) && !isCompleted && !selectionContainsWizardWithOverridePermissions;
  }

  showUnlock(): boolean {
    return this.selectedWizards?.length > 0 && this.selectedWizards.some(s => s.lockedToUser);
  }

  unlock() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('unlocking...please wait');

    this.selectedWizards.forEach(s => {
      s.lockedToUser = null;
    });

    this.wizardService.updateWizards(this.selectedWizards).subscribe(result => {
      this.getUserTaskList();
      this.isLoading$.next(false);
    });
  }

  openUserSearchDialog() {
    const permissionType = this.selectedWizards[0].wizardStatusId == +WizardStatus.New || this.selectedWizards[0].wizardStatusId == +WizardStatus.InProgress || this.selectedWizards[0].wizardStatusId == +WizardStatus.Disputed ? WizardPermissionTypeEnum.Continue : this.selectedWizards[0].wizardStatusId == +WizardStatus.AwaitingApproval ? WizardPermissionTypeEnum.Approve : null;
    const wizardConfigurationPermission = permissionType
      ? this.selectedWizards[0].wizardConfiguration?.wizardPermissions?.find(s => s.wizardPermissionType == permissionType)
      : null;

    const wizardOverridePermissions = permissionType
      ? this.selectedWizards[0].wizardPermissionOverrides?.filter(s => s.wizardPermissionType == permissionType)
      : [];

    const permissions: string[] = [
      ...(wizardConfigurationPermission?.permissionName ? [wizardConfigurationPermission.permissionName] : []),
      ...wizardOverridePermissions.map(p => p.permissionName).filter(name => !!name)
    ];

    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        title: 'Workflow: Assign To User',
        permissions: permissions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assign(result);
      }
    });
  }

  assign(user: User) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('assigning...please wait');

    this.selectedWizards.forEach(s => {
      s.lockedToUser = user.email;
      s.customRoutingRoleId = null;
    });

    this.wizardService.updateWizards(this.selectedWizards).subscribe(result => {
      this.getUserTaskList();
      this.isLoading$.next(false);
      this.alertService.successToastr('Workflow successfully assigned to user inbox');
    });
  }

  isSelected($event: Wizard): boolean {
    return !this.selectedWizards ? false : this.selectedWizards.some(s => s.id == $event.id)
  }

  getWizardStatusText($event: WizardStatus) {
    return this.formatLookup(WizardStatus[$event]);
  }

  formatLookup(lookup: string) {
    if (String.isNullOrEmpty(lookup)) { return; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  convertToTitleCase(title: string): string {
    return title
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  isPriority(wizard: Wizard): boolean {
    return this.orderOverride && this.orderOverride != '' && wizard.name.toLowerCase().includes(this.orderOverride.toLowerCase()) && !wizard.lockedToUser;
  }

  myInboxOnlyChange(event: MatCheckboxChange): void {
    this.clearFilters();
    if (event.checked) {
      this.mineOnly = true;
      this.currentQuery = this.authService.getCurrentUser().email;
      this.lockStatus = '0';
      this.loadData();
    }
    else {
      this.mineOnly = false;
      this.resetInbox();
    }
  }

  userRoleFilterChanged($event: any) {
    this.lockStatus = '0';
    this.currentQuery = '';
    this.selectedRoleUser = '';
    if ($event.value.toLowerCase() === 'user') {
      this.openUsersDialog();
    }
    else if ($event.value.toLowerCase() === 'role') {
      this.openRolesDialog();
    }
  }

  openUsersDialog(
  ): void {
    const dialogRef = this.dialog.open(UserSearchDialogComponent, {
      width: "50%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.currentQuery = result.email;
        this.lockStatus = WizardLockStatusEnum[WizardLockStatusEnum.Locked];
        this.selectedRoleUser = result.email;
      };
    });
  }

  openRolesDialog(
  ): void {
    const dialogRef = this.dialog.open(RoleSearchDialogComponent, {
      width: "50%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.lockStatus = WizardLockStatusEnum[WizardLockStatusEnum.Unlocked];
        this.currentQuery = result.name;
        this.selectedRoleUser = result.name;
      };
    });
  }

  resetInbox() {
    this.handleWizardConfigsFeatureFlag();

    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '', this.wizardConfigIds, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus, this.orderOverride);

    this.wizardConfigurationService.getWizardConfigurationByIds(this.wizardConfigIds).subscribe(result => {
      this.wizardConfiguration = [];
      this.wizardConfiguration = result;
      this.wizardConfiguration.forEach(x => {
        x.name = x.name.replace(/-/gi, ' ');
        x.name = this.convertToTitleCase(x.name);
      });
      if (this.wizardConfiguration.length > 0) {
        if (this.wizardConfiguration.findIndex(wc => wc.name === 'All') === -1) {
          this.wizardConfiguration.unshift({ id: 0, name: 'All' } as WizardConfiguration);
        }
      }
    });

    this.showIfReallocate = this.hasPermission(Constants.unlockAndReassignTask);
    if (userUtility.hasPermission(Constants.assignTask)) {
      this.showIfAllocate = true;
    }
  }

  clearFilters() {
    this.selectedRoleUser = '';
    this.lockStatus = '0';
    this.currentQuery = null;
    this.form.get('roleUserOptions').setValue('0');
    this.form.get('lockStatus').setValue('0');
    this.form.get('type').setValue(0);
    this.form.get('wizardStatus').setValue(0);
    this.wizardType = '0';
  }

  disableFilterControls() {
    this.form.get('roleUserOptions').disable();
    this.form.get('lockStatus').disable();
    this.form.get('type').disable();
    this.form.get('wizardStatus').disable();
  }

  enableFilterControls() {
    this.form.get('roleUserOptions').enable();
    this.form.get('lockStatus').enable();
    this.form.get('type').enable();
    this.form.get('wizardStatus').enable();
  }

  openRoleAssignmentDialog() {
    const uniquePermissions = [];
    this.selectedWizards.forEach(wizard => {
      const wizardPemissions = [...new Set(wizard.wizardConfiguration.wizardPermissions.map(p => p.permissionName))];
      wizardPemissions.forEach(
        permission => {
          if (uniquePermissions.indexOf(permission) < 0) {
            uniquePermissions.push(permission);
          }
        }
      );
    }
    );

    let roles: Role[] = [];
    if (uniquePermissions.length > 0) {
      const permissionsCount = uniquePermissions.length;
      for (let i = 0; i < uniquePermissions.length; i++) {
        this.roleService.getRolesByPermission(uniquePermissions[i]).subscribe(
          data => {
            if (data) {
              [...data].forEach(p =>
                roles.push(p));
            }
            if (i == (permissionsCount - 1)) {
              if (roles.length > 0) {
                const dialogRef = this.dialog.open(WizardRolesAssignmentDialogComponent, {
                  width: "50%",
                  data: { roles }
                });

                dialogRef.afterClosed().subscribe((result) => {
                  if (result) {
                    this.assignWizardToRole(result);
                  };
                });
              }
              else {
                this.alertService.errorToastr('No roles matching workflow permissions found');
              }
            }
          }
        );
      }
    }
  }

  assignWizardToRole(roleId: number) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('assigning...please wait');

    this.selectedWizards.forEach(s => {
      s.customRoutingRoleId = roleId;
      s.modifiedBy = this.authService.getCurrentUser().email;
    });

    this.wizardService.updateWizards(this.selectedWizards).subscribe(result => {
      this.getUserTaskList();
      this.isLoading$.next(false);
      this.alertService.successToastr('Workflow successfully assigned to role pool');
    });
  }

  resetQuery() {
    if (this.filter.nativeElement.value.length === 0 || this.filter.nativeElement.value === '') {
      this.currentQuery = null;
    }
  }
}
