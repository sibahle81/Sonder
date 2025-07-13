import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClientListDataSource } from './client-list.datasource';
import { Client } from '../../shared/Entities/client';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';

@Component({
    templateUrl: '../../../../../../shared-components-lib/src/lib/list-filtered-component/list-filtered.component.html'
})
export class ClientListComponent extends ListComponent implements OnInit {

    isLoading: boolean;
    itemsName: string;
    filterName: string;

    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: ClientListDataSource) {
        super(alertService, router, dataSource, 'client-manager/client-details', 'Client', 'Clients');
        this.hideAddButton = true;
        this.hideAddButtonText = 'Clients can be added through the new policy wizard.';
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'clientFullName', header: 'Name', cell: (row: Client) => `${row.clientFullName}` },
            { columnDefinition: 'referenceNumber', header: 'Reference', cell: (row: Client) => `${row.referenceNumber}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Client) => `${row.description}` }
        ];
    }
}
