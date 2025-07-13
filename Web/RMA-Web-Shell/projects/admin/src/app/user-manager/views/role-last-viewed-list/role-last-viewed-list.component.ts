import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { RoleLastViewedListDataSource } from './role-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';



@Component({
    templateUrl: './role-last-viewed-list.component.html',
    selector: 'role-last-viewed'
})
export class RoleLastViewedListComponent extends ListComponent {
    hideAddButton: boolean;
    columns: { columnDefinition: string; header: string; cell: (row: User) => string; }[];
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        router: Router,
        private readonly privateDataSource: RoleLastViewedListDataSource) {
        super(alertService, router, privateDataSource, 'user-manager/role-details', 'Role', 'Roles');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: User) => `${row.name}` }
        ];
    }
}
