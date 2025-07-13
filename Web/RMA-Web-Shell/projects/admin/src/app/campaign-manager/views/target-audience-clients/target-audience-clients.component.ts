import { Component } from '@angular/core';

import { TargetAudienceBaseComponent } from '../shared/target-audience-base.component';
import { TargetAudienceService } from '../../shared/services/target-audience.service';
import { ClientService } from 'projects/clientcare/src/app/client-manager/shared/services/client.service';

@Component({
    styleUrls: ['./target-audience-clients.component.css'],
    templateUrl: './target-audience-clients.component.html',
    // tslint:disable-next-line:component-selector
    selector: 'target-audience-client'
})
export class TargetAudienceClientComponent extends TargetAudienceBaseComponent {

    get showClientCategories(): boolean {
        return this.targetCategoryId > 2;
    }

    get selectClient(): boolean {
        return this.targetCategoryId === 2;
    }

    constructor(
        audienceService: TargetAudienceService,
        private readonly clientService: ClientService
    ) {
        super('Client', audienceService);
    }

    setTargetCategories(items: any[], includeIndividual: boolean): void {
        this.targetCategories = items;
        if (includeIndividual) {
          this.targetCategories.unshift(this.getLookupItem(2, 'SelectClient'));
        }
        this.targetCategories.unshift(this.getLookupItem(1, 'AllClients'));
    }

    loadEntityList(): void {
        this.entityList = [];

        // this.isLoading = true;
        // this.clientService.getClients().subscribe(
        //     data => {
        //         const list = data.map(value => {
        //             const item = new LookupItem();
        //             item.id = value.id;
        //             item.name = this.getClientName(value);
        //             item.parentId = value.clientTypeId;
        //             return item;
        //         });
        //         this.entityList = list.sort(this.comparer);
        //         this.isLoading = false;
        //     }
        // );
    }

    // getClientName(client: any): string {
    //     switch (client.clientTypeId) {
    //         case 1:
    //             if (client.idNumber && client.idNumber !== '') {
    //                 return `${client.name} (${client.idNumber})`;
    //             } else if (client.passportNumber && client.passportNumber !== '') {
    //                 return `${client.name} (${client.passportNumber})`;
    //             } else {
    //                 return `${client.name} (Individual)`;
    //             }
    //         case 2:
    //             if (client.registrationNumber && client.registrationNumber !== '') {
    //                 return `${client.name} (${client.registrationNumber})`;
    //             } else if (client.referenceNumber && client.referenceNumber !== '') {
    //                 return `${client.name} (${client.referenceNumber})`;
    //             } else {
    //                 return `${client.name} (Affinity)`;
    //             }
    //         case 3:
    //             if (client.registrationNumber && client.registrationNumber !== '') {
    //                 return `${client.name} (${client.registrationNumber})`;
    //             } else if (client.referenceNumber && client.referenceNumber !== '') {
    //                 return `${client.name} (${client.referenceNumber})`;
    //             } else {
    //                 return `${client.name} (Company)`;
    //             }
    //         default:
    //             return `${client.name} (Unknown client type)`;
    //     }
    // }
}
