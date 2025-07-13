import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { merge } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { UserManagerBreadcrumbService } from 'projects/admin/src/app/user-manager/shared/services/user-manager-breadcrumb.service';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { SystemModuleService } from 'projects/admin/src/app/user-manager/shared/services/system-module.service';
import { PermissionGroupService } from 'projects/shared-services-lib/src/lib/services/security/permission/permission-group.service';
import { PermissionGroup } from 'projects/shared-models-lib/src/lib/security/permissiongroup';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthCare-provider';
import { UserHealthCareProvider } from 'projects//shared-models-lib/src/lib/security/user-healthCare-provider-model';
import { HealthcareProviderSearchDataSource } from 'projects//medicare/src/app/medi-manager/datasources/healthCareProvider-search-datasource';
import { AuthenticationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authentication-type-enum';
import { PortalTypeEnum } from 'projects/shared-models-lib/src/lib/enums/portal-type-enum';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { SecurityItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/security-item-type.enum';

@Component({
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],

})
export class UserDetailsComponent extends DetailsComponent implements OnInit, AfterViewInit {
  currentEmail = '';
  currentUserId: number;
  isCurrentUser = false;
  userTypes: Lookup[];
  authenticationTypes: Lookup[];
  roles: Lookup[];
  tenants: Lookup[];
  isChecked: boolean;
  isInternalUser: boolean;
  isNew: boolean;
  tenant: Lookup;
  roleId: number;
  tenantId: number;
  isSubmitting: boolean;
  User: User;
  Email: string;
  hasError = false;
  userTypeId: number;
  authenticationType: AuthenticationTypeEnum;
  authenticationTypeId: number;
  isRolePermissionsValid = false;
  systemModules: Lookup[];
  permissionGroups: PermissionGroup[];
  permissionIds: number[];
  currentEntityPermissionIds: number[];
  inEditPermissionsMode = false;
  isPermissionsEdited = false;
  isSubmittingPermissions = false;
  roleSecurityRank: number;
  Role: Role;
  roleName: string;
  userHealthCareProviders: UserHealthCareProvider[];
  healthCareProvidersList: HealthCareProvider[];
  selectedHealthCareProviderIds: number[];
  userHealthcareProviderAccessForm: UntypedFormGroup;
  userDisplayName: string;
  Name: string;
  inEditHealthcareProviderMode = false;
  healthCareProviderSearchDataSource: HealthcareProviderSearchDataSource;
  permissionRefactorFeatureFlag = FeatureflagUtility.isFeatureFlagEnabled('RefactorPermissionImplementation');
  insufficientPermission = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private readonly authService: AuthService,
    private readonly breadcrumbService: UserManagerBreadcrumbService,
    private readonly alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly userService: UserService,
    private readonly activatedRoute: ActivatedRoute,
    router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly systemModuleService: SystemModuleService,
    private permissonGroupService: PermissionGroupService,
    private readonly healthCareProviderService: HealthcareProviderService,
    private readonly userHealthcareProviderFormBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService) {
    super(appEventsManager, alertService, router, 'User', 'user-manager', 1);
    this.systemModules = [];
    this.permissionGroups = [];
    this.permissionIds = [];
    this.currentEntityPermissionIds = [];
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.getRoles();

      this.getAuthenticationTypes();

      this.getTenants();
      if (params.id && params.id !== 0) {
        this.loadingStart('Loading user details...');
        this.createForm(params.id);
        this.getUser(params.id);
        this.form.disable();
        this.breadcrumbService.setBreadcrumb('Edit a user');
      } else {
        this.isNew = true;
        this.createForm('');
        this.breadcrumbService.setBreadcrumb('Add a user');
      }

      var userId = params.id ? params.id : 0;
      if (this.permissionRefactorFeatureFlag)
        this.permissonGroupService.getPermissionGroupsForUser(userId).
          pipe(map((data: PermissionGroup[]) => this.permissionGroups = data)).subscribe();
    });
    this.systemModuleService.getModules().pipe(map(
      data => this.systemModules = data
    )).subscribe();

    if (!this.permissionRefactorFeatureFlag) {
      this.permissonGroupService.getPermissionGroups().
        pipe(map((data: PermissionGroup[]) => this.permissionGroups = data)).subscribe();
    }
    this.healthCareProviderSearchDataSource = new HealthcareProviderSearchDataSource(this.healthCareProviderService);
  }

  ngAfterViewInit(): void {

    if (!this.paginator) return;

    this.healthCareProviderSearchDataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.paginator.page)
      .pipe(

        tap(() => this.loadHealthcareProviderSearchResult())

      ).subscribe();

  }

  createForm(id: any): void {
    this.clearDisplayName();
    if (this.form) { return; }
    const user: User = JSON.parse(sessionStorage.getItem('currentUser'));

    this.form = this.formBuilder.group({
      id,
      name: new UntypedFormControl(''),
      displayName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      role: new UntypedFormControl('', [Validators.required]),
      authenticationType: new UntypedFormControl('', [Validators.required]),
      tenant: new UntypedFormControl('', [Validators.required]),
      isActive: new UntypedFormControl(false),
      isInternalUser: new UntypedFormControl(false),
      userToken: user ? user.token : ''
    });


    if (this.userHealthcareProviderAccessForm) { return; }

    this.userHealthcareProviderAccessForm = this.userHealthcareProviderFormBuilder.group({
      healthCareproviderFilter: new UntypedFormControl(''),
      editForUserId: new UntypedFormControl('')
    });
  }

  readForm(): User {
    const formModel = this.form.value;
    const user = new User();
    user.id = formModel.id as number;
    user.displayName = formModel.displayName;
    user.email = formModel.email;
    user.roleId = formModel.role;

    user.authenticationType = formModel.authenticationType;

    user.tenantId = formModel.tenant;
    user.isActive = formModel.isActive;
    user.isInternalUser = formModel.isInternalUser;
    if (this.permissionIds.length > 0) {
      user.permissionIds = this.permissionIds;
    }

    user.portalType = PortalTypeEnum.RMA;

    return user;
  }

  setForm(user: User) {
    if (!this.form) { this.createForm(user.id); }
    if (user == null) { this.createForm(''); }
    this.isChecked = user.isActive;
    this.isInternalUser = user.isInternalUser;

    this.currentEntityPermissionIds = user.permissionIds;
    this.permissionIds = user.permissionIds;
    const userForm: User = JSON.parse(sessionStorage.getItem('currentUser'));
    this.form.setValue({
      id: user.id ? user.id : 0,
      name: user.displayName ? user.displayName : '',
      displayName: user.displayName ? user.displayName : '',
      email: user.email ? user.email : '',
      role: user.roleId ? user.roleId : 0,
      authenticationType: user.authenticationType ? user.authenticationType : 0,
      tenant: user.tenantId ? user.tenantId : 0,
      isActive: user.isActive ? user.isActive : false,
      isInternalUser: user.isInternalUser ? user.isInternalUser : false,
      userToken: userForm ? userForm.token : ''

    });

    this.userDisplayName = user.displayName ? user.displayName : '';
    this.roleName = user.roleName;

    this.getDisplayName(user);

    if (this.userHealthcareProviderAccessForm)
      this.userHealthcareProviderAccessForm.setValue({
        editForUserId: user.id ? user.id : 0,
        healthCareproviderFilter: ''
      });
  }


  setCurrentValues(): void {
    this.currentEmail = this.form.value.email.toLowerCase();
    this.form.controls.authenticationType.disable();
    this.form.controls.tenant.disable();
  }

  getUser(id: any): void {
    this.userService.getUser(id)
      .subscribe(user => {
        this.currentEmail = user.email.toLowerCase();
        this.setForm(user);
        this.checkCurrentUser(user);
        this.loadingStop();
        this.isNew = false;
        this.User = user;
        this.roleId = user.roleId;
        //this.roles is set if getroles returned first
        if (this.roles) {
          this.roleSecurityRank = (this.roles as any[]).filter((_role) => _role.id === this.roleId)[0].securityRank;
        }
        this.getNotes(id, ServiceTypeEnum.Security, 'User');
        this.getAuditDetails(id, ServiceTypeEnum.Security, SecurityItemTypeEnum.User);
        this.getUserHealthCareProviders(user.email);
      });
  }


  getAuthenticationTypes(): void {
    this.lookupService.getAuthenticationTypes().subscribe(
      data => {
        this.authenticationTypes = data;
      }
    );
  }

  getTenants(): void {
    this.userService.getTenants()
      .subscribe(data => {
        this.tenants = data;
      });
  }

  getRoles(): void {
    this.userService.getRoles()
      .subscribe((data: any) => {
        this.roles = data;
        if (!this.isNew) {
          //roleid is set if getuser returned first
          if (this.roleId) {
            this.roleSecurityRank = (this.roles as any[]).filter((_role) => _role.id === this.roleId)[0].securityRank;
          }
        }
      });
  }

  save(): void {
    if (this.form.invalid) { return; }
    if (this.isCurrentUser) { return; }

    this.insufficientPermission = !userUtility.hasPermission('Update User') || !userUtility.hasPermission('Add User');

    if (!this.insufficientPermission) {
      this.form.disable();
      const user = this.readForm();
      this.loadingStart(`Saving ${user.displayName}...`);

      if (this.form.value.id > 0) {
        this.editUser(user);
      } else {
        user.id = 0 as number;
        this.addUser(user);
      }
    }
  }

  editUser(user: User): void {
    this.userService.editUser(user).subscribe(() => this.done(user.displayName));
  }

  addUser(user: User): void {
    this.userService.addUser(user).subscribe(() => this.done(user.displayName));
  }

  resetPassword(): void {
    this.insufficientPermission = userUtility.hasPermission('Update User Password');
    const user = this.readForm();
    this.loadingStart(`Sending password reset for ${user.displayName}...`);

    if (userUtility.hasPermission('Update User Password'))
      this.userService.resetPassword(user).subscribe(() => { });

    this.done(user.displayName);

  }

  checkCurrentUser(user: User): void {
    this.currentUserId = this.authService.getCurrentUser().id;
    this.isCurrentUser = user.id === this.currentUserId;
  }

  statusChange(e: any) {
    this.form.value.isActive = e.checked;
    this.isChecked = e.checked;
  }

  isInternalUserChange(e: any) {
    this.form.value.isInternalUser = e.checked;
    this.isInternalUser = e.checked;
  }

  get showResetPassword(): boolean {
    const user = this.readForm();
    return (userUtility.hasPermission('Update User Password') && user && user.authenticationType === AuthenticationTypeEnum.FormsAuthentication && user.isActive && !this.isNew);

  }

  get showSave(): boolean {
    return (userUtility.hasPermission('Update User') || userUtility.hasPermission('Add User'));
  }


  onSingleSelected(item: any) {
    const index = this.permissionIds.indexOf(parseInt(item.value));
    if (item.checked) {
      if (index < 0) {
        this.permissionIds.push(parseInt(item.value));
      }
    }
    else {
      const index = this.permissionIds.indexOf(parseInt(item.value));
      if (index > -1) {
        this.permissionIds.splice(index, 1);
      }
    }

    this.isPermissionsEdited = true;
  }

  onMultipleSelected(item: any) {
    var arrayitem = this.permissionGroups.filter(c => c.id == item.value);
    arrayitem.map((data: any) => new PermissionGroup(data.id, data.name, data.moduleId, data.permissions));
    var permissions = arrayitem.map((data: any) => data.permissions.map((perm: any) => perm.id));


    permissions[0].forEach(c => {
      const index = this.permissionIds.indexOf(parseInt(c));
      if (item.checked) {
        if (index < 0) {
          this.permissionIds.push(c);
        }
      }
      else {
        if (index > 0) {
          this.permissionIds.splice(index, 1);
        }

      }
    });

    this.isPermissionsEdited = true;
  }

  editPermissions() {
    this.inEditPermissionsMode = true;//userUtility.hasPermission('Update User Permission') && true;
  }

  savePermissions() {
    // if (!userUtility.hasPermission('Update User Permission')) return;

    if (this.isPermissionsEdited) {
      var user = this.User;
      if (this.permissionIds.length > 0) {
        user.permissionIds = this.permissionIds;
      }
      this.isSubmittingPermissions = true;
      if (user.id > 0) {
        this.loadingStart(`Saving permissions for user ${user.displayName.toUpperCase()}...`);
        this.editUser(user);
        this.isSubmittingPermissions = false;
      } else {
        this.isSubmittingPermissions = false;
        return;
      }
    }
  }

  getUserHealthCareProviders(userEmail: string): void {
    this.userService.getUserHealthCareProviders(userEmail).subscribe(
      userHealthCareProviders => {

        if (userHealthCareProviders) {
          this.userHealthCareProviders = userHealthCareProviders;
          this.selectedHealthCareProviderIds = userHealthCareProviders.map(_ => _.healthCareProviderId);
        }
      }
    );
  }

  isAlreadyInUserProfile(searchElement: HealthCareProvider, index, array) {
    if (this.userHealthCareProviders) {
      this.userHealthCareProviders.forEach(function (value) {
        if (value.healthCareProviderId == searchElement.rolePlayerId)
          return true;
      })
    }

    return false;
  }

  saveHealthCarePractionerToUserProfile() {
    if (!userUtility.hasPermission('Update User')) return;

    const formModel = this.userHealthcareProviderAccessForm.value;
    const userId = formModel.editForUserId as number;

    let newUserHealthcareProviderList = this.selectedHealthCareProviderIds.map((healthCareProviderId: number) => UserHealthCareProvider.minimalNewUserHealthCareProvider(userId, healthCareProviderId));
    this.userService.saveUserHealthCareProviders(newUserHealthcareProviderList, userId).subscribe(savedSuccessfully => {
      if (savedSuccessfully) {
        this.alertService.success(`Successfully saved changes to user''s healthcare provider access`, `User profile saved`, true);
        this.back();
      }

    });
  }

  updateHealthcareProviderList(healthCareProvider: any, cb: any) {

    if (!healthCareProvider) return;

    const healthCareProviderId = parseInt(healthCareProvider.rolePlayerId);
    const healthCareProviderIdExistsInList = this.healthCareProviderIdExistsInList(healthCareProviderId);
    const isChecked = cb.checked;

    if (isChecked && !healthCareProviderIdExistsInList)
      this.selectedHealthCareProviderIds.push(healthCareProviderId);

    else if (!isChecked && healthCareProviderIdExistsInList)
      this.selectedHealthCareProviderIds.splice(this.selectedHealthCareProviderIds.indexOf(healthCareProviderId), 1);

  }

  healthCareProviderIdExistsInList(healthCareProviderId: number): boolean {
    if (!this.selectedHealthCareProviderIds) {
      this.selectedHealthCareProviderIds = [];
    }
    const indexOfHealthcareProviderIdInList = this.selectedHealthCareProviderIds.indexOf(healthCareProviderId);
    return indexOfHealthcareProviderIdInList > -1;
  }

  searchForHealthCarePractioner() {

    this.loadHealthcareProviderSearchResult();
  }

  loadHealthcareProviderSearchResult(): void {
    if (!this.userHealthcareProviderAccessForm) return;

    const form = this.userHealthcareProviderAccessForm.controls;
    const filter = form.healthCareproviderFilter.value;

    const healthCareProviderQuery: HealthCareProvider = { practiceNumber: filter, name: filter, rolePlayerId: 0, providerTypeId: 0, practitionerTypeName: "", isVat: false, isHospital: false };
    const healthCareProviderQueryStringified = JSON.stringify(healthCareProviderQuery);

    this.healthCareProviderSearchDataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, 'name', 'asc', healthCareProviderQueryStringified);
  }
}
