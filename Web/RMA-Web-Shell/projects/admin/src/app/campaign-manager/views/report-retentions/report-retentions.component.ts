import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RetentionReportDataSource } from './report-retentions.datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Retention } from '../report-shared/retention';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';

@Component({
    templateUrl: './report-retentions.component.html'
})
export class RetentionsReportComponent extends ListComponent implements OnInit {

    isLoading:Boolean;
    isDeleting:Boolean;
    constructor(
        router: Router,
        alertService: AlertService,
        reportDataSource: RetentionReportDataSource
    ) {
        super(alertService, router, reportDataSource, '', 'Retention', 'Retentions', '', true);
    }

    setupDisplayColumns(): void {
        this.columns = [
            // { columnDefinition: 'clientId', header: 'ID', cell: (row: Retention) => row.clientId },
            { columnDefinition: 'clientName', header: 'Name', cell: (row: Retention) => row.clientName }
        ];
    }
}
