import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { RuleLastViewedListDataSource } from './rule-last-viewed-list.datasource';
import { LastViewedItem } from '../shared/models/last-viewed-item';

import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ListComponent } from '../../list-component/list.component';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    templateUrl: './rule-last-viewed-list.component.html',
    // tslint:disable-next-line:component-selector
    selector: 'rule-last-viewed'
})
export class RuleLastViewedListComponent extends ListComponent implements OnInit {
    @Input() type: string;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    isLoading: false;

    ngOnInit(): void {
        this.dataSource.setControls(this.paginator, this.sort);
        this.dataSource.clearData();
    }

    constructor(
        alertService: AlertService,
        private readonly privateRouter: Router,
        public readonly privateDataSource: RuleLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'rules-engine/rule-details', '', '');
        this.hideAddButton = true;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: LastViewedItem) => `${row.name}` },
            { columnDefinition: 'code', header: 'Code', cell: (row: LastViewedItem) => `${row.code}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: LastViewedItem) => `${row.description}` }
        ];
    }

    onSelect(item: any): void {
        this.privateRouter.navigate(['rules-engine/rule-details', item.id]);
    }
}
