import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Group } from '../../shared/Entities/group';
import { GroupClientListDatasource } from './group-client-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';

@Component({

    selector: 'group-client-list',
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class GroupClientListComponent extends ListFilteredComponent implements OnInit {

    get isLoading(): boolean {

        if (!this.privateDataSource) { return true; }
        return this.privateDataSource.isLoading;
    }

    constructor(
        router: Router,
        private readonly privateDataSource: GroupClientListDatasource) {
        super(router, privateDataSource, 'client-manager/client-details', 'clients', 'Group');
    }

    ngOnInit(): void {

        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Client Name', cell: (row: Group) => `${row.name}` }
        ];
    }
}
