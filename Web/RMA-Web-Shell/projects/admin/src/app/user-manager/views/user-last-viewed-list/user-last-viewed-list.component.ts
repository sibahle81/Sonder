import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserLastViewedListDataSource } from './user-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { User } from 'projects/shared-models-lib/src/lib/security/user';

@Component({
    templateUrl: './user-last-viewed-list.component.html',
// tslint:disable-next-line: component-selector
    selector: 'user-last-viewed'
})
export class UserLastViewedListComponent extends ListComponent {
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        router: Router,
        private readonly privateDataSource: UserLastViewedListDataSource) {
        super(alertService, router, privateDataSource, 'user-manager/user-details', 'User', 'Users');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: User) => `${row.name}` },
            { columnDefinition: 'email', header: 'Email', cell: (row: User) => `${row.email}` },
            { columnDefinition: 'roleName', header: 'Role', cell: (row: User) => `${row.roleName}` },
            { columnDefinition: 'status', header: 'Status', cell: (row: User) => `${row.status}` }
        ];
    }
}
