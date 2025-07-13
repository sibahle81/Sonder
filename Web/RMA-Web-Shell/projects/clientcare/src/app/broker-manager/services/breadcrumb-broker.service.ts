import { Injectable } from '@angular/core';

import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RepresentativeService } from './representative.service';
import { Representative } from '../models/representative';

@Injectable()
export class BreadcrumbBrokerService {

    constructor(
        private readonly brokerService: RepresentativeService,
        private readonly appEventsManager: AppEventsManager) {
    }

    private createbrokerManagerBreadcrumb(): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = 'Brokerage Manager';
        breadcrumb.url = 'broker-manager';
        return breadcrumb;
    }

    private createbrokerBreadcrumb(broker: Representative): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = `broker - ${broker.name}`;
        if (broker.name && broker.surnameOrCompanyName !== '') { breadcrumb.title += ` ${broker.surnameOrCompanyName}`; }
        breadcrumb.url = `broker-manager/broker-details/${broker.id}`;
        return breadcrumb;
    }

    setBreadcrumb(title: string): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createbrokerManagerBreadcrumb());

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }

    setSubbrokerBreadcrumb(title: string, brokerId: number): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createbrokerManagerBreadcrumb());

        this.brokerService.getBroker(brokerId).subscribe(broker => {
            const brokerBreadcrumb = this.createbrokerBreadcrumb(broker);
            breadCrumbs.push(brokerBreadcrumb);

            const currentBreadcrumb = new Breadcrumb();
            currentBreadcrumb.title = title;
            breadCrumbs.push(currentBreadcrumb);

            this.appEventsManager.setBreadcrumb(breadCrumbs);
        });
    }

    setSubbrokerBreadcrumbWithbroker(title: string, broker: Representative): void {
        const breadCrumbs = new Array<Breadcrumb>();
        breadCrumbs.push(this.createbrokerManagerBreadcrumb());

        const brokerBreadcrumb = this.createbrokerBreadcrumb(broker);
        breadCrumbs.push(brokerBreadcrumb);

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadCrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadCrumbs);
    }
}
