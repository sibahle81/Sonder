import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { BrokerageLastViewedListDataSource } from '../../datasources/brokerage-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { Brokerage } from '../../models/brokerage';

@Component({

    selector: 'brokerage-last-viewed',
    templateUrl: './brokerage-last-viewed.component.html'
})
export class BrokerageLastViewedComponent extends ListComponent implements OnInit {

    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        router: Router,
        private readonly privateDataSource: BrokerageLastViewedListDataSource,
        alertService: AlertService) {

        super(alertService, router, privateDataSource, 'clientcare/broker-manager/brokerage-details', 'Brokerage', 'Brokerages', '', false, true);
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Brokerage) => `${row.name}` },
            { columnDefinition: 'code', header: 'Code', cell: (row: Brokerage) => `${row.code}` },
            { columnDefinition: 'fspNumber', header: 'FSP Number', cell: (row: Brokerage) => `${row.fspNumber}` }
        ];
    }

}
