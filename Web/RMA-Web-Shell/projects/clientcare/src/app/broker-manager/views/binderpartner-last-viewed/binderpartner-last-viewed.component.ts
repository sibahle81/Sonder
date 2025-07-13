import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { BinderPartnerLastViewedListDataSource } from '../../datasources/binderpartner-last-viewed-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { Brokerage } from '../../models/brokerage';

@Component({

    selector: 'binderpartner-last-viewed',
    templateUrl: './binderpartner-last-viewed.component.html'
})
export class BinderPartnerLastViewedComponent extends ListComponent implements OnInit {

    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        router: Router,
        private readonly privateDataSource: BinderPartnerLastViewedListDataSource,
        alertService: AlertService) {

        super(alertService, router, privateDataSource, 'clientcare/broker-manager/brokerage-details', 'Binder Partner', 'Binder Partners', '', false, true);
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
