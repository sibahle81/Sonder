import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ListComponent } from '../../list-component/list.component';
import { Rule } from '../shared/models/rule';
import { RuleListDatasource } from './rule-list.datasource';
@Component({
    templateUrl: '../../list-component/list.component.html'
})
export class RuleListComponent extends ListComponent implements OnInit {
    constructor(
        alertService: AlertService,
        router: Router,
        dataSource: RuleListDatasource) {

        super(alertService, router, dataSource, 'rules-engine/rule-details', 'Rules', 'Rules');
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Rule) => `${row.name}` },
            { columnDefinition: 'code', header: 'Code', cell: (row: Rule) => `${row.code}` },
            { columnDefinition: 'description', header: 'Description', cell: (row: Rule) => `${row.description}` }
        ];
    }
}
