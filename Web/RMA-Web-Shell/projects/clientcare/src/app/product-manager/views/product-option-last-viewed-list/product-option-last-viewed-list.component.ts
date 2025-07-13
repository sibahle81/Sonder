import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ProductOptionLastViewedListDataSource } from '../../datasources/product-option-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { LastViewedItem } from '../../models/last-viewed-item';

@Component({
    selector: 'product-option-last-viewed',
    templateUrl: './product-option-last-viewed-list.component.html',
    providers: [DatePipe]
})
export class ProductOptionLastViewedListComponent extends ListComponent {
    @Input() type: string;
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        private readonly datePipe: DatePipe,
        private readonly privateRouter: Router,
        private readonly privateDataSource: ProductOptionLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'product-manager/product-option', 'Product Option', 'Product Options');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
            this.columns = [
                { columnDefinition: 'name', header: 'Name', cell: (row: LastViewedItem) => `${row.name}` },
                { columnDefinition: 'code', header: 'Code', cell: (row: LastViewedItem) => `${row.code}` },
                { columnDefinition: 'description', header: 'Description', cell: (row: LastViewedItem) => `${row.description}` },
                { columnDefinition: 'modifiedBy', header: 'Added/Modified by', cell: (row: LastViewedItem) => `${row.modifiedBy}` },
                { columnDefinition: 'modifiedDate', header: 'Added/Modified Date', cell: (row: LastViewedItem) => `${row.modifiedDate}` },
                { columnDefinition: 'statusText', header: 'Status', cell: (row: LastViewedItem) => `${row.statusText}` }    ];
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['clientcare/product-manager/product-option/', item.itemId]);
    }
}
