import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ListComponent } from '../../list-component/list.component';
import { LastViewedItem } from '../shared/models/last-viewed-item';
import { RuleLastViewedListDataSource } from './rule-last-viewed-list.datasource';
@Component({
    templateUrl: './rule-last-viewed-list.component.html',
    // tslint:disable-next-line:component-selector
    selector: 'rule-last-viewed'
})
export class RuleLastViewedListComponent extends ListComponent implements OnInit {
    @Input() type: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('filter') filter: ElementRef;
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
