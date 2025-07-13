import { Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { QlinkTransactionsDataSource } from './qlink-transactions.datasource';

import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { QLinkTransactionTypeEnum } from 'projects/shared-models-lib/src/lib/enums/qlink-transaction-type-enum';

@Component({
    selector: 'qlink-transactions',
    templateUrl: './qlink-transactions.component.html',
    styleUrls: ['./qlink-transactions.component.css']
})
export class QlinkTransactionsSearchComponent implements OnChanges {

    @Input() itemType: string;
    @Input() itemId: number;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: QlinkTransactionsDataSource;

    constructor(
        private readonly policyService: PolicyService
    ) {
        this.dataSource = new QlinkTransactionsDataSource(this.policyService);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.itemId && this.itemType) {
            this.dataSource.itemId = this.itemId;
            this.dataSource.itemType = this.itemType;
            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, null);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup) { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'requestReferenceNumber', show: true },
            { def: 'qlinkTransactionTypeId', show: true },
            { def: 'statusCode', show: true },
            { def: 'amount', show: true },
            { def: 'responseMessage', show: true },
            { def: 'isFalsePositive', show: true },
            { def: 'modifiedDate', show: true },
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    getTransactionType(qlinkTransactionType: QLinkTransactionTypeEnum) {
        return this.formatLookup(QLinkTransactionTypeEnum[qlinkTransactionType]);
    }

    getRequestReferenceNumber(request: string): string {
        const qlinkRequest = JSON.parse(request);
        return qlinkRequest?.ReferenceNumber ? qlinkRequest.ReferenceNumber : 'N/A';
    }

    getRequestAmount(request: string): string {
        const qlinkRequest = JSON.parse(request);
        return qlinkRequest?.Amount ? qlinkRequest.Amount : 'N/A';
    }

    getResponseMessage(response: string): string {
        const qlinkResponse = JSON.parse(response);
        return qlinkResponse?.Message ? qlinkResponse.Message : qlinkResponse?.message ? qlinkResponse.message : 'N/A';
    }
}
