import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LastViewedItem } from '../../models/last-viewed-item';
import { BenefitLastViewedListDataSource } from '../../datasources/benefit-last-viewed-list.datasource';

@Component({

    selector: 'benefit-last-viewed',
    templateUrl: './benefit-last-viewed-list.component.html',
    providers: [DatePipe]
})
export class BenefitLastViewedListComponent extends ListComponent {
    @Input() type: string;
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        private readonly datePipe: DatePipe,
        private readonly privateRouter: Router,
        private readonly privateDataSource: BenefitLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'product-manager/product-details', 'Benefit', 'Benefits');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
            this.columns = [
                { columnDefinition: 'name', header: 'Name', cell: (row: LastViewedItem) => `${row.name}` },
                { columnDefinition: 'code', header: 'Code', cell: (row: LastViewedItem) => `${row.code}` },
                { columnDefinition: 'modifiedBy', header: 'Added/Modified by', cell: (row: LastViewedItem) => `${row.modifiedBy}` },
                { columnDefinition: 'modifiedDate', header: 'Added/Modified Date', cell: (row: LastViewedItem) => `${row.modifiedDate}` },
                { columnDefinition: 'statusText', header: 'Status', cell: (row: LastViewedItem) => `${row.statusText}` }           ];
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['clientcare/product-manager/benefit-details', item.itemId]);
    }
}
