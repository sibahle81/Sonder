import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Department } from '../../shared/Entities/department';
import { ClientDepartmentListDatasource } from './client-department-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';

@Component({

    selector: 'client-departments',
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class ClientDepartmentListComponent extends ListFilteredComponent implements OnInit {

    constructor(
        router: Router,
        dataSource: ClientDepartmentListDatasource) {
        super(router, dataSource, 'client-manager/department-details/edit', 'departments', 'client');
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Department) => `${row.name}` }
        ];
    }
}
