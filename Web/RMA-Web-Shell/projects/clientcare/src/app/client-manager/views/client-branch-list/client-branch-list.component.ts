import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Branch } from '../../shared/Entities/branch';
import { ClientBranchListDatasource } from './client-branch-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';

@Component({

    selector: 'client-branches',
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class ClientBranchListComponent extends ListFilteredComponent implements OnInit {

    constructor(
        router: Router,
        dataSource: ClientBranchListDatasource) {
        super(router, dataSource, 'client-manager/branch-details/edit', 'branches', 'client');
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Branch) => `${row.name}` }
        ];
    }
}
