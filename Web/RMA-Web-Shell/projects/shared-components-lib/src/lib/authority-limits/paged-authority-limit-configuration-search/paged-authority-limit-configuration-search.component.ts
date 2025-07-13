import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthorityLimitItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-item-type-enum';
import { AuthorityLimitConfiguration } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-configuration';
import { AuthorityLimitService } from 'projects/shared-services-lib/src/lib/services/authority-limits/authority-limits.service';
import { PagedAuthorityLimitConfigurationSearchDataSource } from './paged-authority-limit-configuration-search.datasource';
import { AuthorityLimitConfigurationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-configuration-type-enum';
import { AuthorityLimitValueTypeEnum } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-value-type-enum';
import { RoleService } from 'projects/shared-services-lib/src/lib/services/security/role/role.service';
import { Permission } from 'projects/shared-models-lib/src/lib/security/permission';
import { AuthorityLimitItemTypePermissions } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-item-type-permissions';
import { BehaviorSubject } from 'rxjs';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { MatDialog } from '@angular/material/dialog';
import { UserSearchDialogComponent } from '../../dialogs/user-search-dialog/user-search-dialog.component';

@Component({
    selector: 'paged-authority-limit-configuration-search',
    templateUrl: './paged-authority-limit-configuration-search.component.html',
    styleUrls: ['./paged-authority-limit-configuration-search.component.css']
})
export class PagedAuthorityLimitConfigurationSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    assignPermissionsToRolePermission = 'Manage Authority Limit Permissions';
    manageValuesPermission = 'Manage Authority Limit Values';

    @Input() roleId: number; // required only when assigning permissions to a role

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    form: any;
    dataSource: PagedAuthorityLimitConfigurationSearchDataSource;

    role: Role;
    authorityLimitItemTypes: AuthorityLimitItemTypeEnum[];
    selectedPermissionNames: string[] = [];
    editedAuthorityLimits: AuthorityLimitConfiguration[] = [];

    rolePermissions: Permission[];
    authorityLimitsPermissions: AuthorityLimitItemTypePermissions[];

    disabledAuthorityLimitItemTypes: AuthorityLimitItemTypeEnum[] = [];

    single = AuthorityLimitConfigurationTypeEnum.Single;
    monetaryValue = AuthorityLimitValueTypeEnum.MonetaryValue;
    dayCount = AuthorityLimitValueTypeEnum.DayCount;

    isReadOnly = true;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly authorityLimitService: AuthorityLimitService,
        private readonly roleService: RoleService,
        private readonly dialog: MatDialog
    ) {
        super();
        this.dataSource = new PagedAuthorityLimitConfigurationSearchDataSource(this.authorityLimitService);
    }

    ngOnInit() {
        this.createForm();
        this.getLookups();
    }

    createForm(): void {
        this.form = this.formBuilder.group({
            authorityLimitItemTypeFilter: [{ value: 'All', disabled: false }],
        });
    }

    getLookups() {
        this.authorityLimitItemTypes = this.ToArray(AuthorityLimitItemTypeEnum);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.roleId && this.roleId > -1) {
            this.reset(true);
        } else {
            this.getData();
            this.isLoading$.next(false);
        }
    }

    getRole() {
        this.isLoading$.next(true);
        this.roleService.getRole(this.roleId).subscribe(result => {
            if (result) {
                this.role = new Role();
                this.role.id = result.id;
                this.role.name = result.name;
                this.role.permissionIds = result.permissionIds ? result.permissionIds : [];
            }

            this.getAllAuthorityLimitPermissions();
        });
    }

    getAllAuthorityLimitPermissions() {
        this.authorityLimitService.getAuthorityLimitItemTypesPermissions().subscribe(results => {
            this.authorityLimitsPermissions = results ? results : [];
            this.getRolePermissions();
        });
    }

    getRolePermissions() {
        this.roleService.getRolePermissions(this.roleId).subscribe(result => {
            this.rolePermissions = result ? result : [];

            this.handleExistingRolePermissions();
        });
    }

    handleExistingRolePermissions() {
        const rolePermissionNames = new Set(this.rolePermissions.map(t => t.name));
        this.selectedPermissionNames = [];
        this.disabledAuthorityLimitItemTypes = [];

        this.authorityLimitsPermissions.forEach(authorityLimitsPermission => {
            const matchedPermissionNames = authorityLimitsPermission.permissions.filter(p => rolePermissionNames.has(p.name)).map(p => p.name);

            if (matchedPermissionNames.length > 0) {
                matchedPermissionNames.forEach(name => {
                    if (!this.selectedPermissionNames.includes(name)) {
                        this.selectedPermissionNames.push(name);
                    }
                });

                if (!this.disabledAuthorityLimitItemTypes.includes(authorityLimitsPermission.authorityLimitItemType)) {
                    this.disabledAuthorityLimitItemTypes.push(authorityLimitsPermission.authorityLimitItemType);
                }
            }
        });

        this.getData();

        this.isLoading$.next(false);
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    authorityLimitItemTypeFilterChanged($event: AuthorityLimitItemTypeEnum) {
        this.dataSource.authorityLimitItemType = $event.toString() == 'All' ? null : +AuthorityLimitItemTypeEnum[$event];
        this.getData();
    }

    authorityLimitConfigurationSelected(config: AuthorityLimitConfiguration) {
        const permissionId = this.getPermissionIdByName(config.permissionName);
        let index = this.selectedPermissionNames.findIndex(a => a == config.permissionName);

        if (index > -1) {
            this.selectedPermissionNames.splice(index, 1);
        } else {
            this.selectedPermissionNames.push(config.permissionName);
        }

        index = this.disabledAuthorityLimitItemTypes.findIndex(a => a == config.authorityLimitItemType);
        if (index > -1) {
            this.disabledAuthorityLimitItemTypes.splice(index, 1);
        } else {
            this.disabledAuthorityLimitItemTypes.push(config.authorityLimitItemType);
        }

        if (permissionId > -1) {
            index = this.role.permissionIds.findIndex(s => s == permissionId);
            if (index > -1) {
                this.role.permissionIds.splice(index, 1);
            } else {
                this.role.permissionIds.push(permissionId);
            }
        }
    }

    onValueChange(updatedRow: AuthorityLimitConfiguration): void {
        const index = this.editedAuthorityLimits.findIndex(r => r.authorityLimitConfigurationId === updatedRow.authorityLimitConfigurationId);

        if (index > -1) {
            this.editedAuthorityLimits[index] = { ...updatedRow };
        } else {
            this.editedAuthorityLimits.push({ ...updatedRow });
        }

        this.dataSource.editedAuthorityLimits = this.editedAuthorityLimits;
    }

    getPermissionIdByName(permissionName: string): number {
        let permissionId = -1;

        this.authorityLimitsPermissions.forEach(item => {
            if (item.permissions.some(s => s.name === permissionName)) {
                const permission = item.permissions.find(s => s.name.toLowerCase() == permissionName.toLowerCase());
                permissionId = permission.id;
            }
        });

        return permissionId;
    }

    reset(skipHandleExistingRolePermissions: boolean) {
        this.loadingMessage$.next('loading...please wait');

        this.paginator.pageIndex = 0;
        this.paginator.pageSize = 5;

        this.selectedPermissionNames = [];
        this.disabledAuthorityLimitItemTypes = [];

        this.dataSource.authorityLimitItemType = null;

        this.form?.patchValue({
            authorityLimitItemTypeFilter: 'All',
        });

        if (!this.isReadOnly) {
            this.toggleIsReadOnly()
        }

        if (this.roleId > -1) {
            if (!skipHandleExistingRolePermissions) {
                this.handleExistingRolePermissions();
            } else {
                this.getRole();
            }
        } else {
            this.editedAuthorityLimits = [];
            this.dataSource.editedAuthorityLimits = []
            this.getData()
        }
    }

    save() {
        this.isLoading$.next(true);
        this.loadingMessage$.next('saving...please wait');

        if (this.roleId > -1) {
            this.roleService.editRole(this.role).subscribe(_ => {
                this.reset(true);
            });
        } else {
            this.authorityLimitService.updateAuthorityLimits(this.editedAuthorityLimits).subscribe(_ => {
                this.reset(false);
                this.isLoading$.next(false);
            });
        }
    }

    isSelected($event: AuthorityLimitConfiguration): boolean {
        return this.selectedPermissionNames.some(s => s == $event.permissionName);
    }

    isDisabled($event: AuthorityLimitConfiguration): boolean {
        return (this.disabledAuthorityLimitItemTypes.includes($event.authorityLimitItemType) && !this.isSelected($event)) || this.isReadOnly;
    }

    isEdited($event: AuthorityLimitConfiguration): boolean {
        return this.editedAuthorityLimits.some(r => r.authorityLimitConfigurationId === $event.authorityLimitConfigurationId);
    }

    toggleIsReadOnly() {
        this.isReadOnly = !this.isReadOnly;
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getAuthorityLimitConfigurationType($event: AuthorityLimitConfigurationTypeEnum) {
        return this.formatLookup(AuthorityLimitConfigurationTypeEnum[$event]);
    }

    getAuthorityLimitValueType($event: AuthorityLimitValueTypeEnum) {
        return this.formatLookup(AuthorityLimitValueTypeEnum[$event]);
    }

    getAuthorityLimitItemType($event: AuthorityLimitItemTypeEnum) {
        return this.formatLookup(AuthorityLimitItemTypeEnum[$event]);
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'authorityLimitItemType', show: true },
            { def: 'authorityLimitValueType', show: true },
            { def: 'authorityLimitConfigurationType', show: true },
            { def: 'value', show: true },
            { def: 'permissionName', show: true },
            { def: 'actions', show: this.roleId > -1 }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    openUserSearchDialog($event: AuthorityLimitConfiguration) {
        const dialogRef = this.dialog.open(UserSearchDialogComponent, {
            width: '70%',
            disableClose: true,
            data: {
                title: `Users with permission: (${$event.permissionName}) for authority limit type: (${this.getAuthorityLimitItemType($event.authorityLimitItemType)})`,
                permissions: [$event.permissionName],
                isReadOnly: true
            }
        });
    }
}
