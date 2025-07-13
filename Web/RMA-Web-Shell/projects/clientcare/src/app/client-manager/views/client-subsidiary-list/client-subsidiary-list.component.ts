import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';

import { ClientSubsidiaryListDataSource } from 'projects/clientcare/src/app/client-manager/views/client-subsidiary-list/client-subsidiary-list.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';


@Component({
    templateUrl: './client-subsidiary-list.component.html',

    selector: 'client-subsidiary-list'
})
export class ClientSubsidiaryListComponent extends ListFilteredComponent implements OnInit {
    client: Client;
    isRemove = false;
    selectedClient: Client;
    canAdd: boolean;

    get isNotCompany(): boolean {
        if (!this.client) { return true; }
        return this.client.clientTypeId !== 3;
    }

    get isCompanyOrAffinity(): boolean {
        if (!this.client) { return true; }
        return this.client.clientTypeId !== 1;
    }

    constructor(
        private readonly alertService: AlertService,
        private readonly appEventsManager: AppEventsManager,
        private readonly clientService: ClientService,
        private readonly privateRouter: Router,
        private readonly addressListDataSource: ClientSubsidiaryListDataSource) {
        super(privateRouter, addressListDataSource, '', 'subsidiaries', 'client');

        this.privateRouter.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngOnInit(): void {
        this.checkUserAddPermission();
        super.ngOnInit();
    }

    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Client Subsidiary');
    }

    getData(data: any): void {
        this.client = data;
        if (this.isCompanyOrAffinity) { super.getData(this.client.id); }
    }

    onViewClick(item: Client): void {
        this.privateRouter.navigate(['clientcare/client-manager/client-details', item.id]);
    }

    onRemoveClick(item: Client): void {
        this.selectedClient = item;
        this.isRemove = true;
    }

    cancel(): void {
        this.isRemove = false;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'clientFullName', header: 'Name', cell: (row: Client) => `${row.clientFullName}` },
            { columnDefinition: 'referenceNumber', header: 'Reference', cell: (row: Client) => `${row.referenceNumber}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Client) => `${row.description}` }
        ];
    }

    removeSubsidiary(): void {
        this.appEventsManager.loadingStart('Removing subsidiary...');
        this.clientService.editClientSubsidiary(this.selectedClient.id, null).subscribe(() => {
            super.getData(this.client.id);
            this.isRemove = false;
            this.alertService.success(`Client ${this.selectedClient.name} removed as a subsidiary of ${this.client.name}`);

            this.appEventsManager.loadingStop();
        });
    }

    addSubsidiary(): void {
        this.privateRouter.navigate([`clientcare/client-manager/client-subsidiary-details/add/${this.client.id}`]);
    }
}
