import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientCoverListDataSource } from './client-cover-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { ClientCoverView } from '../../shared/entities/client-cover-view';

@Component({

    selector: 'client-cover',
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class ClientCoverListComponent extends ListFilteredComponent implements OnInit {

    constructor(
        router: Router,
        dataSource: ClientCoverListDataSource) {
        super(router, dataSource, '', 'products', 'policy');
        this.showActionsLink = false;
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: ClientCoverView) => `${row.formattedName}` },
            { columnDefinition: 'status', header: 'Status', cell: (row: ClientCoverView) => `${row.productStatus}` },
            //{ columnDefinition: 'benefitSetName', header: 'Benefit Set', cell: (row: ClientCoverView) => `${row.benefitSetName ? row.benefitSetName : '-'}` },
            { columnDefinition: 'numberOfEmployees', header: 'No. of Insured Lives', cell: (row: ClientCoverView) => `${row.numberOfEmployees ? row.numberOfEmployees : 0}` },
            { columnDefinition: 'premium', header: 'Premium', cell: (row: ClientCoverView) => `${row.premium ? row.premium : 0}` },
        ];
    }
}
