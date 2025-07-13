import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { UserManagerBreadcrumbService } from '../../shared/services/user-manager-breadcrumb.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { SystemModuleService } from '../../shared/services/system-module.service';
import { map } from 'rxjs/operators';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { PermissionGroupService } from 'projects/shared-services-lib/src/lib/services/security/permission/permission-group.service';
import { PermissionGroup } from 'projects/shared-models-lib/src/lib/security/permissiongroup';
import { SecurityItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/security-item-type.enum';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
    templateUrl: './role-details.component.html'
})
export class RoleDetailsComponent extends DetailsComponent implements OnInit {
    currentName = '';
    currentRoleId: number;
    isCurrentRole = false;
    isSaveClicked = false;
    isSubmitting = false;
    Role: Role;
    Name: string;
    permissionGroupNames: string[];
    systemModules: Lookup[];
    permissionGroups: PermissionGroup[];
    permissionIds: number[];
    currentRolePermissionIds: number[];
    componentPermissionIds: number[];
    inEditPermissionsMode = false;
    isPermissionsEdited = false;
    isSubmittingPermissions = false;
    roleSecurityRank: number;
    roleDisplayName: string;

    roleId: number;
    selectedTabIndex = 0;

    get isRolePermissionsValid(): boolean {
        if (!this.isSaveClicked) { return true; }
        const role = this.readForm();
        return role.permissionIds.length > 0;
    }
    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        router: Router,

        private readonly authService: AuthService,
        private readonly breadcrumbService: UserManagerBreadcrumbService,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly activatedRoute: ActivatedRoute,
        private readonly roleService: RoleService,
        private readonly systemModuleService: SystemModuleService,
        private permissonGroupService: PermissionGroupService
    ) {
        super(appEventsManager, alertService, router, 'Role', 'user-manager/role-list', 1);
        this.permissionGroupNames = [];
        this.systemModules = [];
        this.permissionGroups = [];
        this.permissionIds = [];
        this.currentRolePermissionIds = [];
        this.componentPermissionIds = [];
    }

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.id) {
                this.loadingStart('Loading role details...');
                this.roleId = params.id;
                this.createForm(params.id);
                this.getRole(params.id);
                this.form.disable();
                this.breadcrumbService.setBreadcrumb('Edit a role');
            } else {
                this.createForm('');
                this.breadcrumbService.setBreadcrumb('Add a role');
            }
        });
        this.systemModuleService.getModules().pipe(map(
            data => this.systemModules = data
        )).subscribe();
        this.permissonGroupService.getPermissionGroupsForRole().pipe(map(data =>
            this.permissionGroups = data.filter(s => s.name.toLowerCase() != 'authority limits')
        )).subscribe();
    }

    createForm(id: any): void {
        this.clearDisplayName();
        if (this.form) { return; }

        const user: User = JSON.parse(sessionStorage.getItem('currentUser'));

        this.form = this.formBuilder.group({
            id,
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            userToken: user ? user.token : ''
        });
    }

    readForm(): Role {
        const formModel = this.form.value;
        const role = new Role();

        role.id = formModel.id as number;
        role.name = formModel.name.trim() as string;
        if (this.permissionIds.length > 0) {
            role.permissionIds = this.permissionIds;
        }
        return role;
    }

    setForm(role: Role): void {
        if (!this.form) { this.createForm(role.id); }
        const user: User = JSON.parse(sessionStorage.getItem('currentUser'));

        this.form.patchValue({
            id: role.id,
            name: role.name,
            userToken: user ? user.token : ''
        });
        this.currentRolePermissionIds = role.permissionIds;
        this.permissionIds = role.permissionIds;
        this.getDisplayName(role);

        this.roleDisplayName = role.name ? 'Role: ' + role.name : '';
    }

    getRole(id: number): void {
        this.roleService.getRole(id)
            .subscribe((role: any) => {
                this.currentName = role.name.toLowerCase();
                this.setForm(role);
                this.checkCurrentRole(role);
                this.loadingStop();
                this.form.disable();
                this.Role = role;
                this.roleSecurityRank = role.securityRank;
                this.getNotes(id, ServiceTypeEnum.Security, 'Role');
                this.getAuditDetails(id, ServiceTypeEnum.Security, SecurityItemTypeEnum.Role);
            });
    }

    setCurrentValues(): void {
        this.currentName = this.form.value.name.toLowerCase();
    }

    save(): void {
        const role = this.readForm();
        this.isSaveClicked = true;
        if (this.isCurrentRole) { return; }

        if (this.permissionIds.length > 0) {
            role.permissionIds = this.permissionIds;
        }
        this.form.disable();
        this.loadingStart(`Saving ${role.name}...`);

        if (role.id > 0) {
            this.editRole(role);
        } else {
            role.id = 0 as number;
            role.isActive = true;
            this.addRole(role);
        }
    }

    editRole(role: Role): void {
        this.roleService.editRole(role)
            .subscribe(() => this.done());
    }

    addRole(role: Role): void {
        this.roleService.addRole(role)
            .subscribe(() => this.done());
    }

    checkCurrentRole(role: Role): void {
        this.currentRoleId = this.authService.getCurrentUser().roleId;
        this.isCurrentRole = role.id === this.currentRoleId;
    }

    onSingleSelected(item: any) {
        const index = this.permissionIds.indexOf(parseInt(item.value));
        if (item.checked) {
            if (index < 0) {
                this.permissionIds.push(parseInt(item.value));
            }
        } else {
            if (index > -1) {
                this.permissionIds.splice(index, 1);
            }
        }
        this.isPermissionsEdited = true;
    }

    onMultipleSelected(item: any) {
        if (item.checked) {
            const arrayitem = this.permissionGroups.filter(c => c.id == item.value);
            arrayitem.map((data: any) => new PermissionGroup(data.id, data.name, data.moduleId, data.permissions));
            const permissions = arrayitem.map((data: any) => data.permissions.map((perm: any) => perm.id));
            permissions[0].forEach(c => {
                const index = this.permissionIds.indexOf(parseInt(c));
                if (index < 0) {
                    this.permissionIds.push(c);
                }
            });
            this.isPermissionsEdited = true;
        }
    }

    editPermissions() {
        this.inEditPermissionsMode = true;
    }

    savePermissions() {
        if (this.isPermissionsEdited) {
            const role = this.Role;
            if (this.permissionIds.length > 0) {
                role.permissionIds = this.permissionIds;
            }
            this.isSubmittingPermissions = true;
            if (role.id > 0) {
                this.loadingStart(`Saving ${role.name} permissions...`);
                this.editRole(role);
                this.isSubmittingPermissions = false;
            } else {
                this.isSubmittingPermissions = false;
                return;
            }
        } else {
            this.inEditPermissionsMode = false;
        }
    }

    onTabChange(event: MatTabChangeEvent) {
        this.selectedTabIndex = event.index;
    }
}
