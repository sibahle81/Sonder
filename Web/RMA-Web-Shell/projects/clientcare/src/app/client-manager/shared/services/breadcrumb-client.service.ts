import { Injectable } from '@angular/core';
import { ClientService } from './client.service';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';
import { Client } from '../Entities/client';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Injectable()
export class BreadcrumbClientService {

    constructor(
        private readonly clientService: ClientService,
        private readonly appEventsManager: AppEventsManager) {
    }

    private createClientManagerBreadcrumb(): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = 'Client Manager';
        breadcrumb.url = 'client-manager';
        return breadcrumb;
    }

    private createClientBreadcrumb(client: Client): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = `Client - ${client.name}`;
        if (client.lastName && client.lastName !== '') { breadcrumb.title += ` ${client.lastName}`; }
        breadcrumb.url = `client-manager/client-details/${client.id}`;
        return breadcrumb;
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createClientManagerBreadcrumb());

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }

    setSubClientBreadcrumb(title: string, clientId: number): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createClientManagerBreadcrumb());

        this.clientService.getClient(clientId).subscribe(client => {
            const clientBreadcrumb = this.createClientBreadcrumb(client);
            breadCrumbs.push(clientBreadcrumb);

            const currentBreadcrumb = new Breadcrumb();
            currentBreadcrumb.title = title;
            breadCrumbs.push(currentBreadcrumb);

            this.appEventsManager.setBreadcrumb(breadCrumbs);
        });
    }

    setSubClientBreadcrumbWithClient(title: string, client: Client): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createClientManagerBreadcrumb());

        const clientBreadcrumb = this.createClientBreadcrumb(client);
        breadCrumbs.push(clientBreadcrumb);

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }
}
