import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClientLastViewedDataSource } from './client-last-viewed.datasource';
import { Client } from '../../shared/Entities/client';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';


@Component({
    templateUrl: './client-last-viewed.component.html',
    selector: 'client-last-viewed'
})
export class ClientLastViewedComponent extends ListComponent {
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        router: Router,
        private readonly privateDataSource: ClientLastViewedDataSource) {
        super(alertService, router, privateDataSource, 'clientcare/client-manager/client-profile', 'Client', 'Clients');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'clientFullName', header: 'Name', cell: (row: Client) => `${row.clientFullName}` },
            { columnDefinition: 'referenceNumber', header: 'Reference', cell: (row: Client) => `${row.referenceNumber}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Client) => `${row.description}` }
        ];
    }
}
