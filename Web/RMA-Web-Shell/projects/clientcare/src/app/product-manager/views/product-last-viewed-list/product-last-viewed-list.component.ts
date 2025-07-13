import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ProductLastViewedListDataSource } from '../../datasources/product-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { LastViewedItem } from '../../models/last-viewed-item';

@Component({
    templateUrl: './product-last-viewed-list.component.html',
    selector: 'product-last-viewed'
})
export class ProductLastViewedListComponent extends ListComponent implements OnInit {
    @Input() type: string;
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        private readonly privateRouter: Router,
        private readonly privateDataSource: ProductLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'product-manager/product-details', 'Product', 'Products', '', false, false);
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
            this.columns = [
                { columnDefinition: 'name', header: 'Name', cell: (row: LastViewedItem) => `${row.name}` },
                { columnDefinition: 'code', header: 'Code', cell: (row: LastViewedItem) => `${row.code}` },
                { columnDefinition: 'description', header: 'Description', cell: (row: LastViewedItem) => `${row.description}` },
                { columnDefinition: 'modifiedBy', header: 'Added/Modified by', cell: (row: LastViewedItem) => `${row.modifiedBy}` },
                { columnDefinition: 'modifiedDate', header: 'Added/Modified Date', cell: (row: LastViewedItem) => `${row.modifiedDate}` },
                { columnDefinition: 'statusText', header: 'Status', cell: (row: LastViewedItem) => `${row.statusText}` }
            ];
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['clientcare/product-manager/product-details', item.itemId]);
    }
}
