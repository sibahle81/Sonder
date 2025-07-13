import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PolicyInsuredLifeLastViewedListDataSource } from './policy-insured-life-last-viewed-list.datasource';

import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { InsuredLife } from '../../shared/entities/insured-life';


@Component({
    templateUrl: './policy-insured-life-last-viewed-list.component.html',
    selector: 'policy-insured-life-last-viewed'
})
export class PolicyInsuredLifeLastViewedListComponent extends ListComponent implements OnInit {
    policyId: number;
    get isLoading(): boolean { return this.privateDataSource.isLoading; }
    titlePluralNew: string;

    constructor(
        alertService: AlertService,
        router: Router,
        private readonly privateDataSource: PolicyInsuredLifeLastViewedListDataSource) {
        super(alertService, router, privateDataSource, 'clientcare/policy-manager/insured-life-details/edit', 'insured lives', 'policy');
        this.hideAddButton = true;
        this.titlePluralNew = 'Insured Lives';
        privateDataSource.defaultSortColumn = 'lastName';
    }


    getData(data: any): void {
        this.privateDataSource.getData(data);
    }

    getColor(inuredLife: InsuredLife): string {
        switch (inuredLife.status.toLowerCase()) {
        case 'pendingcancellation':
            return 'orange';
        case 'cancelled':
            return 'crimson';
        case 'active':
            return 'lawngreen';
        default:
        }
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'firstName', header: 'First Name', cell: (row: InsuredLife) => `${row.name}` },
            { columnDefinition: 'lastName', header: 'Last Name', cell: (row: InsuredLife) => `${row.surname}` },
            { columnDefinition: 'designation', header: 'Designation', cell: (row: InsuredLife) => `${row.designation}` },
            { columnDefinition: 'dateOfBirth', header: 'Date of Birth', cell: (row: InsuredLife) => `${row.dateOfBirth}` },
            { columnDefinition: 'referenceNumber', header: 'Reference Number', cell: (row: InsuredLife) => `${row.referenceNumber}` }
        ];
    }
}
