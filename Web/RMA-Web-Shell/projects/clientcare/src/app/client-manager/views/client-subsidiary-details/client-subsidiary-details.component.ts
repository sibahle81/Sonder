import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { ClientSubsidiaryDetailsDataSource } from './client-subsidiary-details.datasource';
import { ListFilteredComponent } from 'projects/shared-components-lib/src/lib/list-filtered-component/list-filtered.component';
import { BreadcrumbClientService } from 'projects/clientcare/src/app/client-manager/shared/services/breadcrumb-client.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
    templateUrl: './client-subsidiary-details.component.html'
})
export class ClientSubsidiaryDetailsComponent extends ListFilteredComponent implements OnInit {
    isAdd: boolean;
    client: Client;
    selectedClient: Client;
    canEdit = true;
    canAdd = true;
    titlePlural: string;

    constructor(
        private readonly datasource: ClientSubsidiaryDetailsDataSource,
        private readonly breadcrumbService: BreadcrumbClientService,
        private readonly alertService: AlertService,
        private readonly appEventsManager: AppEventsManager,
        private readonly clientService: ClientService,
        private readonly activatedRoute: ActivatedRoute,
        private readonly privateRouter: Router) {
        super(privateRouter, datasource, '', 'addresses', 'client');
        datasource.isLoading = false;
        this.titlePlural = 'subsidiaries';
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.resetPermissions();
        this.checkUserAddPermission();
        this.appEventsManager.loadingStart('Loading client details...');

        this.activatedRoute.params.subscribe((params: any) => {
            this.getData(params.id);
            this.getClient(params.id);
        });
    }


    applyFilter(filterValue: string) {
        filterValue = filterValue.trim();
        filterValue = filterValue.toLowerCase();
        this.datasource.filter = filterValue;
    }

    clearFilter() {
        this.datasource.filter = '';
    }


    checkUserAddPermission(): void {
        this.canAdd = userUtility.hasPermission('Add Client Subsidiary');
    }

    resetPermissions(): void {
        this.canAdd = true;
        this.canEdit = true;
    }

    onSelect(item: Client): void {
        this.selectedClient = item;
        this.isAdd = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'clientFullName', header: 'Name', cell: (row: Client) => `${row.clientFullName}` },
            { columnDefinition: 'referenceNumber', header: 'Reference', cell: (row: Client) => `${row.referenceNumber}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Client) => `${row.description}` }
        ];
    }

    getClient(clientId: number): void {
        this.clientService.getClient(clientId)
            .subscribe(client => {
                this.client = client;
                this.breadcrumbService.setSubClientBreadcrumbWithClient('Add a subsidiary', client);
            });
    }

    cancel(): void {
        this.isAdd = false;
    }

    addSubsidiary(): void {
        this.appEventsManager.loadingStart('Adding client subsidiary...');
        this.clientService.editClientSubsidiary(this.selectedClient.id, this.client.id).subscribe(() => {
            this.alertService.success(`Client ${this.selectedClient.name} added as a subsidiary of ${this.client.name}`);
            this.back();
        });
    }

    back(): void {
        this.privateRouter.navigate([`/clientcare/client-manager/client-details/${this.client.id}/6`]);
    }
}
