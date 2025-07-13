import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { GroupLastViewedListDataSource } from './group-last-viewed-list.datasource';
import { Group } from '../../shared/Entities/group';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';



@Component({
    templateUrl: './group-last-viewed-list.component.html',
    selector: 'group-last-viewed'
})
export class GroupLastViewedListComponent extends ListComponent {
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        router: Router,
        private readonly privateDataSource: GroupLastViewedListDataSource) {
        super(alertService, router, privateDataSource, 'clientcare/client-manager/group-details', 'Group', 'Groups');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Group) => `${row.name}` },
            { columnDefinition: 'registrationNumber', header: 'Registration Number', cell: (row: Group) => `${row.registrationNumber}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Group) => `${row.description}` }
        ];
    }
}
