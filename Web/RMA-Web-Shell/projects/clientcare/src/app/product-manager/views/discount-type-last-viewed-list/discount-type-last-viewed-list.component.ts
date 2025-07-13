import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { DiscountTypeLastViewedListDataSource } from '../discount-type-last-viewed/discount-type-last-viewed-list.datasource';
import { LastViewedItem } from '../../models/last-viewed-item';

@Component({
    templateUrl: './discount-type-last-viewed-list.component.html',
    selector: 'discount-type-last-viewed'
})
export class DiscountTypeLastViewedListComponent extends ListComponent implements OnInit {
    @Input() type: string;
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        private readonly privateRouter: Router,
        private readonly privateDataSource: DiscountTypeLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'product-manager/discount-type-details', 'Discount Type', 'Discount Types', '', false, false);
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
            this.columns = [
                { columnDefinition: 'name', header: 'Name', cell: (row: LastViewedItem) => `${row.name}` },
                { columnDefinition: 'code', header: 'Code', cell: (row: LastViewedItem) => `${row.code}` },
                { columnDefinition: 'description', header: 'Description', cell: (row: LastViewedItem) => `${row.description}` },
                { columnDefinition: 'modifiedBy', header: 'Added/Modified by', cell: (row: LastViewedItem) => `${row.modifiedBy}` },
                { columnDefinition: 'modifiedDate', header: 'Added/Modified Date', cell: (row: LastViewedItem) => `${row.modifiedDate}` },
                { columnDefinition: 'isActive', header: 'Active', cell: (row: LastViewedItem) => `${row.isActive}` }
            ];
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['clientcare/product-manager/discount-type-details', item.itemId]);
    }
}
